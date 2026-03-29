import axios from "axios";
import process from "process";
const API_URL = process.env.VITE_APP_API_URL;

console.log("api url ========= "+ API_URL);

const axiosClient = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  withCredentials: true,

});

// Request Interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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