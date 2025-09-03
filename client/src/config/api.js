export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// You can also add other API-related configurations here
export const API_ENDPOINTS = {
  SHORTEN: "/api/urls/shorten",
  URLS: "/api/urls",
  AUTH: "/api/auth",
  BILLING: "/api/billing",
  FORGOT_REQUEST: "/api/auth/forgot-password/request",
  FORGOT_VERIFY: "/api/auth/forgot-password/verify",
  FORGOT_RESET: "/api/auth/forgot-password/reset",
  URL_PASSWORD: (code) => `/api/urls/${code}/password`,
};

// Helper function for making API calls
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
