import axios from "axios";

// Read from Vite environment variable
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api/v1";

console.log("[axiosClient] API Base URL:", API_BASE);

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,  // Required for CORS with credentials
  headers: {
    "Content-Type": "application/json",
    // Don't set Access-Control-Allow-Origin - that's a response header from server!
  },
});

// Request Interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");  // Use accessToken (not "token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;