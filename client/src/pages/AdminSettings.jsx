import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { Shield, Users, Settings } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    allowRegistration: true,
    requireEmailVerification: true,
    enableAnalytics: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(getApiUrl(`${API_ENDPOINTS.AUTH}/admin/settings`));
        if (res.data?.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin settings", err);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = async (setting, value) => {
    try {
      const res = await axios.put(getApiUrl(`${API_ENDPOINTS.AUTH}/admin/settings`), {
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

  const settingsOptions = [
    {
      key: "allowRegistration",
      title: "Allow User Registration",
      description: "Allow new users to register accounts",
      icon: Users,
      type: "toggle",
    },
    {
      key: "requireEmailVerification",
      title: "Require Email Verification",
      description: "Require email verification for new accounts",
      icon: Shield,
      type: "toggle",
    },
    {
      key: "enableAnalytics",
      title: "Enable Analytics",
      description: "Collect URL usage analytics",
      icon: Settings,
      type: "toggle",
    },
    {
      key: "adminInfo",
      title: "Admin Privileges",
      description: "As admin, you have access to all premium features plus system management",
      icon: Shield,
      type: "info",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Admin Settings
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Configure system-wide settings and preferences
          </p>
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
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
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
                  ) : option.type === "number" ? (
                    <input
                      type="number"
                      value={settings[option.key]}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          [option.key]: parseInt(e.target.value),
                        }))
                      }
                      onBlur={(e) =>
                        handleSettingChange(option.key, parseInt(e.target.value))
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : option.type === "info" ? (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-800 mb-1">Admin Privileges Include:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>All premium features (password protection, custom expiry)</li>
                        <li>User management and role assignment</li>
                        <li>System-wide analytics and monitoring</li>
                        <li>Configuration of system settings</li>
                        <li>Premium status management for users</li>
                      </ul>
                    </div>
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

export default AdminSettings;