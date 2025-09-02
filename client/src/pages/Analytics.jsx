import React from "react";
import { useParams, Link } from "react-router-dom";

const Analytics = () => {
  const { shortCode } = useParams();

  // Mock analytics data
  const analyticsData = {
    shortCode,
    originalUrl: "https://www.example.com/very-long-url",
    totalClicks: 156,
    clicksToday: 12,
    clicksThisWeek: 89,
    clicksThisMonth: 156,
    topCountries: [
      { country: "United States", clicks: 45, percentage: 28.8 },
      { country: "United Kingdom", clicks: 32, percentage: 20.5 },
      { country: "Canada", clicks: 28, percentage: 17.9 },
      { country: "Germany", clicks: 19, percentage: 12.2 },
    ],
    topReferrers: [
      { source: "Direct", clicks: 62, percentage: 39.7 },
      { source: "Twitter", clicks: 34, percentage: 21.8 },
      { source: "Facebook", clicks: 28, percentage: 17.9 },
      { source: "LinkedIn", clicks: 21, percentage: 13.5 },
    ],
    dailyClicks: [
      { date: "2024-01-10", clicks: 8 },
      { date: "2024-01-11", clicks: 12 },
      { date: "2024-01-12", clicks: 15 },
      { date: "2024-01-13", clicks: 18 },
      { date: "2024-01-14", clicks: 22 },
      { date: "2024-01-15", clicks: 25 },
      { date: "2024-01-16", clicks: 12 },
    ],
  };

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
          <p className="text-sm text-gray-500 mt-1">
            {analyticsData.originalUrl}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.totalClicks}
            </div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.clicksToday}
            </div>
            <div className="text-sm text-gray-600">Today</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.clicksThisWeek}
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData.clicksThisMonth}
            </div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Countries */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
            <div className="space-y-4">
              {analyticsData.topCountries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {country.country}
                      </span>
                      <span className="text-sm text-gray-500">
                        {country.clicks} clicks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
            <div className="space-y-4">
              {analyticsData.topReferrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {referrer.source}
                      </span>
                      <span className="text-sm text-gray-500">
                        {referrer.clicks} clicks
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
