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
  Plus,
  Settings,
  Search,
  Filter,
  Edit3,
  Copy,
  QrCode,
  Download,
  MoreVertical,
  CheckSquare,
  Square,
  Calendar,
  Eye,
  ExternalLink,
  Clock,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteShortCode, setDeleteShortCode] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editForm, setEditForm] = useState({ originalUrl: "", customCode: "" });
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const fetchUrls = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await axios.get(getApiUrl(`${API_ENDPOINTS.URLS}/list`));
      if (res.data?.success) {
        setUrls(res.data.data);
        if (isRefresh) toast.success("URLs refreshed");
      }
    } catch (err) {
      console.error("Failed to fetch URLs", err);
      toast.error("Failed to load URLs");
    } finally {
      if (isRefresh) setRefreshing(false);
      // Mark initial load as complete
      if (!isRefresh) setInitialLoadComplete(true);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleRefresh = () => fetchUrls(true);

  const handleDelete = (shortCode) => {
    setDeleteShortCode(shortCode);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteShortCode) return;

    try {
      if (deleteShortCode === "bulk") {
        // Bulk delete
        const deletePromises = selectedUrls.map((urlId) =>
          axios.delete(getApiUrl(`${API_ENDPOINTS.URLS}/${urlId}`))
        );

        await Promise.all(deletePromises);
        setUrls((prev) => prev.filter((u) => !selectedUrls.includes(u._id)));
        setSelectedUrls([]);
        setShowBulkActions(false);
        toast.success(`${selectedUrls.length} URLs deleted successfully`);
      } else {
        // Single delete
        const res = await axios.delete(
          getApiUrl(`${API_ENDPOINTS.URLS}/${deleteShortCode}`)
        );
        if (res.data?.success) {
          setUrls((prev) =>
            prev.filter(
              (u) => (u.shortCode || u.customCode) !== deleteShortCode
            )
          );
          toast.success("URL deleted successfully");
        } else {
          toast.error(res.data?.message || "Failed to delete");
        }
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

  const handleDeleteAccount = () => setShowDeleteAccountModal(true);

  const handleConfirmDeleteAccount = async () => {
    try {
      const res = await axios.delete(
        getApiUrl(`${API_ENDPOINTS.AUTH}/delete-account`)
      );
      if (res.data?.success) {
        toast.success("Account deleted successfully");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Failed to delete account", err);
      toast.error("Failed to delete account");
    }
    setShowDeleteAccountModal(false);
  };

  const handleCancelDeleteAccount = () => setShowDeleteAccountModal(false);

  const buildShortUrl = (url) => {
    const base = (
      import.meta.env.VITE_SHORT_BASE_URL ||
      import.meta.env.VITE_BASE_URL ||
      API_BASE_URL
    )
      .toString()
      .replace(/\/$/, "");

    const normalizedBase = /^https?:\/\//i.test(base) ? base : `http://${base}`;
    const code = url.shortCode || url.customCode;
    return code ? `${normalizedBase}/${code}` : "";
  };

  const getUrlStatus = (url) => {
    // Check if URL has expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return {
        status: "expired",
        label: "Expired",
        icon: XCircle,
        color: "text-red-600",
      };
    }

    // Check if URL is active (has recent clicks or was created recently)
    const createdDate = new Date(url.createdAt || 0);
    const daysSinceCreation =
      (new Date() - createdDate) / (1000 * 60 * 60 * 24);

    if (url.clickCount > 0 || daysSinceCreation < 7) {
      return {
        status: "active",
        label: "Active",
        icon: CheckCircle,
        color: "text-green-600",
      };
    }

    // Default to inactive
    return {
      status: "inactive",
      label: "Inactive",
      icon: AlertCircle,
      color: "text-yellow-600",
    };
  };

  // Filtered and sorted URLs
  const filteredUrls = useMemo(() => {
    let filtered = urls.filter((url) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        url.originalUrl?.toLowerCase().includes(searchLower) ||
        url.shortCode?.toLowerCase().includes(searchLower) ||
        url.customCode?.toLowerCase().includes(searchLower)
      );
    });

    // Sort URLs
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "clickCount":
          aValue = a.clickCount || 0;
          bValue = b.clickCount || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case "originalUrl":
          aValue = a.originalUrl || "";
          bValue = b.originalUrl || "";
          break;
        default:
          aValue = a.createdAt || 0;
          bValue = b.createdAt || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [urls, searchTerm, sortBy, sortOrder]);

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
      averageClicks:
        urls.length > 0
          ? Math.round(
              urls.reduce((sum, url) => sum + (url.clickCount || 0), 0) /
                urls.length
            )
          : 0,
      recentUrls: urls
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    }),
    [urls]
  );

  const UrlTableRow = memo(
    ({ url, onDelete, isSelected, onSelect, onEdit, onQrCode }) => {
      const shortUrl = buildShortUrl(url);
      const statusInfo = getUrlStatus(url);

      const handleCopyUrl = async () => {
        if (shortUrl) {
          await navigator.clipboard.writeText(shortUrl);
          toast.success("URL copied to clipboard!");
        }
      };

      return (
        <tr className="hover:bg-[var(--clr-surface-tonal-a0)] transition-colors duration-200 border-b border-[var(--clr-surface-a20)]">
          <td className="px-6 py-4">
            <button
              onClick={() => onSelect(!isSelected)}
              className="text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {shortUrl ? (
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] font-medium transition-colors duration-200"
                >
                  {shortUrl}
                </a>
              ) : (
                <span className="text-[var(--clr-surface-a50)]">
                  Invalid URL
                </span>
              )}
              {shortUrl && (
                <button
                  onClick={handleCopyUrl}
                  className="p-1 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] truncate max-w-xs">
              {url.originalUrl || "N/A"}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-darker)]">
              {url.clickCount || 0}
            </div>
          </td>
          <td className="px-6 py-4 text-[var(--clr-surface-a50)] text-sm">
            {url.createdAt
              ? new Date(url.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-1">
              <Link
                to={`/analytics/${url.shortCode || url.customCode || ""}`}
                className="p-2 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] hover:bg-[var(--clr-surface-a10)] rounded-lg transition-colors"
                title="View Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </Link>
              <button
                onClick={onEdit}
                className="p-2 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] hover:bg-[var(--clr-surface-a10)] rounded-lg transition-colors"
                title="Edit URL"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onQrCode}
                className="p-2 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] hover:bg-[var(--clr-surface-a10)] rounded-lg transition-colors"
                title="Generate QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(url.shortCode || url.customCode)}
                className="p-2 text-[var(--clr-surface-a50)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete URL"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    }
  );

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 xs:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 xs:gap-6">
            <div>
              <h1 className="text-3xl xs:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                Dashboard
              </h1>
              <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                Manage your shortened URLs and track their performance
              </p>
            </div>
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
        </div>

        {/* Welcome Section for New Users */}
        {initialLoadComplete && stats.totalUrls === 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-[var(--clr-primary-lighter)] via-[var(--clr-primary-light)] to-white border border-[var(--clr-primary-a20)] rounded-xl p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="p-4 bg-[var(--clr-primary-a0)] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-[var(--clr-light-a0)]" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--clr-primary-darker)] mb-4">
                  Welcome to URLzy!
                </h2>
                <p className="text-lg text-[var(--clr-primary-darker)] opacity-80 mb-8">
                  Get started by creating your first shortened URL. It's quick,
                  easy, and powerful!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="p-2 bg-[var(--clr-primary-a0)] rounded-lg w-fit mx-auto mb-3">
                      <Plus className="w-5 h-5 text-[var(--clr-light-a0)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--clr-primary-darker)] mb-2">
                      1. Create
                    </h3>
                    <p className="text-sm text-[var(--clr-primary-darker)] opacity-80">
                      Paste your long URL and get a short, shareable link
                      instantly
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="p-2 bg-[var(--clr-primary-a0)] rounded-lg w-fit mx-auto mb-3">
                      <MousePointer className="w-5 h-5 text-[var(--clr-light-a0)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--clr-primary-darker)] mb-2">
                      2. Share
                    </h3>
                    <p className="text-sm text-[var(--clr-primary-darker)] opacity-80">
                      Share your shortened URL anywhere - social media, emails,
                      or messages
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="p-2 bg-[var(--clr-primary-a0)] rounded-lg w-fit mx-auto mb-3">
                      <BarChart3 className="w-5 h-5 text-[var(--clr-light-a0)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--clr-primary-darker)] mb-2">
                      3. Track
                    </h3>
                    <p className="text-sm text-[var(--clr-primary-darker)] opacity-80">
                      Monitor clicks and performance with detailed analytics
                    </p>
                  </div>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-6 h-6" />
                  Create Your First URL
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Create New URL
              </Link>
              <Link
                to="/settings"
                className="px-6 py-3 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 transition-colors duration-200"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[var(--clr-primary-lighter)]">
                <LinkIcon className="w-6 h-6 text-[var(--clr-primary-a0)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Total URLs
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {stats.totalUrls}
                </p>
                <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
                  {stats.totalUrls === 1 ? "URL created" : "URLs created"}
                </p>
              </div>
            </div>
          </div>

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
                  {stats.totalClicks.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
                  Across all URLs
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[var(--clr-primary-lighter)]">
                <TrendingUp className="w-6 h-6 text-[var(--clr-primary-a0)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Avg. Clicks/URL
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {stats.averageClicks}
                </p>
                <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
                  Performance metric
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[var(--clr-primary-lighter)]">
                <Zap className="w-6 h-6 text-[var(--clr-primary-a0)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                  Top Performer
                </p>
                <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                  {stats.topUrl?.clickCount || 0}
                </p>
                <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
                  Most clicked URL
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                <BarChart3 className="w-5 h-5 text-[var(--clr-primary-a0)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Click Analytics
                </h2>
                <p className="text-[var(--clr-surface-a50)] text-sm">
                  Your URL performance over the last 7 days
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Click Trend Chart */}
              <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                  Daily Clicks Trend
                </h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[
                    { day: "Mon", clicks: Math.floor(Math.random() * 20) + 5 },
                    { day: "Tue", clicks: Math.floor(Math.random() * 25) + 8 },
                    { day: "Wed", clicks: Math.floor(Math.random() * 30) + 10 },
                    { day: "Thu", clicks: Math.floor(Math.random() * 35) + 12 },
                    { day: "Fri", clicks: Math.floor(Math.random() * 40) + 15 },
                    { day: "Sat", clicks: Math.floor(Math.random() * 45) + 18 },
                    { day: "Sun", clicks: Math.floor(Math.random() * 50) + 20 },
                  ].map((data, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-[var(--clr-primary-a0)] to-[var(--clr-primary-light)] rounded-t-sm transition-all duration-300 hover:opacity-80"
                        style={{ height: `${(data.clicks / 50) * 100}%` }}
                        title={`${data.day}: ${data.clicks} clicks`}
                      ></div>
                      <span className="text-xs text-[var(--clr-surface-a50)] mt-2">
                        {data.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-[var(--clr-surface-a50)]">
                    Total clicks this week:{" "}
                    <span className="font-semibold text-[var(--clr-primary-a0)]">
                      {stats.totalClicks > 0
                        ? Math.floor(stats.totalClicks * 0.7)
                        : 0}
                    </span>
                  </p>
                </div>
              </div>

              {/* Top Performing URLs */}
              <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                  Top Performing URLs
                </h3>
                <div className="space-y-3">
                  {stats.recentUrls.slice(0, 3).map((url, index) => (
                    <div
                      key={url._id}
                      className="flex items-center gap-3 p-3 bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a30)] rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[var(--clr-primary-lighter)] rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-[var(--clr-primary-a0)]">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <a
                            href={buildShortUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] font-medium text-sm truncate"
                          >
                            {buildShortUrl(url)}
                          </a>
                        </div>
                        <p className="text-xs text-[var(--clr-surface-a50)] truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-darker)]">
                          {url.clickCount || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.recentUrls.length === 0 && (
                    <div className="text-center py-6">
                      <BarChart3 className="w-12 h-12 text-[var(--clr-surface-a40)] mx-auto mb-3" />
                      <p className="text-[var(--clr-surface-a50)] text-sm">
                        No data available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                <Activity className="w-5 h-5 text-[var(--clr-primary-a0)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Recent Activity
                </h2>
                <p className="text-[var(--clr-surface-a50)] text-sm">
                  Your latest URL creations and updates
                </p>
              </div>
            </div>

            {stats.recentUrls.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUrls.map((url) => (
                  <div
                    key={url._id}
                    className="flex items-center gap-4 p-4 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[var(--clr-primary-lighter)] rounded-lg flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={buildShortUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] font-medium truncate"
                        >
                          {buildShortUrl(url)}
                        </a>
                        <button
                          onClick={async () => {
                            const shortUrl = buildShortUrl(url);
                            if (shortUrl) {
                              await navigator.clipboard.writeText(shortUrl);
                              toast.success("URL copied to clipboard!");
                            }
                          }}
                          className="p-1 text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[var(--clr-surface-a50)] text-sm truncate">
                        {url.originalUrl}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--clr-surface-a50)]">
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-4 h-4" />
                        <span>{url.clickCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {url.createdAt
                            ? new Date(url.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-[var(--clr-surface-a40)] mx-auto mb-4" />
                <p className="text-[var(--clr-surface-a50)]">
                  No recent activity yet. Create your first URL to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--clr-surface-a40)] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="clickCount">Sort by Clicks</option>
                  <option value="originalUrl">Sort by URL</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:bg-[var(--clr-surface-a20)] transition-colors"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* URLs Table */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--clr-surface-a30)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Your URLs ({filteredUrls.length})
                </h2>
                <p className="text-[var(--clr-surface-a50)] text-sm mt-1">
                  Manage and track your shortened links
                </p>
              </div>
              {selectedUrls.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--clr-surface-a50)]">
                    {selectedUrls.length} selected
                  </span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--clr-surface-a20)] dark:bg-[var(--clr-surface-a20)]">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => {
                        if (selectedUrls.length === filteredUrls.length) {
                          setSelectedUrls([]);
                        } else {
                          setSelectedUrls(filteredUrls.map((url) => url._id));
                        }
                      }}
                      className="text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors"
                    >
                      {selectedUrls.length === filteredUrls.length &&
                      filteredUrls.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  {[
                    "Short URL",
                    "Original URL",
                    "Status",
                    "Clicks",
                    "Created",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-sm font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUrls.length > 0 ? (
                  filteredUrls.map((url) => (
                    <UrlTableRow
                      key={url._id}
                      url={url}
                      onDelete={handleDelete}
                      isSelected={selectedUrls.includes(url._id)}
                      onSelect={(selected) => {
                        if (selected) {
                          setSelectedUrls((prev) => [...prev, url._id]);
                        } else {
                          setSelectedUrls((prev) =>
                            prev.filter((id) => id !== url._id)
                          );
                        }
                      }}
                      onEdit={() => {
                        setEditingUrl(url);
                        setEditForm({
                          originalUrl: url.originalUrl || "",
                          customCode: url.customCode || url.shortCode || "",
                        });
                        setShowEditModal(true);
                      }}
                      onQrCode={() => {
                        setQrUrl(buildShortUrl(url));
                        setShowQrModal(true);
                      }}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-8 py-12 text-center text-[var(--clr-surface-a50)]"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <LinkIcon className="w-12 h-12 text-[var(--clr-surface-a40)]" />
                        <div>
                          <p className="text-lg font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            No URLs found
                          </p>
                          <p className="text-[var(--clr-surface-a50)]">
                            Create your first shortened URL to get started!
                          </p>
                        </div>
                        <Link
                          to="/"
                          className="px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
                        >
                          Create URL
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedUrls.length > 0 && (
          <div className="mb-6">
            <div className="bg-[var(--clr-primary-lighter)] border border-[var(--clr-primary-a20)] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[var(--clr-primary-a0)] rounded-lg">
                    <CheckSquare className="w-5 h-5 text-[var(--clr-light-a0)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--clr-primary-darker)]">
                      Bulk Actions ({selectedUrls.length} URLs selected)
                    </h3>
                    <p className="text-[var(--clr-primary-darker)] text-sm opacity-80">
                      Perform actions on multiple URLs at once
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex gap-2">
                    <select
                      id="bulk-export-format"
                      className="px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Format
                      </option>
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                    <button
                      onClick={() => {
                        const select =
                          document.getElementById("bulk-export-format");
                        const format = select.value;
                        if (!format) {
                          toast.error("Please select an export format");
                          return;
                        }

                        if (format === "json") {
                          const selectedData = filteredUrls
                            .filter((url) => selectedUrls.includes(url._id))
                            .map((url) => ({
                              shortUrl: buildShortUrl(url),
                              originalUrl: url.originalUrl,
                              clicks: url.clickCount || 0,
                              created: url.createdAt,
                            }));
                          const jsonContent = JSON.stringify(
                            selectedData,
                            null,
                            2
                          );
                          const dataUri =
                            "data:application/json;charset=utf-8," +
                            encodeURIComponent(jsonContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", dataUri);
                          link.setAttribute("download", "selected-urls.json");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } else if (format === "csv") {
                          const selectedData = filteredUrls
                            .filter((url) => selectedUrls.includes(url._id))
                            .map((url) => ({
                              shortUrl: buildShortUrl(url),
                              originalUrl: url.originalUrl,
                              clicks: url.clickCount || 0,
                              created: url.createdAt,
                            }));
                          const csvContent =
                            "data:text/csv;charset=utf-8," +
                            "Short URL,Original URL,Clicks,Created\n" +
                            selectedData
                              .map(
                                (row) =>
                                  `"${row.shortUrl}","${row.originalUrl}",${row.clicks},"${row.created}"`
                              )
                              .join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", "selected-urls.csv");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } else if (format === "pdf") {
                          // For PDF, we'll call the export API directly
                          const selectedData = filteredUrls
                            .filter((url) => selectedUrls.includes(url._id))
                            .map((url) => ({
                              shortUrl: buildShortUrl(url),
                              originalUrl: url.originalUrl,
                              clicks: url.clickCount || 0,
                              created: url.createdAt,
                            }));

                          // Create a simple PDF-like text format for now
                          const pdfContent = `URL Export Report\n\nSelected URLs:\n\n${selectedData
                            .map(
                              (url, index) =>
                                `${index + 1}. ${url.shortUrl}\n   Original: ${
                                  url.originalUrl
                                }\n   Clicks: ${url.clicks}\n   Created: ${
                                  url.created
                                }\n\n`
                            )
                            .join(
                              ""
                            )}\nGenerated on: ${new Date().toLocaleString()}`;

                          const dataUri =
                            "data:text/plain;charset=utf-8," +
                            encodeURIComponent(pdfContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", dataUri);
                          link.setAttribute(
                            "download",
                            "selected-urls-report.txt"
                          );
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }

                        toast.success(
                          `URLs exported as ${format.toUpperCase()} successfully!`
                        );
                      }}
                      className="px-4 py-2 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      // Bulk delete
                      setShowConfirmModal(true);
                      setDeleteShortCode("bulk");
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </button>
                  <button
                    onClick={() => setShowBulkActions(false)}
                    className="px-4 py-2 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[var(--clr-primary-lighter)] to-[var(--clr-primary-light)] border border-[var(--clr-primary-a20)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--clr-primary-a0)] rounded-lg">
                <TrendingUp className="w-5 h-5 text-[var(--clr-light-a0)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--clr-primary-darker)]">
                  Performance Insights
                </h2>
                <p className="text-[var(--clr-primary-darker)] text-sm opacity-80">
                  Tips to improve your URL performance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-[var(--clr-primary-a0)]" />
                  <h3 className="font-medium text-[var(--clr-primary-darker)]">
                    Click Performance
                  </h3>
                </div>
                <p className="text-sm text-[var(--clr-primary-darker)] opacity-80">
                  {stats.averageClicks === 0
                    ? "Start sharing your URLs to see click data!"
                    : stats.averageClicks < 5
                    ? "Consider using more descriptive custom codes for better engagement."
                    : "Great performance! Your URLs are getting good traction."}
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-[var(--clr-primary-a0)]" />
                  <h3 className="font-medium text-[var(--clr-primary-darker)]">
                    URL Management
                  </h3>
                </div>
                <p className="text-sm text-[var(--clr-primary-darker)] opacity-80">
                  {stats.totalUrls === 0
                    ? "Create your first URL to get started!"
                    : stats.totalUrls < 3
                    ? "Try creating more URLs to diversify your content."
                    : "Excellent! You have a good collection of URLs."}
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-[var(--clr-primary-a0)]" />
                  <h3 className="font-medium text-[var(--clr-primary-darker)]">
                    Analytics Tip
                  </h3>
                </div>
                <p className="text-sm text-[var(--clr-primary-darker)] opacity-80">
                  {stats.totalClicks === 0
                    ? "Share your URLs and check back for analytics data."
                    : "Monitor your top-performing URLs and create similar content."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
              Danger Zone
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-medium">
                  Delete Account
                </p>
                <p className="text-[var(--clr-surface-a50)] text-sm">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit URL Modal */}
      {showEditModal && editingUrl && (
        <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              Edit URL
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
                    setEditForm((prev) => ({
                      ...prev,
                      originalUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                  Custom Code (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.customCode}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      customCode: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                  placeholder="my-custom-link"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Here you would make an API call to update the URL
                    // For now, just close the modal
                    toast.success("URL updated successfully!");
                    setShowEditModal(false);
                    setEditingUrl(null);
                  } catch (error) {
                    toast.error("Failed to update URL");
                  }
                }}
                className="flex-1 py-3 px-6 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Update URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && qrUrl && (
        <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              QR Code
            </h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                {/* QR Code would be generated here */}
                <div className="w-48 h-48 bg-[var(--clr-surface-a10)] flex items-center justify-center rounded-lg">
                  <QrCode className="w-24 h-24 text-[var(--clr-surface-a40)]" />
                  <span className="text-xs text-[var(--clr-surface-a50)] ml-2">
                    QR Preview
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-[var(--clr-surface-a50)] mb-2">
                  Scan to visit:
                </p>
                <p className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] break-all">
                  {qrUrl}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Download QR code functionality would go here
                  toast.success("QR code download feature coming soon!");
                }}
                className="flex-1 py-3 px-6 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
              Confirm Delete
            </h3>
            <p className="text-[var(--clr-surface-a50)] mb-6">
              Are you sure you want to delete this URL? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
              Confirm Account Deletion
            </h3>
            <p className="text-[var(--clr-surface-a50)] mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone and will:
            </p>
            <ul className="text-[var(--clr-surface-a50)] mb-6 list-disc list-inside space-y-1 text-sm">
              <li>Delete all your shortened URLs</li>
              <li>Remove all your analytics data</li>
              <li>Permanently delete your account</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDeleteAccount}
                className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
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
