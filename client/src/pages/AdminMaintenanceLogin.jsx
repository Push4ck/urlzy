import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Lock, Mail, Eye, EyeOff } from "lucide-react";
import axios from "../config/axios";
import toast from "react-hot-toast";
import { isMaintenanceMode as checkMaintenanceMode } from "../config/axios";

const AdminMaintenanceLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if maintenance mode is active
    if (!checkMaintenanceMode()) {
      toast.error("This page is only accessible during maintenance mode.");
      navigate("/");
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/admin-login", formData);

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Admin login successful! Welcome back.");

        // Redirect to home page - admin will now see normal application
        navigate("/");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
              Admin Access
            </h1>
            <p className="text-sm text-[var(--clr-surface-a50)]">
              System is under maintenance. Admin login required.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Maintenance Mode Active
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  This login is only available during system maintenance and requires admin privileges.
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--clr-surface-a50)]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--clr-surface-a50)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a20)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--clr-surface-a50)] hover:text-[var(--clr-dark-a0)] dark:hover:text-[var(--clr-light-a0)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] disabled:bg-[var(--clr-surface-a30)] disabled:cursor-not-allowed text-[var(--clr-light-a0)] font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Admin Login
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--clr-surface-a60)]">
              This page is only accessible during system maintenance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMaintenanceLogin;