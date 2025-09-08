import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Link as LinkIcon,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  BarChart3,
  Clock,
  User,
  Globe,
  Copy,
  ExternalLink,
  MousePointer,
} from "lucide-react";

const LinkManagement = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLinks, setTotalLinks] = useState(0);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [linkStats, setLinkStats] = useState(null);
  const [editForm, setEditForm] = useState({
    originalUrl: "",
    password: "",
    expiresAt: "",
  });

  const fetchLinks = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const params = {
        page,
        limit: 20,
        search: searchTerm,
        sortBy,
        sortOrder,
      };

      const res = await axios.get(getApiUrl(API_ENDPOINTS.LINKS), { params });
      if (res.data?.success) {
        setLinks(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalLinks(res.data.pagination.total);
        setCurrentPage(page);
        if (isRefresh) toast.success("Links refreshed");
      }
    } catch (err) {
      console.error("Failed to fetch links", err);
      toast.error("Failed to load links");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const fetchLinkStats = async (shortCode) => {
    try {
      const res = await axios.get(
        getApiUrl(`${API_ENDPOINTS.LINKS}/${shortCode}/stats`)
      );
      if (res.data?.success) {
        setLinkStats(res.data.data);
        setShowStatsModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch link stats", err);
      toast.error("Failed to load link statistics");
    }
  };

  const handleEdit = (link) => {
    setSelectedLink(link);
    setEditForm({
      originalUrl: link.originalUrl,
      password: link.password || "",
      expiresAt: link.expiresAt
        ? new Date(link.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.LINKS}/${selectedLink.shortCode}`),
        editForm
      );
      if (res.data?.success) {
        toast.success("Link updated successfully");
        setShowEditModal(false);
        fetchLinks(currentPage, true);
      }
    } catch (err) {
      console.error("Failed to update link", err);
      toast.error("Failed to update link");
    }
  };

  const handleDelete = async (shortCode) => {
    if (
      !confirm(
        "Are you sure you want to delete this link? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        getApiUrl(`${API_ENDPOINTS.LINKS}/${shortCode}`)
      );
      if (res.data?.success) {
        toast.success("Link deleted successfully");
        fetchLinks(currentPage, true);
      }
    } catch (err) {
      console.error("Failed to delete link", err);
      toast.error("Failed to delete link");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return formatDate(dateString);
  };

  useEffect(() => {
    fetchLinks();
  }, [searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLinks(currentPage);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchLinks(currentPage, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--clr-surface-a30)] border-t-[var(--clr-primary-a0)] rounded-full animate-spin"></div>
          <p className="text-[var(--clr-surface-a50)] font-medium">
            Loading link management...
          </p>
        </div>
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
                  Link Management
                </h1>
                <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                  Manage and monitor all shortened URLs in the system
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Total Links
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {totalLinks}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              All shortened URLs
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Total Clicks
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {links.reduce(
                (sum, link) => sum + (link.stats?.totalClicks || 0),
                0
              )}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Across all links
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Active Users
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {
                new Set(links.map((link) => link.userId?._id).filter(Boolean))
                  .size
              }
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Users with links
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--clr-surface-a50)]" />
                <input
                  type="text"
                  placeholder="Search by short code or URL..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="clickCount-desc">Most Clicks</option>
                  <option value="clickCount-asc">Least Clicks</option>
                  <option value="shortCode-asc">Short Code A-Z</option>
                  <option value="shortCode-desc">Short Code Z-A</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-[var(--clr-surface-a50)]">
              Showing {links.length} of {totalLinks} links
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm xs:text-base">
              <thead className="bg-[var(--clr-surface-a5)] dark:bg-[var(--clr-surface-a15)]">
                <tr>
                  <th className="px-4 xs:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Link Details
                  </th>
                  <th className="px-4 xs:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Statistics
                  </th>
                  <th className="px-4 xs:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 xs:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--clr-surface-a30)]">
                {links.map((link) => (
                  <tr
                    key={link._id}
                    className="hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] transition-colors duration-200"
                  >
                    {/* Link Details */}
                    <td className="px-4 xs:px-6 py-3 xs:py-4">
                      <div className="flex items-start gap-2 xs:gap-3">
                        <LinkIcon className="w-4 h-4 xs:w-5 xs:h-5 text-[var(--clr-primary-a0)]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <code className="text-xs xs:text-sm font-mono text-[var(--clr-primary-a0)] bg-[var(--clr-primary-a50)] dark:text-[var(--clr-primary-a30)] dark:bg-[var(--clr-primary-darker)] px-2 py-1 rounded-md cursor-pointer">
                              {link.shortCode}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${window.location.origin}/${link.shortCode}`
                                )
                              }
                              className="p-1 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors cursor-pointer"
                              title="Copy short URL"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`/${link.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors"
                              title="Open link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-xs xs:text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] break-all mb-1">
                            {link.originalUrl}
                          </p>
                          <div className="flex flex-wrap items-center gap-1 xs:gap-2 text-xs text-[var(--clr-surface-a50)]">
                            <User className="w-3 h-3" />
                            <span>{link.userId?.username || "Anonymous"}</span>
                            {link.password && (
                              <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                Password Protected
                              </span>
                            )}
                            {link.expiresAt &&
                              new Date(link.expiresAt) > new Date() && (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  Expires {formatDate(link.expiresAt)}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-4 xs:px-6 py-3 xs:py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                          <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            {link.stats?.totalClicks || 0}
                          </span>
                          <span className="text-xs text-[var(--clr-surface-a50)]">
                            clicks
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                          <span className="text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            {link.stats?.uniqueVisitors || 0}
                          </span>
                          <span className="text-xs text-[var(--clr-surface-a50)]">
                            unique
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-4 xs:px-6 py-3 xs:py-4">
                      <div className="text-xs xs:text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {formatDate(link.createdAt)}
                      </div>
                      <div className="text-xs text-[var(--clr-surface-a50)]">
                        {formatRelativeTime(link.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 xs:px-6 py-3 xs:py-4">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <button
                          onClick={() => fetchLinkStats(link.shortCode)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--clr-surface-a50)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="View Statistics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(link)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--clr-surface-a50)] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Edit Link"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.shortCode)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--clr-surface-a50)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {links.length === 0 && (
            <div className="p-8 xs:p-12 text-center">
              <LinkIcon className="w-10 h-10 xs:w-12 xs:h-12 text-[var(--clr-surface-a50)] mx-auto mb-4" />
              <h3 className="text-base xs:text-lg font-medium text-[var(--clr-surface-a50)] mb-2">
                No links found
              </h3>
              <p className="text-sm xs:text-base text-[var(--clr-surface-a50)]">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No links have been created yet"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-[var(--clr-surface-a50)]">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLinks(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[var(--clr-surface-a30)] hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchLinks(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[var(--clr-surface-a30)] hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedLink && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                Edit Link
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Original URL
                  </label>
                  <input
                    type="url"
                    value={editForm.originalUrl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, originalUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Expires At (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.expiresAt}
                    onChange={(e) =>
                      setEditForm({ ...editForm, expiresAt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg text-[var(--clr-surface-a50)] hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] rounded-lg transition-colors cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStatsModal && linkStats && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Link Statistics
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-4">
                    <div className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      {linkStats.statistics.totalClicks}
                    </div>
                    <div className="text-sm text-[var(--clr-surface-a50)]">
                      Total Clicks
                    </div>
                  </div>
                  <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-4">
                    <div className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      {linkStats.statistics.dailyClicks.length}
                    </div>
                    <div className="text-sm text-[var(--clr-surface-a50)]">
                      Active Days
                    </div>
                  </div>
                  <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-4">
                    <div className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      {linkStats.statistics.topReferrers.length}
                    </div>
                    <div className="text-sm text-[var(--clr-surface-a50)]">
                      Referrers
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3">
                    Recent Clicks
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {linkStats.statistics.recentClicks.map((click, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[var(--clr-surface-a5)] dark:bg-[var(--clr-surface-a15)] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                          <span className="text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-mono">
                            {click.ip}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--clr-surface-a50)]">
                          {formatRelativeTime(click.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkManagement;
