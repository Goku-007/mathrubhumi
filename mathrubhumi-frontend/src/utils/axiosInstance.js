// src/utils/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Add access token to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses and attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

        // Save new access token
        localStorage.setItem("access", newAccess);

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
        window.location.href = "/login";  // or '/'
      }
    }

    return Promise.reject(error);
  }
);

export default api;
