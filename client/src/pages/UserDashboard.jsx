import React, { useEffect, useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS, API_BASE_URL } from "../config/api";
import {
  BarChart3,
  Trash2,
  Link as LinkIcon,
  MousePointer,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteShortCode, setDeleteShortCode] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const fetchUrls = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const res = await axios.get(getApiUrl(`${API_ENDPOINTS.URLS}/list`));
      if (res.data?.success) {
        setUrls(res.data.data);
        if (isRefresh) {
          toast.success("URLs refreshed");
        }
      }
    } catch (err) {
      console.error("Failed to fetch URLs", err);
      toast.error("Failed to load URLs");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleRefresh = () => {
    fetchUrls(true);
  };

  const handleDelete = (shortCode) => {
    setDeleteShortCode(shortCode);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteShortCode) return;

    try {
      const res = await axios.delete(
        getApiUrl(`${API_ENDPOINTS.URLS}/${deleteShortCode}`)
      );
      if (res.data?.success) {
        setUrls((prev) =>
          prev.filter((u) => (u.shortCode || u.customCode) !== deleteShortCode)
        );
        toast.success("URL deleted successfully");
      } else {
        toast.error(res.data?.message || "Failed to delete");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
    setShowConfirmModal(false);
    setDeleteShortCode(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setDeleteShortCode(null);
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      const res = await axios.delete(getApiUrl(`${API_ENDPOINTS.AUTH}/delete-account`));
      if (res.data?.success) {
        toast.success("Account deleted successfully");
        // Redirect to home or login page
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Failed to delete account", err);
      toast.error("Failed to delete account");
    }
    setShowDeleteAccountModal(false);
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteAccountModal(false);
  };

  const buildShortUrl = (url) => {
    const base = (
      import.meta.env.VITE_SHORT_BASE_URL ||
      import.meta.env.VITE_BASE_URL ||
      API_BASE_URL
    )
      .toString()
      .replace(/\/$/, "");

    // If VITE_SHORT_BASE_URL is just host without protocol, prefix with http(s)
    const normalizedBase = /^https?:\/\//i.test(base) ? base : `http://${base}`;

    const code = url.shortCode || url.customCode;
    return code ? `${normalizedBase}/${code}` : "";
  };

  const stats = useMemo(
    () => ({
      totalUrls: urls.length,
      totalClicks: urls.reduce((sum, url) => sum + (url.clickCount || 0), 0),
      topUrl:
        urls.length > 0
          ? [...urls].sort(
              (a, b) => (b.clickCount || 0) - (a.clickCount || 0)
            )[0]
          : null,
    }),
    [urls]
  );

  const UrlTableRow = memo(({ url, onDelete }) => {
    const shortUrl = buildShortUrl(url);

    return (
      <tr
        key={url._id}
      >
        <td className="px-8 py-6 whitespace-nowrap">
          {shortUrl ? (
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200"
            >
              {shortUrl}
            </a>
          ) : (
            <span className="text-sm text-gray-500">Invalid URL</span>
          )}
        </td>
        <td className="px-8 py-6">
          <div className="text-sm text-gray-900 truncate max-w-xs hover:text-gray-700 transition-colors">
            {url.originalUrl || "N/A"}
          </div>
        </td>
        <td className="px-8 py-6 whitespace-nowrap">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            {url.clickCount || 0}
          </div>
        </td>
        <td className="px-8 py-6 whitespace-nowrap">
          <div className="text-sm text-gray-600">
            {url.createdAt
              ? new Date(url.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })
              : "N/A"}
          </div>
        </td>
        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
          <Link
            to={`/analytics/${url.shortCode || url.customCode || ""}`}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 mr-3 font-medium"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Link>
          <button
            onClick={() => onDelete(url.shortCode || url.customCode)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-700 font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-[var(--text-secondary)] mb-4">
                Dashboard
              </h1>
              <p className="text-xl text-[var(--text-primary)] opacity-80 leading-relaxed">
                Manage your shortened URLs and view analytics
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-[var(--text-secondary)] text-white rounded-lg hover:bg-[var(--text-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-md border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-[var(--text-secondary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--text-accent)] transition-colors"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Create New URL
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-xl border border-[var(--border-color)] shadow-md hover:bg-[var(--card-bg)] transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Management</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDeleteAccount}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-indigo-600 rounded-2xl">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total URLs
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {stats.totalUrls}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-green-600 rounded-2xl">
                <MousePointer className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Clicks
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {stats.totalClicks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-yellow-600 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Top Performer
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {stats.topUrl?.clickCount || 0} clicks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* URLs Table */}
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">Your URLs</h2>
            <p className="text-gray-600 mt-1">
              Manage and track your shortened links
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {urls && urls.length > 0 ? (
                  urls.map((url) => (
                    <UrlTableRow
                      key={url._id}
                      url={url}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-6 text-center text-gray-500"
                    >
                      No URLs found. Create your first shortened URL!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this URL? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your account? This action cannot be undone and will:
            </p>
            <ul className="text-gray-600 mb-6 list-disc list-inside space-y-1">
              <li>Delete all your shortened URLs</li>
              <li>Remove all your analytics data</li>
              <li>Permanently delete your account</li>
            </ul>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDeleteAccount}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
