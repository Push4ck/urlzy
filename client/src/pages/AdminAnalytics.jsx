import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { BarChart3, TrendingUp, Users, Link as LinkIcon, MousePointer, Activity, RefreshCw } from "lucide-react";

// Clean Line Chart Component with Filters
const UserGrowthChart = ({ data, timeFilter, onTimeFilterChange }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  // Filter data based on selected time period
  const getFilteredData = () => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let daysBack = 30;

    switch (timeFilter) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
      default: daysBack = 30;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return data.filter(d => new Date(d.date) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No growth data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...filteredData.map(d => d.users));
  const minValue = Math.min(...filteredData.map(d => d.users));

  // Use full container dimensions
  const width = 800;
  const height = 300;
  const padding = 60;

  const xScale = (width - 2 * padding) / (filteredData.length - 1 || 1);
  const yScale = (height - 2 * padding) / (maxValue - minValue || 1);

  const points = filteredData.map((d, i) => ({
    x: padding + i * xScale,
    y: height - padding - ((d.users - minValue) * yScale),
    date: d.date,
    users: d.users,
    index: i
  }));

  // Create smooth curve using Catmull-Rom spline
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Catmull-Rom spline control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const smoothPath = createSmoothPath(points);

  return (
    <div className="w-full">
      {/* Filter Buttons */}
      <div className="flex justify-center mb-6 space-x-2">
        {[
          { key: '7d', label: '7 Days' },
          { key: '30d', label: '30 Days' },
          { key: '90d', label: '90 Days' },
          { key: '1y', label: '1 Year' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => onTimeFilterChange(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeFilter === filter.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          onMouseMove={(e) => {
            if (hoveredPoint) {
              const svgElement = e.currentTarget;
              const svgRect = svgElement.getBoundingClientRect();
              let x = e.clientX - svgRect.left;
              let y = e.clientY - svgRect.top;

              // Convert to SVG coordinate system
              const svgX = (x / svgRect.width) * width;
              const svgY = (y / svgRect.height) * height;

              // Clamp to chart area
              x = Math.max(padding, Math.min(x, svgRect.width - padding));
              y = Math.max(padding, Math.min(y, svgRect.height - padding));

              setMousePosition({ x, y, svgX, svgY, point: hoveredPoint });
            }
          }}
          onMouseLeave={() => {
            setHoveredPoint(null);
            setMousePosition(null);
          }}
        >
          {/* Definitions for blur effect */}
          <defs>
            <linearGradient id="blurGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12"/>
              <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02"/>
            </linearGradient>
            <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5"/>
            </filter>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = height - padding - (ratio * (height - 2 * padding));
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={padding - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500 font-medium"
                >
                  {Math.round(minValue + (maxValue - minValue) * ratio)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {points.filter((_, i) => {
            const step = Math.ceil(filteredData.length / 7);
            return i % step === 0 || i === filteredData.length - 1;
          }).map((point, i) => (
            <text
              key={i}
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 font-medium"
            >
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}

          {/* Hover line */}
          {mousePosition && hoveredPoint && (
            <line
              x1={mousePosition.x}
              y1={padding + 15}
              x2={mousePosition.x}
              y2={height - padding - 15}
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="2,2"
              opacity="0.8"
            />
          )}

          {/* Blur area fill under the line */}
          <path
            d={`${smoothPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#blurGradient)"
            filter="url(#blur)"
            opacity="0.8"
          />

          {/* Smooth line */}
          <path
            d={smoothPath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Invisible hover areas */}
          {points.map((point, i) => (
            <rect
              key={i}
              x={i === 0 ? point.x - xScale/2 : point.x - xScale/2}
              y={0}
              width={i === 0 || i === points.length - 1 ? xScale/2 : xScale}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseMove={(e) => {
                const svgElement = e.currentTarget.closest('svg');
                const svgRect = svgElement.getBoundingClientRect();
                const x = e.clientX - svgRect.left;
                const y = e.clientY - svgRect.top;

                // Ensure coordinates are within SVG bounds
                const clampedX = Math.max(0, Math.min(x, svgRect.width));
                const clampedY = Math.max(0, Math.min(y, svgRect.height));

                setMousePosition({ x: clampedX, y: clampedY, point });
              }}
              onMouseLeave={() => {
                setHoveredPoint(null);
                setMousePosition(null);
              }}
              className="cursor-pointer"
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {mousePosition && hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none z-10 transform -translate-x-1/2"
            style={{
              left: `${(mousePosition.x / width) * 100}%`,
              top: `${((mousePosition.y - 5) / height) * 100}%`
            }}
          >
            <div className="text-center">
              <div className="font-bold">{hoveredPoint.users} users</div>
              <div className="text-xs text-gray-300">
                {new Date(hoveredPoint.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalUrls: 0,
    totalClicks: 0,
    activeUsers: 0,
    recentActivity: [],
    topUrls: [],
    userGrowth: [],
    clickTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30d');

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const res = await axios.get(getApiUrl(`${API_ENDPOINTS.AUTH}/admin/analytics`));
      if (res.data?.success) {
        setAnalytics(res.data.data);
        if (isRefresh) {
          toast.success("Analytics refreshed");
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
                System Analytics
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Comprehensive overview of system performance and usage
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-fade-in-up animation-delay-200">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Users
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {analytics.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total URLs
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {analytics.totalUrls.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <MousePointer className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Clicks
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {analytics.totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Active Users
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {analytics.activeUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing URLs */}
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up animation-delay-400 h-96 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Top Performing URLs</h2>
              <p className="text-gray-600 mt-1">
                Most clicked shortened URLs system-wide
              </p>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              {analytics.topUrls.length > 0 ? (
                <div className="space-y-6">
                  {analytics.topUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                              {url.shortCode}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {url.originalUrl}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(url.clickCount / analytics.totalClicks) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {url.clickCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No URL data available yet.
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up animation-delay-400 h-96 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-600 mt-1">
                Latest system activity and user interactions
              </p>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent activity available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up animation-delay-600">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900">User Growth Trends</h2>
            <p className="text-gray-600 mt-1">
              Track user registration patterns and growth over time
            </p>
          </div>
          <div className="p-4">
            <UserGrowthChart
              data={analytics.userGrowth}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;