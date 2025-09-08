import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (check both localStorage and sessionStorage)
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  // Listen for storage changes to sync authentication across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If token was removed from localStorage (logout from another tab)
      if (e.key === "token" && e.oldValue && !e.newValue) {
        // Clear user state and axios headers
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
      }
      // If user data was removed
      if (e.key === "user" && e.oldValue && !e.newValue) {
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
      }
      // If token was added to localStorage (login from another tab)
      if (e.key === "token" && !e.oldValue && e.newValue) {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
          axios.defaults.headers.common["Authorization"] = `Bearer ${e.newValue}`;
        }
      }
      // If user data was added
      if (e.key === "user" && !e.oldValue && e.newValue) {
        const token = localStorage.getItem("token");
        if (token) {
          setUser(JSON.parse(e.newValue));
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      }
    };

    // Listen for storage events (cross-tab synchronization)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const extractErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (!data) return fallback;
    if (typeof data.message === "string" && data.message) return data.message;
    if (Array.isArray(data.errors) && data.errors.length) {
      // express-validator format
      return data.errors.map((e) => e.msg).join("; ");
    }
    return fallback;
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/login`),
        { email, password }
      );

      if (response.data.success) {
        const data = response.data.data;
        // If 2FA required
        if (data?.twoFactorRequired && data?.loginToken) {
          return {
            success: true,
            twoFactorRequired: true,
            loginToken: data.loginToken,
          };
        }
        if (data?.token && data?.user) {
          const { token, user } = data;
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem("token", token);
          storage.setItem("user", JSON.stringify(user));
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(user);
          return { success: true };
        }
      }
      return { success: false, message: "Login failed" };
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "An error occurred during login"
      );
      // Pass through gating flags if present
      const requiresVerification =
        error?.response?.data?.requiresVerification || false;
      return {
        success: false,
        message,
        requiresVerification,
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/register`),
        { username, email, password }
      );

      if (response.data.success) {
        // We no longer auto-login; we gate by email verification
        return { success: true };
      }
      return { success: false, message: "Registration failed" };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(
          error,
          "An error occurred during registration"
        ),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get(getApiUrl(`${API_ENDPOINTS.AUTH}/profile`));
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);

        // Update stored user data
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
          storage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
