export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// You can also add other API-related configurations here
export const API_ENDPOINTS = {
  SHORTEN: "/api/urls/shorten",
  URLS: "/api/urls",
  AUTH: "/api/auth",
  BILLING: "/api/billing",
};

// Helper function for making API calls
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
