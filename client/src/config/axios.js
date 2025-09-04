import axios from "axios";
import { API_BASE_URL } from "./api";

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
