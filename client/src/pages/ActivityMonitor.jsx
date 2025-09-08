import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Activity,
  Users,
  Link as LinkIcon,
  MousePointer,
  RefreshCw,
  ArrowLeft,
  Clock,
  User,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Globe,
  Monitor,
  MapPin,
} from "lucide-react";

const ActivityMonitor = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedActivities, setExpandedActivities] = useState(new Set());
  const [stats, setStats] = useState({
    totalActivities: 0,
    userRegistrations: 0,
    urlCreations: 0,
    urlClicks: 0,
  });

  const fetchActivities = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await axios.get(getApiUrl(API_ENDPOINTS.ACTIVITY));
      if (res.data?.success) {
        setActivities(res.data.data);
        setFilteredActivities(res.data.data);
        setLastUpdated(new Date());
        calculateStats(res.data.data);
        if (isRefresh) toast.success("Activity data refreshed");
      }
    } catch (err) {
      console.error("Failed to fetch activities", err);
      toast.error("Failed to load activity data");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const calculateStats = (activityData) => {
    const stats = {
      totalActivities: activityData.length,
      userRegistrations: activityData.filter(
        (a) => a.type === "user_registration"
      ).length,
      urlCreations: activityData.filter((a) => a.type === "url_creation")
        .length,
      urlClicks: activityData.filter((a) => a.type === "url_click").length,
    };
    setStats(stats);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterActivities(term, filterType);
  };

  const handleFilter = (type) => {
    setFilterType(type);
    filterActivities(searchTerm, type);
  };

  const filterActivities = (search, type) => {
    let filtered = activities;

    // Filter by type
    if (type !== "all") {
      filtered = filtered.filter((activity) => activity.type === type);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        (activity) =>
          activity.action.toLowerCase().includes(search.toLowerCase()) ||
          activity.user.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_registration":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "url_creation":
        return <LinkIcon className="w-5 h-5 text-green-500" />;
      case "url_click":
        return <MousePointer className="w-5 h-5 text-purple-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "user_registration":
        return "border-[var(--clr-primary-a20)] bg-[var(--clr-primary-lighter)] dark:bg-[var(--clr-primary-a10)] dark:border-[var(--clr-primary-a30)]";
      case "url_creation":
        return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700";
      case "url_click":
        return "border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700";
      default:
        return "border-[var(--clr-surface-a30)] bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a20)] dark:border-[var(--clr-surface-a30)]";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Demo activity simulation for testing dynamic updates
  useEffect(() => {
    const demoInterval = setInterval(() => {
      // Simulate new activity every 2 minutes for demo
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        const demoActivities = [
          {
            id: Date.now(),
            type: "user_registration",
            action: "New user registered",
            user: "Demo User",
            timestamp: new Date().toISOString(),
            details: {
              originalUrl: "N/A",
              ip: "192.168.1.100",
              userAgent: "Demo Browser",
              referrer: "Direct",
            },
          },
          {
            id: Date.now() + 1,
            type: "url_creation",
            action: "URL shortened",
            user: "Demo User",
            timestamp: new Date().toISOString(),
            details: {
              originalUrl: "https://example.com/demo",
              ip: "192.168.1.100",
              userAgent: "Demo Browser",
              referrer: "Direct",
            },
          },
          {
            id: Date.now() + 2,
            type: "url_click",
            action: "URL clicked",
            user: "Anonymous",
            timestamp: new Date().toISOString(),
            details: {
              originalUrl: "https://example.com/demo",
              ip: "192.168.1.100",
              userAgent: "Demo Browser",
              referrer: "https://google.com",
            },
          },
        ];

        const randomActivity =
          demoActivities[Math.floor(Math.random() * demoActivities.length)];
        setActivities((prev) => [randomActivity, ...prev.slice(0, 49)]); // Keep max 50 activities
        setFilteredActivities((prev) => [randomActivity, ...prev.slice(0, 49)]);
        calculateStats([randomActivity, ...activities.slice(0, 49)]);
        setLastUpdated(new Date());
      }
    }, 30000);

    return () => clearInterval(demoInterval);
  }, [activities]);

  const handleRefresh = () => {
    fetchActivities(true);
  };

  const toggleActivityExpansion = (activityIndex) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityIndex)) {
      newExpanded.delete(activityIndex);
    } else {
      newExpanded.add(activityIndex);
    }
    setExpandedActivities(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--clr-surface-a30)] border-t-[var(--clr-primary-a0)] rounded-full animate-spin"></div>
          <p className="text-[var(--clr-surface-a50)] font-medium">
            Loading activity monitor...
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
                  Activity Monitor
                </h1>
                <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                  Real-time system activity and user behavior tracking
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
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Total Activities
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {stats.totalActivities}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Last 7 days
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                User Registrations
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {stats.userRegistrations}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              New accounts
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                URL Creations
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {stats.urlCreations}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Shortened URLs
            </p>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MousePointer className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                URL Clicks
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {stats.urlClicks}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Link visits
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--clr-surface-a50)]" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                <select
                  value={filterType}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                >
                  <option value="all">All Activities</option>
                  <option value="user_registration">User Registrations</option>
                  <option value="url_creation">URL Creations</option>
                  <option value="url_click">URL Clicks</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--clr-surface-a50)]">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--clr-surface-a30)]">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              Activity Feed
            </h2>
            <p className="text-[var(--clr-surface-a50)] text-sm mt-1">
              Real-time system activities and user interactions
            </p>
          </div>

          <div className="divide-y divide-[var(--clr-surface-a30)]">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div
                  key={index}
                  className={`transition-colors duration-200 ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {/* Row */}
                  <div
                    className="p-4 xs:p-6 hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] cursor-pointer"
                    onClick={() => toggleActivityExpansion(index)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Action + Timestamp */}
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                          <p className="text-sm xs:text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            {activity.action}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-[var(--clr-surface-a50)]">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(activity.timestamp)}</span>
                            </div>
                            {activity.details && (
                              <div>
                                {expandedActivities.has(index) ? (
                                  <ChevronDown className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* User + Type */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <User className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                          <span className="text-xs xs:text-sm text-[var(--clr-surface-a50)]">
                            {activity.user}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] xs:text-xs rounded-full ${
                              activity.type === "user_registration"
                                ? "bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-a0)] dark:bg-[var(--clr-primary-a20)] dark:text-[var(--clr-primary-a80)]"
                                : activity.type === "url_creation"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            }`}
                          >
                            {activity.type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedActivities.has(index) && activity.details && (
                    <div className="px-4 xs:px-6 pb-4 xs:pb-6 border-t border-[var(--clr-surface-a20)] bg-[var(--clr-surface-a5)] dark:bg-[var(--clr-surface-a15)]">
                      <div className="pt-4 space-y-3">
                        {activity.details.originalUrl &&
                          activity.details.originalUrl !== "N/A" && (
                            <div className="flex items-start gap-3">
                              <Globe className="w-4 h-4 text-[var(--clr-surface-a50)] mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] xs:text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                                  Original URL
                                </p>
                                <p className="text-xs xs:text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] break-all">
                                  {activity.details.originalUrl}
                                </p>
                              </div>
                            </div>
                          )}

                        {activity.details.ip &&
                          activity.details.ip !== "N/A" && (
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                              <div>
                                <p className="text-[10px] xs:text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                                  IP Address
                                </p>
                                <p className="text-xs xs:text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-mono">
                                  {activity.details.ip}
                                </p>
                              </div>
                            </div>
                          )}

                        {activity.details.userAgent &&
                          activity.details.userAgent !== "N/A" && (
                            <div className="flex items-start gap-3">
                              <Monitor className="w-4 h-4 text-[var(--clr-surface-a50)] mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] xs:text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                                  User Agent
                                </p>
                                <p className="text-xs xs:text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] break-words font-mono">
                                  {activity.details.userAgent}
                                </p>
                              </div>
                            </div>
                          )}

                        {activity.details.referrer &&
                          activity.details.referrer !== "Direct" && (
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                              <LinkIcon className="w-4 h-4 text-[var(--clr-surface-a50)]" />
                              <div>
                                <p className="text-[10px] xs:text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                                  Referrer
                                </p>
                                <p className="text-xs xs:text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] break-all">
                                  {activity.details.referrer}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 xs:p-12 text-center">
                <Activity className="w-10 h-10 xs:w-12 xs:h-12 text-[var(--clr-surface-a50)] mx-auto mb-4" />
                <h3 className="text-base xs:text-lg font-medium text-[var(--clr-surface-a50)] mb-2">
                  No activities found
                </h3>
                <p className="text-sm xs:text-base text-[var(--clr-surface-a50)]">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Activities will appear here as users interact with the system"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--clr-surface-a50)]">
            Activity monitor updates automatically every 30 seconds. Showing
            data from the last 7 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitor;
