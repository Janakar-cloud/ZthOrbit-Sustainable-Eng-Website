import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  withCredentials: true,
});

// Queue of callbacks waiting for a fresh access token while a refresh is in-flight
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

// Request Interceptor — attach access token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor — on 401: try silent refresh, else force logout
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshTk = localStorage.getItem("refreshToken");

      if (!refreshTk) {
        window.dispatchEvent(new CustomEvent("auth:force-logout"));
        return Promise.reject(error);
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post("/api/v1/auth/refresh", {
          refreshToken: refreshTk,
        });
        const newAccessToken: string = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        processQueue(newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(original);
      } catch {
        window.dispatchEvent(new CustomEvent("auth:force-logout"));
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;