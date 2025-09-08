import axios from "axios";
import { API_BASE_URL } from "./api";

// Global maintenance mode state
let maintenanceMode = false;
let maintenanceMessage = "";

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Function to check maintenance mode
export const isMaintenanceMode = () => maintenanceMode;
export const getMaintenanceMessage = () => maintenanceMessage;

// Function to proactively check maintenance status
export const checkMaintenanceStatus = async () => {
  try {
    console.log('Checking maintenance status...');
    const response = await axios.get(`${API_BASE_URL}/api/maintenance/status`);
    console.log('Maintenance status response:', response.data);

    if (response.data.success) {
      maintenanceMode = response.data.maintenance;
      maintenanceMessage = response.data.message;
      console.log('Maintenance mode:', maintenanceMode, 'Message:', maintenanceMessage);

      if (maintenanceMode) {
        // Dispatch maintenance mode event
        const event = new CustomEvent('maintenance-mode', {
          detail: { message: maintenanceMessage }
        });
        window.dispatchEvent(event);
        console.log('Maintenance mode event dispatched');
      }
    }
  } catch (error) {
    console.warn('Failed to check maintenance status:', error.message);
    // If we can't check maintenance status, assume no maintenance
    maintenanceMode = false;
  }
};

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle maintenance mode responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503 && error.response?.data?.maintenance) {
      // Set maintenance mode
      maintenanceMode = true;
      maintenanceMessage = error.response.data.message || "System is under maintenance. Please try again later.";

      // Trigger a custom event to notify the app
      const event = new CustomEvent('maintenance-mode', {
        detail: { message: maintenanceMessage }
      });

      // Dispatch the event asynchronously to ensure it's processed
      setTimeout(() => {
        window.dispatchEvent(event);
      }, 0);

      // Don't show error toast for maintenance mode
      return Promise.reject({
        ...error,
        maintenance: true,
        silent: true
      });
    }
    return Promise.reject(error);
  }
);

export default api;
