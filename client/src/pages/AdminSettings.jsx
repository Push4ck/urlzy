import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Shield,
  Users,
  Settings,
  Server,
  Database,
  Activity,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Cpu,
  HardDrive,
  Clock,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Zap,
  BarChart3,
  Wrench,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    allowRegistration: true,
    requireEmailVerification: true,
    enableAnalytics: true,
  });
  const [advancedSettings, setAdvancedSettings] = useState({
    rateLimitWindow: 15,
    rateLimitMax: 100,
    maxUrlLength: 2048,
    defaultExpiryDays: 30,
    enableClickTracking: true,
    enableUserAnalytics: true,
    backupFrequency: "daily",
    logRetentionDays: 90,
    enableMaintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
  });
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [settingsRes, advancedRes, systemRes] = await Promise.all([
        axios.get(getApiUrl(`${API_ENDPOINTS.AUTH}/admin/settings`)),
        axios.get(getApiUrl(API_ENDPOINTS.ADVANCED_SETTINGS)),
        axios.get(getApiUrl(API_ENDPOINTS.SYSTEM_INFO)),
      ]);

      if (settingsRes.data?.success) {
        setSettings(settingsRes.data.data);
      }
      if (advancedRes.data?.success) {
        setAdvancedSettings(advancedRes.data.data);
      }
      if (systemRes.data?.success) {
        setSystemInfo(systemRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.AUTH}/admin/settings`),
        { [setting]: value }
      );
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, [setting]: value }));
        toast.success("Setting updated successfully");
      }
    } catch (err) {
      console.error("Failed to update setting", err);
      toast.error("Failed to update setting");
    }
  };

  const handleAdvancedSettingChange = async (updates) => {
    try {
      setSaving(true);
      const res = await axios.put(
        getApiUrl(API_ENDPOINTS.ADVANCED_SETTINGS),
        updates
      );
      if (res.data?.success) {
        setAdvancedSettings((prev) => ({ ...prev, ...updates }));
        toast.success("Advanced settings updated successfully");
      }
    } catch (err) {
      console.error("Failed to update advanced settings", err);
      toast.error("Failed to update advanced settings");
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceCleanup = async (type, days = null) => {
    try {
      setMaintenanceLoading(true);
      const res = await axios.post(
        getApiUrl(`${API_ENDPOINTS.MAINTENANCE}/cleanup`),
        {
          type,
          days,
        }
      );
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchAllData(); // Refresh data
      }
    } catch (err) {
      console.error("Failed to perform maintenance", err);
      toast.error("Failed to perform maintenance");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System Info", icon: Server },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "advanced", label: "Advanced", icon: Zap },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--clr-surface-a30)] border-t-[var(--clr-primary-a0)] rounded-full animate-spin"></div>
          <p className="text-[var(--clr-surface-a50)] font-medium">
            Loading admin settings...
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
                  Admin Settings
                </h1>
                <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                  Comprehensive system configuration and management
                </p>
              </div>
            </div>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-[var(--clr-surface-a30)]">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "border-[var(--clr-primary-a0)] text-[var(--clr-primary-a0)]"
                      : "border-transparent text-[var(--clr-surface-a50)] hover:text-[var(--clr-dark-a0)] dark:hover:text-[var(--clr-light-a0)] hover:border-[var(--clr-surface-a30)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
                  General Settings
                </h2>
                <div className="space-y-6">
                  <SettingToggle
                    title="Allow User Registration"
                    description="Allow new users to create accounts on the platform"
                    icon={Users}
                    value={settings.allowRegistration}
                    onChange={(value) =>
                      handleSettingChange("allowRegistration", value)
                    }
                  />
                  <SettingToggle
                    title="Require Email Verification"
                    description="Require email verification for new user accounts"
                    icon={Shield}
                    value={settings.requireEmailVerification}
                    onChange={(value) =>
                      handleSettingChange("requireEmailVerification", value)
                    }
                  />
                  <SettingToggle
                    title="Enable Analytics"
                    description="Collect and analyze URL usage statistics"
                    icon={BarChart3}
                    value={settings.enableAnalytics}
                    onChange={(value) =>
                      handleSettingChange("enableAnalytics", value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--clr-surface-a50)]">
                        Rate Limit Window (minutes)
                      </label>
                      <input
                        type="number"
                        value={advancedSettings.rateLimitWindow}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            rateLimitWindow: parseInt(e.target.value),
                          }))
                        }
                        onBlur={(e) =>
                          handleAdvancedSettingChange({
                            rateLimitWindow: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--clr-surface-a50)]">
                        Max Requests per Window
                      </label>
                      <input
                        type="number"
                        value={advancedSettings.rateLimitMax}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            rateLimitMax: parseInt(e.target.value),
                          }))
                        }
                        onBlur={(e) =>
                          handleAdvancedSettingChange({
                            rateLimitMax: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                      />
                    </div>
                  </div>
                  <SettingToggle
                    title="Enable Click Tracking"
                    description="Track and log all URL click events"
                    icon={Activity}
                    value={advancedSettings.enableClickTracking}
                    onChange={(value) =>
                      handleAdvancedSettingChange({
                        enableClickTracking: value,
                      })
                    }
                  />
                  <SettingToggle
                    title="Enable User Analytics"
                    description="Collect detailed user behavior analytics"
                    icon={Eye}
                    value={advancedSettings.enableUserAnalytics}
                    onChange={(value) =>
                      handleAdvancedSettingChange({
                        enableUserAnalytics: value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          {activeTab === "system" && systemInfo && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server Information */}
                <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                    Server Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--clr-surface-a50)]">
                        Uptime
                      </span>
                      <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {formatUptime(systemInfo.server.uptime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--clr-surface-a50)]">
                        Memory Usage
                      </span>
                      <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {systemInfo.server.memory.used} MB /{" "}
                        {systemInfo.server.memory.total} MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--clr-surface-a50)]">
                        CPU Cores
                      </span>
                      <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {systemInfo.server.cpu.cores}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--clr-surface-a50)]">
                        Node Version
                      </span>
                      <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {systemInfo.server.cpu.nodeVersion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Database Information */}
                <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                    Database Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--clr-surface-a50)]">
                        Status
                      </span>
                      <div className="flex items-center gap-2">
                        {systemInfo.database.connected ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`font-medium ${
                            systemInfo.database.connected
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {systemInfo.database.connected
                            ? "Connected"
                            : "Disconnected"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--clr-surface-a50)]">
                        Database
                      </span>
                      <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {systemInfo.database.name}
                      </span>
                    </div>
                    {systemInfo.database.stats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--clr-surface-a50)]">
                            Collections
                          </span>
                          <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            {systemInfo.database.stats.collections}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--clr-surface-a50)]">
                            Storage Size
                          </span>
                          <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            {systemInfo.database.stats.storageSize}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Environment Information */}
              <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  Environment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[var(--clr-surface-a5)] dark:bg-[var(--clr-surface-a15)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--clr-primary-a0)] mb-1">
                      {systemInfo.environment.nodeEnv}
                    </div>
                    <div className="text-sm text-[var(--clr-surface-a50)]">
                      Environment
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[var(--clr-surface-a5)] dark:bg-[var(--clr-surface-a15)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--clr-primary-a0)] mb-1">
                      {systemInfo.environment.port}
                    </div>
                    <div className="text-sm text-[var(--clr-surface-a50)]">
                      Port
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[var(--clr-surface-a5)] dark:bg-[var(--clr-surface-a15)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--clr-primary-a0)] mb-1">
                      {systemInfo.environment.timezone}
                    </div>
                    <div className="text-sm text-[var(--clr-surface-a50)]">
                      Timezone
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tools */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
                  System Maintenance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-[var(--clr-surface-a30)] rounded-lg">
                    <h3 className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                      Clean Expired URLs
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)] mb-4">
                      Remove URLs that have expired
                    </p>
                    <button
                      onClick={() => handleMaintenanceCleanup("expired")}
                      disabled={maintenanceLoading}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {maintenanceLoading
                        ? "Cleaning..."
                        : "Clean Expired URLs"}
                    </button>
                  </div>

                  <div className="p-4 border border-[var(--clr-surface-a30)] rounded-lg">
                    <h3 className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                      Clean Old Click Events
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)] mb-4">
                      Remove click events older than 30 days
                    </p>
                    <button
                      onClick={() => handleMaintenanceCleanup("old_clicks", 30)}
                      disabled={maintenanceLoading}
                      className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-[var(--clr-light-a0)] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {maintenanceLoading ? "Cleaning..." : "Clean Old Events"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    Advanced Settings
                  </h2>
                  <button
                    onClick={() =>
                      handleAdvancedSettingChange(advancedSettings)
                    }
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                        Max URL Length
                      </label>
                      <input
                        type="number"
                        value={advancedSettings.maxUrlLength}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            maxUrlLength: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                        Default Expiry Days
                      </label>
                      <input
                        type="number"
                        value={advancedSettings.defaultExpiryDays}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            defaultExpiryDays: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={advancedSettings.backupFrequency}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            backupFrequency: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                        Log Retention (Days)
                      </label>
                      <input
                        type="number"
                        value={advancedSettings.logRetentionDays}
                        onChange={(e) =>
                          setAdvancedSettings((prev) => ({
                            ...prev,
                            logRetentionDays: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                      />
                    </div>

                    <SettingToggle
                      title="Maintenance Mode"
                      description="Put the system in maintenance mode"
                      icon={AlertTriangle}
                      value={advancedSettings.enableMaintenanceMode}
                      onChange={(value) =>
                        setAdvancedSettings((prev) => ({
                          ...prev,
                          enableMaintenanceMode: value,
                        }))
                      }
                    />

                    {advancedSettings.enableMaintenanceMode && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                          Maintenance Message
                        </label>
                        <textarea
                          value={advancedSettings.maintenanceMessage}
                          onChange={(e) =>
                            setAdvancedSettings((prev) => ({
                              ...prev,
                              maintenanceMessage: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Setting Toggle Component
const SettingToggle = ({ title, description, icon: Icon, value, onChange }) => (
  <div className="flex items-center justify-between p-4 border border-[var(--clr-surface-a30)] rounded-lg hover:bg-[var(--clr-surface-a5)] dark:hover:bg-[var(--clr-surface-a15)] transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[var(--clr-primary-lighter)] dark:bg-[var(--clr-primary-a20)]">
        {Icon && <Icon className="w-4 h-4 text-[var(--clr-primary-a0)]" />}
      </div>
      <div>
        <h4 className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
          {title}
        </h4>
        <p className="text-sm text-[var(--clr-surface-a50)]">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        value ? "bg-[var(--clr-primary-a0)]" : "bg-[var(--clr-surface-a30)]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default AdminSettings;
