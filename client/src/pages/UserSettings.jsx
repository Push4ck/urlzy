import React, { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import AuthContext from "../contexts/AuthContext";
import { User, Shield, Bell, Key } from "lucide-react";

const UserSettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    twoFactorEnabled: user?.twoFactorEnabled || false,
    emailNotifications: true,
    profileVisibility: "private",
  });

  const handleSettingChange = async (setting, value) => {
    try {
      const res = await axios.put(getApiUrl(`${API_ENDPOINTS.AUTH}/settings`), {
        [setting]: value,
      });
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, [setting]: value }));
        toast.success("Setting updated successfully");
      }
    } catch (err) {
      console.error("Failed to update setting", err);
      toast.error("Failed to update setting");
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await axios.post(getApiUrl(`${API_ENDPOINTS.AUTH}/2fa/enable`));
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, twoFactorEnabled: true }));
        toast.success("Two-factor authentication enabled");
      }
    } catch (err) {
      console.error("Failed to enable 2FA", err);
      toast.error("Failed to enable 2FA");
    }
  };

  const handleDisable2FA = async () => {
    try {
      const res = await axios.post(getApiUrl(`${API_ENDPOINTS.AUTH}/2fa/disable`));
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, twoFactorEnabled: false }));
        toast.success("Two-factor authentication disabled");
      }
    } catch (err) {
      console.error("Failed to disable 2FA", err);
      toast.error("Failed to disable 2FA");
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Account Settings
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Profile Info */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100 mb-8 animate-fade-in-up animation-delay-100">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.username}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Role: {user?.role || "user"}
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6 animate-fade-in-up animation-delay-200">
          {settingsOptions.map((option) => (
            <div
              key={option.key}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  {option.type === "toggle" ? (
                    <button
                      onClick={() =>
                        handleSettingChange(option.key, !settings[option.key])
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings[option.key] ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[option.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : option.type === "action" ? (
                    <button
                      onClick={option.action}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        settings.twoFactorEnabled
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {option.actionText}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;