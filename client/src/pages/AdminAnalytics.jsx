import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  BarChart3,
  TrendingUp,
  Users,
  Link as LinkIcon,
  MousePointer,
  Activity,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

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
      case "7d":
        daysBack = 7;
        break;
      case "30d":
        daysBack = 30;
        break;
      case "90d":
        daysBack = 90;
        break;
      case "1y":
        daysBack = 365;
        break;
      default:
        daysBack = 30;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return data.filter((d) => new Date(d.date) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-[var(--clr-surface-a40)] mx-auto mb-4" />
          <p className="text-[var(--clr-surface-a50)]">
            No growth data available
          </p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...filteredData.map((d) => d.users));
  const minValue = Math.min(...filteredData.map((d) => d.users));

  // Use full container dimensions
  const width = 800;
  const height = 300;
  const padding = 10;

  const xScale = (width - 2 * padding) / (filteredData.length - 1 || 1);
  const yScale = (height - 2 * padding) / (maxValue - minValue || 1);

  const points = filteredData.map((d, i) => ({
    x: padding + i * xScale,
    y: height - padding - (d.users - minValue) * yScale,
    date: d.date,
    users: d.users,
    index: i,
  }));

  // Create smooth curve using Catmull-Rom spline
  const createSmoothPath = (points) => {
    if (points.length < 2) return "";

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
      <div className="lg:flex xs:grid xs:grid-cols-2 xs:gap-3 justify-center mb-6 space-x-2">
        {[
          { key: "7d", label: "7 Days" },
          { key: "30d", label: "30 Days" },
          { key: "90d", label: "90 Days" },
          { key: "1y", label: "1 Year" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => onTimeFilterChange(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeFilter === filter.key
                ? "bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] shadow-md"
                : "bg-[var(--clr-surface-a20)] text-[var(--clr-surface-a50)] hover:bg-[var(--clr-surface-a30)] cursor-pointer"
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
          className="block overflow-hidden"
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
          {/* Definitions for gradient */}
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="var(--clr-primary-a0)"
                stopOpacity="0.12"
              />
              <stop
                offset="50%"
                stopColor="var(--clr-primary-a10)"
                stopOpacity="0.06"
              />
              <stop
                offset="100%"
                stopColor="var(--clr-primary-a20)"
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - padding - ratio * (height - 2 * padding);
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="var(--clr-surface-a20)"
                  strokeWidth="1"
                />
                <text
                  x={padding - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs font-medium"
                  fill="var(--clr-surface-a50)"
                >
                  {Math.round(minValue + (maxValue - minValue) * ratio)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {points
            .filter((_, i) => {
              const step = Math.ceil(filteredData.length / 7);
              return i % step === 0 || i === filteredData.length - 1;
            })
            .map((point, i) => (
              <text
                key={i}
                x={point.x}
                y={height - padding + 20}
                textAnchor="middle"
                className="text-xs font-medium"
                fill="var(--clr-surface-a50)"
              >
                {new Date(point.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </text>
            ))}

          {/* Hover line */}
          {mousePosition && hoveredPoint && (
            <line
              x1={mousePosition.x}
              y1={padding + 15}
              x2={mousePosition.x}
              y2={height - padding - 15}
              stroke="var(--clr-primary-a0)"
              strokeWidth="2"
              strokeDasharray="2,2"
              opacity="0.8"
            />
          )}

          {/* Area fill under the line */}
          <path
            d={`${smoothPath} L ${points[points.length - 1].x} ${
              height - padding
            } L ${points[0].x} ${height - padding} Z`}
            fill="url(#chartGradient)"
          />

          {/* Smooth line */}
          <path
            d={smoothPath}
            fill="none"
            stroke="var(--clr-primary-a0)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Invisible hover areas */}
          {points.map((point, i) => (
            <rect
              key={i}
              x={i === 0 ? point.x - xScale / 2 : point.x - xScale / 2}
              y={0}
              width={i === 0 || i === points.length - 1 ? xScale / 2 : xScale}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseMove={(e) => {
                const svgElement = e.currentTarget.closest("svg");
                const svgRect = svgElement.getBoundingClientRect();
                const x = e.clientX - svgRect.left;
                const y = e.clientY - svgRect.top;

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
            className="absolute bg-[var(--clr-dark-a0)] text-[var(--clr-light-a0)] px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none z-10 transform -translate-x-1/2"
            style={{
              left: `${(mousePosition.x / width) * 100}%`,
              top: `${((mousePosition.y - 5) / height) * 100}%`,
            }}
          >
            <div className="text-center">
              <div className="font-bold">{hoveredPoint.users} users</div>
              <div className="text-xs text-[var(--clr-primary-a0)]">
                {new Date(hoveredPoint.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--clr-surface-a50)]" />
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
    clickTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("30d");

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const res = await axios.get(
        getApiUrl(`${API_ENDPOINTS.AUTH}/admin/analytics`)
      );
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
      <div className="min-h-screen bg-[var(--clr-surface-a10)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clr-primary-a0)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)]">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 xs:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 xs:gap-6">
            <div className="flex xs:flex-col lg:flex-row xs:items-left lg:items-center gap-2 xs:gap-4">
              <Link
                to="/dashboard"
                className="w-fit p-2 rounded-lg bg-[var(--clr-surface-a10)] hover:bg-[var(--clr-surface-a20)] transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 text-[var(--clr-surface-a50)]" />
              </Link>
              <div>
                <h1 className="text-3xl xs:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                  System Analytics
                </h1>
                <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                  Comprehensive overview of system performance and usage
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-fit self-end px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Total Users
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {analytics.totalUsers.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Registered accounts
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Total URLs
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {analytics.totalUrls.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Shortened URLs
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MousePointer className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Total Clicks
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {analytics.totalClicks.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Link visits
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Active Users
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {analytics.activeUsers.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Verified accounts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8">
          {/* Top Performing URLs */}
          <div className="bg-[var(--clr-surface-a0)] shadow-xl rounded-2xl overflow-hidden border border-[var(--clr-surface-a30)] h-80 xs:h-96 flex flex-col">
            <div className="p-3 lg:p-8 border-b border-[var(--clr-surface-a20)] bg-[var(--clr-surface-a10)] flex-shrink-0">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                Top Performing URLs
              </h2>
              <p className="text-[var(--clr-surface-a50)] text-sm xs:text-base mt-1">
                Most clicked shortened URLs system-wide
              </p>
            </div>
            <div className="p-4 xs:p-6 sm:p-8 flex-1 overflow-y-auto">
              {analytics.topUrls.length > 0 ? (
                <div className="space-y-6">
                  {analytics.topUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)]">
                            {index + 1}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-[var(--clr-surface-a50)] dark:text-[var(--clr-light-a0)] truncate max-w-xs">
                              {url.shortCode}
                            </p>
                            <p className="text-xs text-[var(--clr-surface-a40)] truncate max-w-xs">
                              {url.originalUrl}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-[var(--clr-surface-a20)] rounded-full h-2 mb-2">
                          <div
                            className="bg-[var(--clr-primary-a0)] h-2 rounded-full"
                            style={{
                              width: `${
                                (url.clickCount / analytics.totalClicks) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold text-[var(--clr-surface-a50)] dark:text-[var(--clr-light-a0)]">
                          {url.clickCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[var(--clr-surface-a40)]">
                          clicks
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--clr-surface-a40)] text-center py-8">
                  No URL data available yet.
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--clr-surface-a0)] shadow-xl rounded-2xl overflow-hidden border border-[var(--clr-surface-a30)] h-80 xs:h-96 flex flex-col">
            <div className="p-3 lg:p-8 border-b border-[var(--clr-surface-a20)] bg-[var(--clr-surface-a10)] flex-shrink-0">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                Recent Activity
              </h2>
              <p className="text-[var(--clr-surface-a50)] text-sm xs:text-base mt-1">
                Latest system activity and user interactions
              </p>
            </div>
            <div className="p-4 xs:p-6 sm:p-8 flex-1 overflow-y-auto">
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-[var(--clr-surface-a20)] last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-[var(--clr-primary-a0)]">
                          <Activity className="w-4 h-4 text-[var(--clr-light-a0)]" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-[var(--clr-surface-a50)] dark:text-[var(--clr-light-a0)]">
                            {activity.action}
                          </p>
                          <p className="text-xs text-[var(--clr-surface-a40)]">
                            {activity.user} •{" "}
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--clr-surface-a40)]">
                        {activity.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--clr-surface-a40)] text-center py-8">
                  No recent activity available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="mt-6 xs:mt-8 bg-[var(--clr-surface-a0)] shadow-xl rounded-2xl overflow-hidden border border-[var(--clr-surface-a30)]">
          <div className="p-3 lg:p-8 border-b border-[var(--clr-surface-a20)] bg-[var(--clr-surface-a10)]">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-[var(--clr-surface-a50)] dark:text-[var(--clr-light-a0)]">
              User Growth Trends
            </h2>
            <p className="text-[var(--clr-surface-a50)] text-sm xs:text-base mt-1">
              Track user registration patterns and growth over time
            </p>
          </div>
          <div className="p-2 xs:p-4">
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
