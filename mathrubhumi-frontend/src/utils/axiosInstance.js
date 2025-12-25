// src/utils/axiosInstance.js
import axios from "axios";
import { getSession, clearSession } from "./session";

const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = "lastActivityTs";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Track user activity to enforce idle timeout
if (typeof window !== "undefined" && !window.__idleActivityHooksSetup) {
  const bumpActivity = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  };
  ["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((evt) =>
    window.addEventListener(evt, bumpActivity, { passive: true })
  );
  bumpActivity();
  window.__idleActivityHooksSetup = true;
}

// Add access token to each request and enforce idle timeout
api.interceptors.request.use((config) => {
  const now = Date.now();
  const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);

  if (lastActivity && now - lastActivity > IDLE_LIMIT_MS) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(new axios.Cancel("Session expired due to inactivity"));
  }

  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const { branch } = getSession();
  if (branch?.id) {
    config.headers["X-Branch-Id"] = String(branch.id);
  }
  return config;
});

// Handle 401 responses and attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If refresh itself failed, do not retry refresh -> just logout
    const isRefreshCall =
      originalRequest?.url?.includes("auth/refresh") ||
      originalRequest?.url?.includes("/api/auth/refresh");

    if (error.response && error.response.status === 401 && isRefreshCall) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        const response = await api.post("auth/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = response.data.access;
        const newRefresh = response.data.refresh || refreshToken;

        // Save new access token
        localStorage.setItem("access", newAccess);
        // Save rotated refresh token when provided (SIMPLE_JWT rotation)
        if (newRefresh) {
          localStorage.setItem("refresh", newRefresh);
        }

        // Update the Authorization header in the default Axios instance
        api.defaults.headers["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // ✅ Add error log here
        console.error("Token refresh failed:", refreshError);
        
        // Refresh token failed — clear tokens and redirect to login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";  // or '/'
        }
      }
    }

    // Any other 401 (including no refresh token) → clear and redirect
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
