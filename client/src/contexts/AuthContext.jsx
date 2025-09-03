import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
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

  const login = async (email, password) => {
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
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
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
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
