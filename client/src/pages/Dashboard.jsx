import React, { useEffect, useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS, API_BASE_URL } from "../config/api";
import { BarChart3, Trash2, Link as LinkIcon, MousePointer, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteShortCode, setDeleteShortCode] = useState(null);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const res = await axios.get(getApiUrl(`${API_ENDPOINTS.URLS}/list`));
        if (res.data?.success) {
          setUrls(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch URLs", err);
        toast.error("Failed to load URLs");
      }
    };
    fetchUrls();
  }, []);

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

  const buildShortUrl = (url) => {
    const base = (import.meta.env.VITE_BASE_URL || API_BASE_URL).replace(/\/$/, "");
    const code = url.shortCode || url.customCode;
    return code ? `${base}/${code}` : "";
  };

  const stats = useMemo(() => ({
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, url) => sum + (url.clickCount || 0), 0),
    topUrl: urls.length > 0 ? [...urls].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))[0] : null,
  }), [urls]);

  const UrlTableRow = memo(({ url, onDelete }) => {
    const shortUrl = buildShortUrl(url);

    return (
      <tr key={url._id} className="hover:bg-white/80 transition-all duration-200 hover:shadow-sm">
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
            {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : "N/A"}
          </div>
        </td>
        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
          <Link
            to={`/analytics/${url.shortCode || url.customCode || ""}`}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-all duration-200 mr-3 font-medium"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Link>
          <button
            onClick={() => onDelete(url.shortCode || url.customCode)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200 font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Manage your shortened URLs and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in-up animation-delay-200">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total URLs</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {stats.totalUrls}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
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

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
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
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up animation-delay-400">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900">Your URLs</h2>
            <p className="text-gray-600 mt-1">Manage and track your shortened links</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
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
              <tbody className="bg-white/50 divide-y divide-gray-100">
                {urls && urls.length > 0 ? (
                  urls.map((url) => (
                    <UrlTableRow key={url._id} url={url} onDelete={handleDelete} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-6 text-center text-gray-500">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this URL? This action cannot be undone.</p>
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
    </div>
  );
};

export default Dashboard;
