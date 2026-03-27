const API_BASE = import.meta.env.VITE_API_BASE || "";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error("Missing VITE_API_BASE");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error || body?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Auth ────────────────────────────────────────────────────────

export type AuthTokens = { accessToken: string; refreshToken: string };

export function register(data: { email: string; password: string; name?: string }) {
  return request<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function verifyEmail(data: { email: string; code: string }) {
  return request<AuthTokens>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resendVerification(email: string) {
  return request<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function login(data: { email: string; password: string }) {
  return request<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function refreshToken(refreshTk: string) {
  return request<{ accessToken: string }>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTk }),
  });
}

export function logout(refreshTk: string) {
  return request<{ success: boolean }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTk }),
  });
}

export function requestPasswordReset(email: string) {
  return request<{ success: boolean }>("/auth/request-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(data: { token: string; password: string }) {
  return request<{ success: boolean }>("/auth/reset", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Live Config ─────────────────────────────────────────────────

export type LiveConfig = { streamUrl: string; title: string; description: string };
export type LiveAccess = LiveConfig & { expiresIn: number };

export function getLiveConfig() {
  return request<LiveConfig>("/live/config");
}

export function updateLiveConfig(data: LiveConfig) {
  return request<LiveConfig>("/live/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function requestLiveAccess() {
  return request<LiveAccess>("/live/access", {
    method: "POST",
  });
}

// ─── Articles ────────────────────────────────────────────────────

export interface ArticleItem {
  _id: string;
  title: string;
  subtitle?: string;
  bodyMd: string;
  readTime?: string;
  coverImage?: string;
  publishDate?: string;
  status: string;
  featured: boolean;
  tags: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function getArticles(params?: { tag?: string; search?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  return request<PaginatedResponse<ArticleItem>>(`/articles?${qs}`);
}

export function getArticle(id: string) {
  return request<ArticleItem>(`/articles/${encodeURIComponent(id)}`);
}

// ─── Podcasts ────────────────────────────────────────────────────

export interface PodcastItem {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: string;
  publishDate?: string;
  status: string;
  tags: string[];
}

export function getPodcasts(params?: { tag?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.page) qs.set("page", String(params.page));
  return request<PaginatedResponse<PodcastItem>>(`/podcasts?${qs}`);
}

export function createPodcast(data: { title: string; description: string; audioUrl: string; imageUrl?: string; duration?: string; tags?: string[] }) {
  return request<PodcastItem>("/podcasts", { method: "POST", body: JSON.stringify(data) });
}

export function updatePodcast(id: string, data: Partial<{ title: string; description: string; audioUrl: string; imageUrl: string; status: string; tags: string[] }>) {
  return request<PodcastItem>(`/podcasts/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deletePodcast(id: string) {
  return request<void>(`/podcasts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Videos ──────────────────────────────────────────────────────

export interface VideoItem {
  _id: string;
  title: string;
  description: string;
  streamUrl: string;
  thumbnailUrl: string;
  duration?: string;
  publishDate?: string;
  status: string;
  isLive: boolean;
  tags: string[];
}

export function getVideos(params?: { tag?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.page) qs.set("page", String(params.page));
  return request<PaginatedResponse<VideoItem>>(`/videos?${qs}`);
}

export function createVideo(data: { title: string; description: string; streamUrl: string; thumbnailUrl: string; duration?: string; tags?: string[] }) {
  return request<VideoItem>("/videos", { method: "POST", body: JSON.stringify(data) });
}

export function updateVideo(id: string, data: Partial<{ title: string; description: string; streamUrl: string; thumbnailUrl: string; status: string; tags: string[] }>) {
  return request<VideoItem>(`/videos/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteVideo(id: string) {
  return request<void>(`/videos/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Case Stories ────────────────────────────────────────────────

export interface CaseStoryItem {
  _id: string;
  title: string;
  impact: string;
  duration?: string;
  heroImage?: string;
  metrics?: { label: string; value: string }[];
  bodyMd?: string;
  tags: string[];
}

export function getCaseStories(params?: { tag?: string; search?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  return request<PaginatedResponse<CaseStoryItem>>(`/case-stories?${qs}`);
}

// ─── Admin: Dashboard Summary ────────────────────────────────────

export interface DashboardSummary {
  metrics: {
    numberOfVideo: number;
    totalUsers: number;
    onlineUsers: number;
    totalPodcasts: number;
  };
  trendingPodcastCategory: { categories: string[]; series: { name: string; data: number[] }[] };
  trendingArticleCategory: { categories: string[]; series: { name: string; data: number[] }[] };
  usersStatus: { label: string; value: number }[];
  recentActivity: unknown[];
}

export function getDashboardSummary() {
  return request<DashboardSummary>("/admin/summary");
}

// ─── Admin: Users ────────────────────────────────────────────────

export interface UserItem {
  _id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
}

export function getUsers(params?: { page?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  return request<PaginatedResponse<UserItem>>(`/users?${qs}`);
}

export function createUser(data: { email: string; password: string; role?: string; name?: string; status?: string }) {
  return request<UserItem>("/users", { method: "POST", body: JSON.stringify(data) });
}

export function updateUser(id: string, data: { name?: string; role?: string; status?: string; password?: string }) {
  return request<UserItem>(`/users/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteUser(id: string) {
  return request<void>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Search ──────────────────────────────────────────────────────

export function globalSearch(q: string, type?: string) {
  const qs = new URLSearchParams({ q });
  if (type) qs.set("type", type);
  return request<{ query: string; results: Record<string, unknown[]>; totalResults: number }>(`/search?${qs}`);
}

// ─── Uploads ─────────────────────────────────────────────────────

export function getPresignedUpload(prefix: string, contentType: string) {
  return request<{ url: string; fileUrl: string; key: string }>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ prefix, contentType }),
  });
}
