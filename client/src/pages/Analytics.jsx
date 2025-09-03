import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

const Analytics = () => {
  const { shortCode } = useParams();
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrlData = async () => {
      try {
        const res = await axios.get(
          getApiUrl(`${API_ENDPOINTS.URLS}/${shortCode}`)
        );
        if (res.data?.success) {
          setUrlData(res.data.data);
        } else {
          toast.error("URL not found");
        }
      } catch (err) {
        console.error("Failed to fetch URL data", err);
        toast.error(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (shortCode) {
      fetchUrlData();
    }
  }, [shortCode]);

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
              ← Back to Dashboard
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
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">urlzy.com/{shortCode}</p>
          <p className="text-sm text-gray-500 mt-1">{urlData.originalUrl}</p>
          <p className="text-xs text-gray-400 mt-1">
            Created: {new Date(urlData.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {totalClicks}
            </div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.length}
            </div>
            <div className="text-sm text-gray-600">Total Visits</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Referrers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
            {topReferrers.length > 0 ? (
              <div className="space-y-4">
                {topReferrers.map((referrer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">
                          {referrer.source}
                        </span>
                        <span className="text-sm text-gray-500">
                          {referrer.clicks} visits
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${referrer.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No referrer data available yet.
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {analytics.length > 0 ? (
              <div className="space-y-3">
                {analytics
                  .slice(-10)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {entry.referrer || "Direct"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {entry.ip?.substring(0, 8)}...
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No activity data available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
