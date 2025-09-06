import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { ArrowLeft, RefreshCw } from "lucide-react";

const Analytics = () => {
  const { shortCode } = useParams();
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUrlData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const res = await axios.get(
        getApiUrl(`${API_ENDPOINTS.URLS}/${shortCode}`)
      );
      if (res.data?.success) {
        setUrlData(res.data.data);
        if (isRefresh) {
          toast.success("Analytics refreshed");
        }
      } else {
        toast.error("URL not found");
      }
    } catch (err) {
      console.error("Failed to fetch URL data", err);
      toast.error(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (shortCode) {
      fetchUrlData();
    }
  }, [shortCode]);

  const handleRefresh = () => {
    if (shortCode) {
      fetchUrlData(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!urlData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              URL Not Found
            </h1>
            <Link
              to="/dashboard"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <ArrowLeft className="inline w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Process analytics data (basic implementation)
  const analytics = urlData.analytics || [];
  const totalClicks = urlData.clickCount || 0;

  // Group analytics by referrer
  const referrerStats = analytics.reduce((acc, entry) => {
    const referrer = entry.referrer || "Direct";
    acc[referrer] = (acc[referrer] || 0) + 1;
    return acc;
  }, {});

  const topReferrers = Object.entries(referrerStats)
    .map(([source, clicks]) => ({
      source,
      clicks,
      percentage:
        totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">URL Analytics</h1>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {import.meta.env.VITE_SHORT_BASE_URL || window.location?.host || "urlzy.netlify.app"}/{shortCode}
                </p>
                <p className="text-sm text-gray-600 truncate max-w-md">{urlData.originalUrl}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Created: {new Date(urlData.createdAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <div className="w-8 h-8 text-white font-bold text-xl">{totalClicks}</div>
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Clicks
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <div className="w-8 h-8 text-white font-bold text-xl">{analytics.length}</div>
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Visits
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {analytics.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Referrers */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Top Referrers</h3>
            {topReferrers.length > 0 ? (
              <div className="space-y-6">
                {topReferrers.map((referrer, index) => (
                  <div
                    key={index}
                    className="bg-gray-50/50 p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {referrer.source}
                      </span>
                      <span className="text-sm font-medium text-indigo-600">
                        {referrer.clicks} visits ({referrer.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${referrer.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No referrer data available yet.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Analytics will appear here once your link gets clicks.
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            {analytics.length > 0 ? (
              <div className="space-y-4">
                {analytics
                  .slice(-10)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {entry.referrer || "Direct"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'short'
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {entry.ip?.substring(0, 8)}...
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No activity data available yet.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Recent clicks will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
