import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  ArrowLeft,
  RefreshCw,
  BarChart3,
  MousePointer,
  Globe,
  Clock,
} from "lucide-react";

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
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--clr-surface-a30)] border-t-[var(--clr-primary-a0)] rounded-full animate-spin"></div>
          <p className="text-[var(--clr-surface-a50)] font-medium">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!urlData) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
            URL Not Found
          </h1>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Process analytics data
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

  // Group analytics by date for trend analysis
  const clicksByDate = analytics.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const recentDays = Object.entries(clicksByDate)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <h1 className="text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
            URL Analytics
          </h1>

          {/* URL Info Card */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-[var(--clr-primary-lighter)]">
                    <BarChart3 className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    Short URL Performance
                  </h2>
                </div>
                <p className="text-lg font-medium text-[var(--clr-primary-a0)] mb-2">
                  {import.meta.env.VITE_SHORT_BASE_URL ||
                    window.location?.host ||
                    "urlzy.netlify.app"}
                  /{shortCode}
                </p>
                <p className="text-sm text-[var(--clr-surface-a50)] truncate max-w-2xl">
                  {urlData.originalUrl}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--clr-surface-a50)]">
                  Created:{" "}
                  {new Date(urlData.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[var(--clr-primary-lighter)]">
                <MousePointer className="w-6 h-6 text-[var(--clr-primary-a0)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Total Clicks
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Unique Visits
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {analytics.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Referrer Sources
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {Object.keys(referrerStats).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Days Active
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {Object.keys(clicksByDate).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Referrers */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Top Referrers
            </h3>
            {topReferrers.length > 0 ? (
              <div className="space-y-4">
                {topReferrers.map((referrer, index) => (
                  <div
                    key={index}
                    className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {referrer.source}
                      </span>
                      <span className="text-sm font-semibold text-[var(--clr-primary-a0)]">
                        {referrer.clicks} visits ({referrer.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--clr-surface-a30)] rounded-full h-2">
                      <div
                        className="bg-[var(--clr-primary-a0)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${referrer.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 text-[var(--clr-surface-a40)] mx-auto mb-4" />
                <p className="text-[var(--clr-surface-a50)] text-sm">
                  No referrer data available yet.
                </p>
                <p className="text-[var(--clr-surface-a50)] text-xs mt-2">
                  Analytics will appear here once your link gets clicks.
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Recent Activity
            </h3>
            {analytics.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics
                  .slice(-10)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg hover:bg-[var(--clr-surface-tonal-a0)] transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-[var(--clr-primary-a0)] rounded-full" />
                          <p className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            {entry.referrer || "Direct"}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--clr-surface-a50)]">
                          {new Date(entry.timestamp).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-[var(--clr-surface-a50)] font-mono">
                        {entry.ip?.substring(0, 8)}...
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-[var(--clr-surface-a40)] mx-auto mb-4" />
                <p className="text-[var(--clr-surface-a50)] text-sm">
                  No activity data available yet.
                </p>
                <p className="text-[var(--clr-surface-a50)] text-xs mt-2">
                  Recent clicks will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Clicks Trend */}
        {recentDays.length > 0 && (
          <div className="mt-8">
            <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
                Daily Clicks (Last 7 Days)
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {recentDays.map((day, index) => {
                  const maxClicks = Math.max(
                    ...recentDays.map((d) => d.clicks)
                  );
                  const height =
                    maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 10;

                  return (
                    <div key={index} className="text-center">
                      <div
                        className="mb-2 flex items-end justify-center"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="bg-[var(--clr-primary-a0)] rounded-t-md min-h-[10px] w-8 transition-all duration-500"
                          style={{ height: `${height}%` }}
                          title={`${day.clicks} clicks`}
                        />
                      </div>
                      <div className="text-xs text-[var(--clr-surface-a50)]">
                        {new Date(day.date).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </div>
                      <div className="text-sm font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {day.clicks}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
