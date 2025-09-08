import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Users,
  Link as LinkIcon,
  MousePointer,
  TrendingUp,
  Shield,
  Activity,
  Settings,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUrls: 0,
    totalClicks: 0,
    activeUsers: 0,
  });
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "unknown", message: "Checking..." },
    apiServer: { status: "unknown", message: "Checking..." },
    cache: { status: "unknown", message: "Checking..." },
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await axios.get(
        getApiUrl(`${API_ENDPOINTS.AUTH}/admin/stats`)
      );
      if (res.data?.success) {
        setStats(res.data.data);
        if (isRefresh) toast.success("Statistics refreshed");
      }
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
      toast.error("Failed to load admin statistics");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await axios.get(getApiUrl(API_ENDPOINTS.SYSTEM_STATUS));
      if (res.data?.success) {
        setSystemStatus(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch system status", err);
      // Keep default status on error
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await axios.get(getApiUrl(API_ENDPOINTS.ACTIVITY));
      if (res.data?.success) {
        setRecentActivity(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch recent activity", err);
      // Keep empty array on error
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchSystemStatus();
    fetchRecentActivity();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAdminStats();
      fetchSystemStatus();
      fetchRecentActivity();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchAdminStats(true);
    fetchSystemStatus();
    fetchRecentActivity();
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      bgColor: "bg-[var(--clr-primary-lighter)]",
      iconColor: "text-[var(--clr-primary-a0)]",
      description: "Registered users",
    },
    {
      title: "Total URLs",
      value: stats.totalUrls,
      icon: LinkIcon,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "Shortened URLs",
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks,
      icon: MousePointer,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "All-time clicks",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Activity,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      description: "Last 30 days",
    },
  ];

  const adminActions = [
    {
      title: "User Management",
      description: "View and manage all users, roles, and permissions",
      icon: Shield,
      iconColor: "text-[var(--clr-primary-a0)]",
      link: "/admin/users",
    },
    {
      title: "Link Management",
      description: "Manage and monitor all shortened URLs",
      icon: LinkIcon,
      iconColor: "text-blue-600",
      link: "/admin/links",
    },
    {
      title: "Activity Monitor",
      description: "Monitor system activity and user behavior",
      icon: Activity,
      iconColor: "text-orange-600",
      link: "/admin/activity",
    },
    {
      title: "System Health",
      description: "Check system status and performance metrics",
      icon: TrendingUp,
      iconColor: "text-green-600",
      link: "/admin/health",
    },
    {
      title: "Analytics",
      description: "System-wide analytics and performance insights",
      icon: BarChart3,
      iconColor: "text-purple-600",
      link: "/admin/analytics",
    },
    {
      title: "Settings",
      description: "Configure system preferences and global settings",
      icon: Settings,
      iconColor: "text-indigo-600",
      link: "/admin/settings",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--clr-surface-a30)] border-t-[var(--clr-primary-a0)] rounded-full animate-spin"></div>
          <p className="text-[var(--clr-surface-a50)] font-medium">
            Loading admin dashboard...
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
            <div>
              <h1 className="text-3xl xs:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                Admin Dashboard
              </h1>
              <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                System overview and management tools
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-fit self-end px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Stats"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 mb-6 xs:mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-4 xs:p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex md:flex-col lg:flex-row gap-3 xs:items-center md:items-start xs:gap-4">
                <div className={`p-2 xs:p-3 rounded-lg w-fit ${stat.bgColor}`}>
                  <stat.icon
                    className={`w-5 h-5 xs:w-6 xs:h-6 ${stat.iconColor}`}
                  />
                </div>
                <div>
                  <p className="text-xs xs:text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl xs:text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-[var(--clr-surface-tonal-a0)] dark:bg-[var(--clr-surface-tonal-a0)] border border-[var(--clr-surface-tonal-a20)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-[var(--clr-primary-a0)]">
                {stats.totalUrls > 0
                  ? (stats.totalClicks / stats.totalUrls).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-[var(--clr-surface-a50)]">
                Avg. clicks per URL
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--clr-primary-a0)]">
                {stats.totalUsers > 0
                  ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <p className="text-sm text-[var(--clr-surface-a50)]">
                User activity rate
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--clr-primary-a0)]">
                {stats.totalUsers > 0
                  ? (stats.totalUrls / stats.totalUsers).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-[var(--clr-surface-a50)]">
                URLs per user
              </p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl overflow-hidden">
          <div className="px-4 xs:px-6 py-3 xs:py-4 border-b border-[var(--clr-surface-a30)]">
            <h2 className="text-lg xs:text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              Administrative Tools
            </h2>
            <p className="text-[var(--clr-surface-a50)] text-xs xs:text-sm mt-1">
              Manage system settings, users, and monitor performance
            </p>
          </div>
          <div className="p-4 xs:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4">
              {adminActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.link}
                  className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] border border-[var(--clr-surface-a20)] p-4 xs:p-6 rounded-lg hover:bg-[var(--clr-surface-tonal-a0)] hover:border-[var(--clr-primary-a20)] transition-all duration-200 group"
                >
                  <div className="flex xs:flex-col lg:flex-row items-start gap-3 xs:gap-4">
                    <div className="p-2 rounded-lg bg-[var(--clr-surface-a10)] group-hover:bg-[var(--clr-primary-lighter)] transition-colors duration-200">
                      <action.icon
                        className={`w-5 h-5 xs:w-6 xs:h-6 ${action.iconColor}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm xs:text-base font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                        {action.title}
                      </h3>
                      <p className="text-xs xs:text-sm text-[var(--clr-surface-a50)]">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 xs:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-4 xs:p-6">
            <h3 className="text-base xs:text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--clr-surface-a50)]">Database</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      systemStatus.database?.status === "online"
                        ? "bg-green-500"
                        : systemStatus.database?.status === "offline"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span
                    className={`text-xs font-medium ${
                      systemStatus.database?.status === "online"
                        ? "text-green-600"
                        : systemStatus.database?.status === "offline"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {systemStatus.database?.message || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--clr-surface-a50)]">
                  API Server
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      systemStatus.apiServer?.status === "running"
                        ? "bg-green-500"
                        : systemStatus.apiServer?.status === "stopped"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span
                    className={`text-xs font-medium ${
                      systemStatus.apiServer?.status === "running"
                        ? "text-green-600"
                        : systemStatus.apiServer?.status === "stopped"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {systemStatus.apiServer?.message || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--clr-surface-a50)]">Cache</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      systemStatus.cache?.status === "active"
                        ? "bg-green-500"
                        : systemStatus.cache?.status === "inactive"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span
                    className={`text-xs font-medium ${
                      systemStatus.cache?.status === "active"
                        ? "text-green-600"
                        : systemStatus.cache?.status === "inactive"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {systemStatus.cache?.message || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-4 xs:p-6">
            <h3 className="text-base xs:text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.color || "bg-[var(--clr-primary-a0)]"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {activity.action}
                      </p>
                      <p className="text-xs text-[var(--clr-surface-a50)]">
                        {activity.user ? `${activity.user} • ` : ""}
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--clr-surface-a50)]">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
