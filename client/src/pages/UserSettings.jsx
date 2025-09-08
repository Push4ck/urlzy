import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import AuthContext from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  User,
  Shield,
  Bell,
  ChevronRight,
  Download,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
} from "lucide-react";

const UserSettings = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const { theme, setTheme, syncThemeFromUser } = useTheme();
  const [settings, setSettings] = useState({
    twoFactorEnabled: user?.twoFactorEnabled || false,
    emailNotifications: true,
    profileVisibility: "private",
    theme: theme,
  });

  // New state for enhanced features
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    urlClicks: user?.notifications?.urlClicks ?? true,
    weeklyReports: user?.notifications?.weeklyReports ?? true,
    securityAlerts: user?.notifications?.securityAlerts ?? true,
    marketingEmails: user?.notifications?.marketingEmails ?? false,
    systemUpdates: user?.notifications?.systemUpdates ?? true,
  });
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPasswordField, setShowCurrentPasswordField] =
    useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [lastDeviceRefresh, setLastDeviceRefresh] = useState(null);

  // Sync user preferences from database when user data is available
  useEffect(() => {
    if (user) {
      // Sync theme preference from user data
      if (user.theme && ["light", "dark", "system"].includes(user.theme)) {
        syncThemeFromUser(user.theme);
      }

      // Update local settings state to match user data
      setSettings((prev) => ({
        ...prev,
        theme: user.theme || theme,
      }));
    }
  }, [user, syncThemeFromUser, theme]);

  const handleSettingChange = async (setting, value) => {
    try {
      // Apply theme changes immediately in the UI
      if (setting === "theme") {
        setTheme(value);
      }

      const res = await axios.put(getApiUrl(`${API_ENDPOINTS.AUTH}/settings`), {
        [setting]: value,
      });
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, [setting]: value }));
        toast.success("Setting updated successfully");
      } else {
        // Revert the change if API call failed
        if (setting === "theme") {
          setTheme(settings.theme);
        }
      }
    } catch {
      // Revert the change if API call failed
      if (setting === "theme") {
        setTheme(settings.theme);
      }
      toast.error("Failed to update setting");
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/2fa/enable`)
      );
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, twoFactorEnabled: true }));
        toast.success("Two-factor authentication enabled");
      }
    } catch {
      toast.error("Failed to enable 2FA");
    }
  };

  const handleDisable2FA = async () => {
    try {
      const res = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/2fa/disable`)
      );
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, twoFactorEnabled: false }));
        toast.success("Two-factor authentication disabled");
      }
    } catch {
      toast.error("Failed to disable 2FA");
    }
  };

  // Password change handlers
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.AUTH}/change-password`),
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }
      );

      if (res.data?.success) {
        toast.success("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  // Profile update handler
  const handleProfileUpdate = async () => {
    try {
      const payload = {
        username: profileForm.username,
        email: profileForm.email,
      };

      // Include current password if email is being changed
      if (profileForm.email !== user?.email) {
        if (!currentPassword) {
          toast.error("Current password is required to change email");
          return;
        }
        payload.currentPassword = currentPassword;
      }

      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.AUTH}/profile`),
        payload
      );

      if (res.data?.success) {
        if (res.data.emailVerificationRequired) {
          // Email verification required
          setPendingEmail(res.data.pendingEmail);
          setShowProfileModal(false);
          setShowEmailVerificationModal(true);
          toast.info("Please check your new email for verification code");
        } else {
          // No email verification required
          toast.success("Profile updated successfully");
          // Refresh user data to update the UI
          await refreshUser();
          setShowProfileModal(false);
          setCurrentPassword("");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Email verification handler
  const handleEmailVerification = async () => {
    try {
      const res = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/verify-new-email`),
        {
          email: pendingEmail,
          otp: emailVerificationCode,
        }
      );

      if (res.data?.success) {
        toast.success("Email verified and updated successfully");
        // Refresh user data to update the UI
        await refreshUser();
        setShowEmailVerificationModal(false);
        setPendingEmail("");
        setEmailVerificationCode("");
        setCurrentPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify email");
    }
  };

  // Resend verification code handler
  const handleResendVerificationCode = async () => {
    try {
      // Use the existing verify-email/request endpoint to resend
      const res = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/verify-email/request`),
        {
          email: pendingEmail,
        }
      );

      if (res.data?.success) {
        toast.success("Verification code sent again");
      }
    } catch (error) {
      toast.error("Failed to resend verification code");
    }
  };

  // Notification preferences handler
  const handleNotificationUpdate = async () => {
    try {
      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.AUTH}/notifications`),
        {
          notifications: notificationPreferences,
        }
      );

      if (res.data?.success) {
        toast.success("Notification preferences updated successfully");
        // Refresh user data to update the UI
        await refreshUser();
        setShowNotificationsModal(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update notification preferences"
      );
    }
  };

  // Handle notification preference change
  const handleNotificationChange = (key, value) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Device management handlers
  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const res = await axios.get(getApiUrl(`${API_ENDPOINTS.AUTH}/devices`));

      if (res.data?.success) {
        setDevices(res.data.data);
        setLastDeviceRefresh(new Date());
      }
    } catch (error) {
      toast.error("Failed to load devices");
      console.error("Fetch devices error:", error);
    } finally {
      setLoadingDevices(false);
    }
  };

  // Auto-refresh devices every 30 seconds
  useEffect(() => {
    if (showDeviceModal) {
      // Initial fetch when modal opens
      fetchDevices();

      // Set up auto-refresh interval
      const interval = setInterval(() => {
        fetchDevices();
      }, 30000); // 30 seconds

      // Cleanup interval when modal closes or component unmounts
      return () => clearInterval(interval);
    }
  }, [showDeviceModal]);

  const handleRevokeDevice = async (deviceId) => {
    try {
      const res = await axios.delete(
        getApiUrl(`${API_ENDPOINTS.AUTH}/devices/${deviceId}`)
      );

      if (res.data?.success) {
        // Remove the device from the local state
        setDevices((prev) => prev.filter((device) => device.id !== deviceId));
        toast.success("Device access revoked successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to revoke device access"
      );
      console.error("Revoke device error:", error);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm account deletion");
      return;
    }

    try {
      const res = await axios.delete(
        getApiUrl(`${API_ENDPOINTS.AUTH}/delete-account`)
      );

      if (res.data?.success) {
        toast.success("Account deleted successfully");
        // Clear local storage and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  // Data export handlers
  const handleDataExport = async (format = "json") => {
    try {
      const res = await axios.get(
        getApiUrl(`${API_ENDPOINTS.AUTH}/export-data?format=${format}`),
        {
          responseType: format === "csv" || format === "pdf" ? "blob" : "json",
        }
      );

      if (format === "csv") {
        // Handle CSV download
        const blob = new Blob([res.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `user-data-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        // Handle PDF download
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `user-data-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // JSON format
        const dataStr = JSON.stringify(res.data.data, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute(
          "download",
          `user-data-${new Date().toISOString().split("T")[0]}.json`
        );
        linkElement.click();
      }

      toast.success(`Data exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to export data as ${format.toUpperCase()}`);
    }
  };

  const settingsOptions = [
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive email notifications for important updates",
      icon: Bell,
      type: "toggle",
    },
    {
      key: "twoFactorEnabled",
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: Shield,
      type: "action",
      action: settings.twoFactorEnabled ? handleDisable2FA : handleEnable2FA,
      actionText: settings.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA",
    },
    {
      key: "theme",
      title: "Theme Preference",
      description: "Choose your preferred theme",
      icon: settings.theme === "dark" ? Moon : Sun,
      type: "select",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)]">
      <div className="max-w-4xl mx-auto px-2 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 xs:mb-8">
          <h1 className="text-3xl xs:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
            Account Settings
          </h1>
          <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Profile Info */}
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-[var(--clr-primary-lighter)] flex items-center justify-center">
              <User className="w-10 h-10 text-[var(--clr-primary-a0)]" />
            </div>
            <div className="ml-6 flex-1">
              <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                {user?.username || "User"}
              </h3>
              <p className="text-[var(--clr-surface-a50)] mt-1">
                {user?.email || "user@example.com"}
              </p>
              <div className="inline-flex items-center px-2 py-1 mt-2 rounded-md text-xs font-medium bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-darker)]">
                {user?.role || "user"}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Security Settings */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Security & Privacy
            </h2>
            <div className="space-y-4">
              {settingsOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between py-4 px-4 rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] border border-[var(--clr-surface-a20)]"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                      <option.icon className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {option.title}
                      </h3>
                      <p className="text-sm text-[var(--clr-surface-a50)] mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center">
                    {option.type === "toggle" ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[option.key]}
                          onChange={(e) =>
                            handleSettingChange(option.key, e.target.checked)
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            settings[option.key]
                              ? "bg-[var(--clr-primary-a0)]"
                              : "bg-[var(--clr-surface-a30)]"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                              settings[option.key] ? "translate-x-6" : ""
                            }`}
                          />
                        </div>
                      </label>
                    ) : option.type === "action" ? (
                      <button
                        onClick={option.action}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 cursor-pointer ${
                          settings.twoFactorEnabled
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-darker)] hover:bg-[var(--clr-primary-light)]"
                        }`}
                      >
                        {option.actionText}
                      </button>
                    ) : option.type === "select" ? (
                      <select
                        value={settings[option.key]}
                        onChange={(e) =>
                          handleSettingChange(option.key, e.target.value)
                        }
                        className="px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                      >
                        {option.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Account Management
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] border border-[var(--clr-surface-a20)]">
                <div className="flex items-center">
                  <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                    <User className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Profile Information
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)] mt-1">
                      Update your personal information and preferences
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setProfileForm({
                      username: user?.username || "",
                      email: user?.email || "",
                    });
                    setCurrentPassword("");
                    setShowCurrentPasswordField(false);
                    setShowProfileModal(true);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] transition-colors duration-200 cursor-pointer"
                >
                  Edit Profile
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] border border-[var(--clr-surface-a20)]">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Notification Preferences
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)] mt-1">
                      Manage how and when you receive notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotificationPreferences({
                      urlClicks: user?.notifications?.urlClicks ?? true,
                      weeklyReports: user?.notifications?.weeklyReports ?? true,
                      securityAlerts:
                        user?.notifications?.securityAlerts ?? true,
                      marketingEmails:
                        user?.notifications?.marketingEmails ?? false,
                      systemUpdates: user?.notifications?.systemUpdates ?? true,
                    });
                    setShowNotificationsModal(true);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] transition-colors duration-200 cursor-pointer"
                >
                  Manage
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Password & Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] border border-[var(--clr-surface-a20)]">
                <div className="flex items-center">
                  <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                    <Lock className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Change Password
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)] mt-1">
                      Update your account password for better security
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-darker)] font-medium text-sm rounded-lg hover:bg-[var(--clr-primary-light)] transition-colors duration-200 cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Account Security Dashboard */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Account Security
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Security Status */}
              <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Security Status
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)]">
                      Your account security overview
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--clr-surface-a50)]">
                      Two-Factor Auth
                    </span>
                    <div className="flex items-center gap-2">
                      {settings.twoFactorEnabled ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Enabled
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-600">
                            Disabled
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--clr-surface-a50)]">
                      Password Strength
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      Strong
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--clr-surface-a50)]">
                      Email Verified
                    </span>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Recent Activity
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)]">
                      Your latest security events
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-green-100 rounded">
                      <Monitor className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        Successful login
                      </p>
                      <p className="text-xs text-[var(--clr-surface-a50)]">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <Smartphone className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        Password changed
                      </p>
                      <p className="text-xs text-[var(--clr-surface-a50)]">
                        2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-yellow-100 rounded">
                      <MapPin className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        New login location
                      </p>
                      <p className="text-xs text-[var(--clr-surface-a50)]">
                        1 week ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg border border-[var(--clr-surface-a20)] hover:border-[var(--clr-primary-a0)] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    Security Audit
                  </span>
                </div>
                <div className="flex gap-3">
                  <select
                    className="security-audit-select flex-1 px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select format
                    </option>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <button
                    onClick={() => {
                      const select = document.querySelector(
                        ".security-audit-select"
                      );
                      const format = select.value;
                      if (format) {
                        handleDataExport(format);
                      } else {
                        toast.error("Please select an export format");
                      }
                    }}
                    className="px-4 py-2 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg text-sm transition-colors duration-200 cursor-pointer"
                  >
                    Export
                  </button>
                </div>
                <p className="text-sm text-[var(--clr-surface-a50)] text-left mt-2">
                  Download security report in your preferred format
                </p>
              </div>

              <button
                onClick={() => {
                  setShowDeviceModal(true);
                  fetchDevices();
                }}
                className="p-4 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg border border-[var(--clr-surface-a20)] hover:border-[var(--clr-primary-a0)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Monitor className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    Device Management
                  </span>
                </div>
                <p className="text-sm text-[var(--clr-surface-a50)] text-left">
                  Manage connected devices
                </p>
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Data Management
            </h2>
            <div className="space-y-4">
              <div className="py-4 px-4 rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] border border-[var(--clr-surface-a20)]">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                    <Download className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Export Your Data
                    </h3>
                    <p className="text-sm text-[var(--clr-surface-a50)] mt-1">
                      Download a copy of all your data in your preferred format
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    className="px-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select format
                    </option>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <button
                    onClick={() => {
                      const select = document.querySelector("select");
                      const format = select.value;
                      if (format) {
                        handleDataExport(format);
                      } else {
                        toast.error("Please select an export format");
                      }
                    }}
                    className="px-6 py-2 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold text-sm rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-white dark:bg-red-900/10 border border-red-200 dark:border-red-700">
                <div>
                  <h3 className="text-base font-medium text-red-800 dark:text-red-400">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                    Permanently delete your account and all data. This cannot be
                    undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] font-medium text-sm rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Account Information */}
          <div className="bg-gradient-to-br from-[var(--clr-primary-lighter)] to-[var(--clr-primary-light)] dark:from-[var(--clr-primary-darker)] dark:to-[var(--clr-primary-dark)] border border-[var(--clr-primary-a0)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 dark:bg-white/20 bg-[var(--clr-primary-a0)]/20 rounded-xl">
                <User className="w-6 h-6 text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] mb-1">
                  Account Overview
                </h2>
                <p className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80 text-sm">
                  Your account details and statistics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="dark:bg-white/10 bg-[var(--clr-surface-a0)]/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80" />
                  <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80 text-sm font-medium">
                    Account Status
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-[var(--clr-light-a0)]">
                    Active
                  </span>
                </div>
              </div>

              <div className="dark:bg-white/10 bg-[var(--clr-surface-a0)]/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80" />
                  <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80 text-sm font-medium">
                    Member Since
                  </span>
                </div>
                <p className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Jan 2024"}
                </p>
              </div>

              <div className="dark:bg-white/10 bg-[var(--clr-surface-a0)]/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80" />
                  <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80 text-sm font-medium">
                    Last Login
                  </span>
                </div>
                <p className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "Today"}
                </p>
              </div>

              <div className="dark:bg-white/10 bg-[var(--clr-surface-a0)]/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80" />
                  <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)]/80 text-sm font-medium">
                    Subscription
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-[var(--clr-light-a0)]">
                    Free Plan
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="dark:bg-white/10 bg-[var(--clr-surface-a0)]/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium mb-3">
                  Account Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Username:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.username || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Email:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Role:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium capitalize">
                      {user?.role || "user"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Verified:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.verified ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dark:bg-white/10 bg-[var(--clr-surface-a0)]/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium mb-3">
                  Activity Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      URLs Created:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.urlsCreated || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Total Clicks:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.urlsCreated || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Active URLs:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.urlsCreated || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--clr-primary-darker)]/80 dark:text-[var(--clr-light-a0)]/80">
                      Premium:
                    </span>
                    <span className="text-[var(--clr-primary-darker)] dark:text-[var(--clr-light-a0)] font-medium">
                      {user?.premium ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cusror-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-[var(--clr-surface-a50)]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[var(--clr-surface-a50)]" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center classor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-[var(--clr-surface-a50)]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[var(--clr-surface-a50)]" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-[var(--clr-surface-a50)]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[var(--clr-surface-a50)]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 py-3 px-6 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                Edit Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      // Show password field if email is being changed
                      setShowCurrentPasswordField(
                        e.target.value !== user?.email
                      );
                    }}
                    className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                    placeholder="Enter email address"
                  />
                </div>

                {showCurrentPasswordField && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                      placeholder="Enter current password"
                      required
                    />
                    <p className="text-xs text-[var(--clr-surface-a50)] mt-1">
                      Required to change email address for security
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="flex-1 py-3 px-6 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        {showEmailVerificationModal && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                Verify New Email Address
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                    📧 Verification Required
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mb-2">
                    We've sent a verification code to:
                  </p>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    {pendingEmail}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                    Please check your email and enter the verification code
                    below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={emailVerificationCode}
                    onChange={(e) => setEmailVerificationCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors text-center text-lg font-mono"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                  />
                  <button
                    onClick={handleResendVerificationCode}
                    className="text-sm text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] mt-2 underline cursor-pointer"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEmailVerificationModal(false);
                    setPendingEmail("");
                    setEmailVerificationCode("");
                    setCurrentPassword("");
                  }}
                  className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailVerification}
                  disabled={
                    !emailVerificationCode || emailVerificationCode.length !== 6
                  }
                  className="flex-1 py-3 px-6 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] disabled:bg-[var(--clr-primary-lighter)] disabled:cursor-not-allowed text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Verify Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences Modal */}
        {showNotificationsModal && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      URL Clicks
                    </h4>
                    <p className="text-xs text-[var(--clr-surface-a50)]">
                      Get notified when your URLs are clicked
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.urlClicks}
                      onChange={(e) =>
                        handleNotificationChange("urlClicks", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        notificationPreferences.urlClicks
                          ? "bg-[var(--clr-primary-a0)]"
                          : "bg-[var(--clr-surface-a30)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                          notificationPreferences.urlClicks
                            ? "translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Weekly Reports
                    </h4>
                    <p className="text-xs text-[var(--clr-surface-a50)]">
                      Receive weekly analytics reports
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.weeklyReports}
                      onChange={(e) =>
                        handleNotificationChange(
                          "weeklyReports",
                          e.target.checked
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        notificationPreferences.weeklyReports
                          ? "bg-[var(--clr-primary-a0)]"
                          : "bg-[var(--clr-surface-a30)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                          notificationPreferences.weeklyReports
                            ? "translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Security Alerts
                    </h4>
                    <p className="text-xs text-[var(--clr-surface-a50)]">
                      Important security notifications
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.securityAlerts}
                      onChange={(e) =>
                        handleNotificationChange(
                          "securityAlerts",
                          e.target.checked
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        notificationPreferences.securityAlerts
                          ? "bg-[var(--clr-primary-a0)]"
                          : "bg-[var(--clr-surface-a30)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                          notificationPreferences.securityAlerts
                            ? "translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Marketing Emails
                    </h4>
                    <p className="text-xs text-[var(--clr-surface-a50)]">
                      Product updates and promotional content
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.marketingEmails}
                      onChange={(e) =>
                        handleNotificationChange(
                          "marketingEmails",
                          e.target.checked
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        notificationPreferences.marketingEmails
                          ? "bg-[var(--clr-primary-a0)]"
                          : "bg-[var(--clr-surface-a30)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                          notificationPreferences.marketingEmails
                            ? "translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      System Updates
                    </h4>
                    <p className="text-xs text-[var(--clr-surface-a50)]">
                      Platform maintenance and feature updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences.systemUpdates}
                      onChange={(e) =>
                        handleNotificationChange(
                          "systemUpdates",
                          e.target.checked
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        notificationPreferences.systemUpdates
                          ? "bg-[var(--clr-primary-a0)]"
                          : "bg-[var(--clr-surface-a30)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                          notificationPreferences.systemUpdates
                            ? "translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNotificationUpdate}
                  className="flex-1 py-3 px-6 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
                Delete Account
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                    ⚠️ Warning: This action cannot be undone
                  </h4>
                  <ul className="text-xs text-red-600 dark:text-red-500 space-y-1">
                    <li>• All your URLs will be permanently deleted</li>
                    <li>• All your click data will be lost</li>
                    <li>• Your account will be completely removed</li>
                    <li>• This action is irreversible</li>
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--clr-surface-a50)] mb-2">
                    Type "DELETE" to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-3 py-2 border border-red-200 dark:border-red-700 rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Type DELETE here"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                  }}
                  className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "DELETE"}
                  className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device Management Modal */}
        {showDeviceModal && (
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Device Management
                </h3>
                <div className="flex items-center gap-2 text-xs text-[var(--clr-surface-a50)]">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        loadingDevices
                          ? "bg-blue-500 animate-pulse"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <span>
                      {loadingDevices ? "Refreshing..." : "Auto-refresh"}
                    </span>
                  </div>
                  {lastDeviceRefresh && (
                    <span>
                      Last updated: {lastDeviceRefresh.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                    🔐 Security Information
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-500">
                    These are the devices that have accessed your account
                    recently. You can revoke access to any device except your
                    current one.
                    <br />
                    <span className="text-xs opacity-75 mt-1 block">
                      Device list auto-refreshes every 30 seconds.
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  {loadingDevices ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--clr-primary-a0)] mx-auto"></div>
                      <p className="text-sm text-[var(--clr-surface-a50)] mt-2">
                        Loading devices...
                      </p>
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center py-8">
                      <Monitor className="w-12 h-12 text-[var(--clr-surface-a40)] mx-auto mb-4" />
                      <p className="text-[var(--clr-surface-a50)]">
                        No devices found
                      </p>
                    </div>
                  ) : (
                    devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] rounded-lg border border-[var(--clr-surface-a20)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[var(--clr-primary-lighter)] rounded-lg">
                            {device.type === "desktop" ? (
                              <Monitor className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                                {device.name}
                              </h4>
                              {device.current && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                                <span className="text-xs text-[var(--clr-surface-a50)]">
                                  {device.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                                <span className="text-xs text-[var(--clr-surface-a50)]">
                                  {new Date(device.lastActive).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!device.current && (
                          <button
                            onClick={() => handleRevokeDevice(device.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-[var(--clr-light-a0)] text-sm rounded-lg transition-colors duration-200 cursor-pointer"
                          >
                            Revoke Access
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                    ⚠️ Important Notes
                  </h4>
                  <ul className="text-xs text-yellow-600 dark:text-yellow-500 space-y-1">
                    <li>
                      • Revoking access will sign out the device immediately
                    </li>
                    <li>• You cannot revoke access to your current device</li>
                    <li>
                      • If you suspect unauthorized access, change your password
                      immediately
                    </li>
                    <li>
                      • Consider enabling two-factor authentication for better
                      security
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeviceModal(false)}
                  className="flex-1 py-3 px-6 bg-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-a30)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
