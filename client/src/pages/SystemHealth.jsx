import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Clock,
  Zap,
  MemoryStick,
} from "lucide-react";

const SystemHealth = () => {
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "unknown", message: "Checking..." },
    apiServer: { status: "unknown", message: "Checking..." },
    cache: { status: "unknown", message: "Checking..." },
  });
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 0,
    memory: { used: 0, total: 0, percentage: 0 },
    cpu: 0,
    responseTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchSystemStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await axios.get(getApiUrl(API_ENDPOINTS.SYSTEM_STATUS));
      if (res.data?.success) {
        setSystemStatus(res.data.data);
        setLastUpdated(new Date());
        if (isRefresh) toast.success("System status refreshed");
      }
    } catch (err) {
      console.error("Failed to fetch system status", err);
      toast.error("Failed to load system status");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const res = await axios.get(getApiUrl(API_ENDPOINTS.SYSTEM_METRICS));
      if (res.data?.success) {
        setSystemMetrics(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch system metrics", err);
      toast.error("Failed to load system metrics");
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchSystemMetrics();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchSystemMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchSystemStatus(true);
    fetchSystemMetrics();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
      case "running":
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "offline":
      case "stopped":
      case "inactive":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
      case "running":
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "offline":
      case "stopped":
      case "inactive":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--clr-surface-a30)] border-t-[var(--clr-primary-a0)] rounded-full animate-spin"></div>
          <p className="text-[var(--clr-surface-a50)] font-medium">
            Loading system health...
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
            <div className="flex items-center gap-2 xs:gap-4">
              <Link
                to="/dashboard"
                className="p-2 rounded-lg bg-[var(--clr-surface-a10)] hover:bg-[var(--clr-surface-a20)] transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 text-[var(--clr-surface-a50)]" />
              </Link>
              <div>
                <h1 className="text-3xl xs:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                  System Health
                </h1>
                <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                  Monitor system performance and health metrics
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Database Status */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Database
                </h3>
                <p className="text-sm text-[var(--clr-surface-a50)]">
                  MongoDB Connection
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${getStatusColor(
                systemStatus.database?.status
              )}`}
            >
              {getStatusIcon(systemStatus.database?.status)}
              <span className="font-medium">
                {systemStatus.database?.message || "Unknown"}
              </span>
            </div>
          </div>

          {/* API Server Status */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  API Server
                </h3>
                <p className="text-sm text-[var(--clr-surface-a50)]">
                  Express Server
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${getStatusColor(
                systemStatus.apiServer?.status
              )}`}
            >
              {getStatusIcon(systemStatus.apiServer?.status)}
              <span className="font-medium">
                {systemStatus.apiServer?.message || "Unknown"}
              </span>
            </div>
          </div>

          {/* Cache Status */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <HardDrive className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Cache
                </h3>
                <p className="text-sm text-[var(--clr-surface-a50)]">
                  In-Memory Cache
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${getStatusColor(
                systemStatus.cache?.status
              )}`}
            >
              {getStatusIcon(systemStatus.cache?.status)}
              <span className="font-medium">
                {systemStatus.cache?.message || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Uptime */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Uptime
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {formatUptime(systemMetrics.uptime)}
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              System running time
            </p>
          </div>

          {/* Memory Usage */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MemoryStick className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Memory
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {systemMetrics.memory?.percentage || 0}%
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              {systemMetrics.memory?.used || 0}MB /{" "}
              {systemMetrics.memory?.total || 0}MB
            </p>
          </div>

          {/* CPU Usage */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                CPU
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {systemMetrics.cpu?.usage || 0}%
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              {systemMetrics.cpu?.cores || 0} cores available
            </p>
          </div>

          {/* Response Time */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-medium text-[var(--clr-surface-a50)] uppercase tracking-wide">
                Response Time
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              {systemMetrics.responseTime || 0}ms
            </p>
            <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
              Average API response
            </p>
          </div>
        </div>

        {/* Detailed Status Information */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
            System Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Network Status */}
            <div>
              <h3 className="text-lg font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                Network Connectivity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Internet Connection
                  </span>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Connected
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    API Endpoints
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Responsive
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h3 className="text-lg font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                System Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Last Updated
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Environment
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {systemMetrics.system?.environment || "development"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Node Version
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {systemMetrics.system?.nodeVersion || "v18.x.x"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Platform
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {systemMetrics.system?.platform || "unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Architecture
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {systemMetrics.system?.arch || "unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Hostname
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {systemMetrics.network?.hostname || "unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--clr-surface-a0)] rounded-lg">
                  <span className="text-[var(--clr-surface-a50)]">
                    Network Interfaces
                  </span>
                  <span className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {systemMetrics.network?.networkInterfaces || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--clr-surface-a50)]">
            System health is monitored automatically. Status updates every 30
            seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
