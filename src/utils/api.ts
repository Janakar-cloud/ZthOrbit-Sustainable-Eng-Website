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

export interface S3Video {
  key: string;
  url: string;
  fileName: string;
  size: number;
  lastModified: string;
}

export type LiveAccess = 
  | { 
      streamUrl: string; 
      title: string; 
      description: string; 
      expiresIn: number; 
      accessMode: "direct" | "cloudfront";
    }
  | {
      playlist: S3Video[];
      title: string;
      description: string;
      expiresIn: number;
      accessMode: "s3_playlist";
    };

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

export function createArticle(data: Partial<ArticleItem>) {
  return request<ArticleItem>("/articles", { method: "POST", body: JSON.stringify(data) });
}

export function updateArticle(id: string, data: Partial<ArticleItem>) {
  return request<ArticleItem>(`/articles/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function patchArticleStatus(id: string, status: "published" | "draft") {
  return request<ArticleItem>(`/articles/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function deleteArticle(id: string) {
  return request<void>(`/articles/${encodeURIComponent(id)}`, { method: "DELETE" });
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

// Case stories
export interface CaseStoryItem {
  _id: string;
  title: string;
  impact: string;
  duration?: string;
  heroImage?: string;
  metrics?: { label: string; value: string }[];
  bodyMd?: string;
  tags?: string[];
}

export function getCaseStories(params?: { tag?: string; page?: number; pageSize?: number; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params?.search) qs.set("search", params.search);
  return request<PaginatedResponse<CaseStoryItem>>(`/case-stories?${qs}`);
}

export function getCaseStory(id: string) {
  return request<CaseStoryItem>(`/case-stories/${encodeURIComponent(id)}`);
}

export function createCaseStory(data: Partial<CaseStoryItem>) {
  return request<CaseStoryItem>("/case-stories", { method: "POST", body: JSON.stringify(data) });
}

export function updateCaseStory(id: string, data: Partial<CaseStoryItem>) {
  return request<CaseStoryItem>(`/case-stories/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCaseStory(id: string) {
  return request<void>(`/case-stories/${encodeURIComponent(id)}`, { method: "DELETE" });
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
  seriesId?: string;
  partNumber?: number;
  partTitle?: string;
}

export interface PodcastComment {
  _id: string
  podcastId: string
  author: string
  message: string
  status: "visible" | "hidden"
  parentCommentId?: string
  createdAt: string
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

// Podcast comments
export function getPodcastComments(podcastId: string) {
  return request<PodcastComment[]>(`/podcasts/${encodeURIComponent(podcastId)}/comments`);
}

export function addPodcastComment(podcastId: string, data: { author: string; message: string; parentCommentId?: string }) {
  return request<PodcastComment>(`/podcasts/${encodeURIComponent(podcastId)}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePodcastCommentStatus(podcastId: string, commentId: string, status: "visible" | "hidden") {
  return request<PodcastComment>(`/podcasts/${encodeURIComponent(podcastId)}/comments/${encodeURIComponent(commentId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deletePodcastComment(podcastId: string, commentId: string) {
  return request<void>(`/podcasts/${encodeURIComponent(podcastId)}/comments/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
  });
}

// About blocks
export interface AboutBlockItem {
  _id: string;
  kind: "theme" | "timeline" | "gallery" | "cta";
  title?: string;
  body?: string;
  mediaUrl?: string;
  order?: number;
}

export function getAboutBlocks(params?: { search?: string }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  return request<AboutBlockItem[]>(`/about?${qs}`);
}

export function createAboutBlock(data: Partial<AboutBlockItem>) {
  return request<AboutBlockItem>("/about", { method: "POST", body: JSON.stringify(data) });
}

export function updateAboutBlock(id: string, data: Partial<AboutBlockItem>) {
  return request<AboutBlockItem>(`/about/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteAboutBlock(id: string) {
  return request<void>(`/about/${encodeURIComponent(id)}`, { method: "DELETE" });
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

// (moved below with query params support)

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

// ─── Media (unified) ───────────────────────────────────────────

export interface MediaItem {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  mediaType: "video" | "audio";
  menu: "LiveTv" | "Podcast";
  category?: string;
  tags?: string[];
  duration?: number | string;
  fileUrl?: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  status?: string;
  seriesId?: string;
  partNumber?: number;
  partTitle?: string;
  publishDate?: string;
}

export function getMedia(params?: { menu?: string; mediaType?: string; category?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.menu) qs.set("menu", params.menu);
  if (params?.mediaType) qs.set("mediaType", params.mediaType);
  if (params?.category) qs.set("category", params.category);
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<{ data: MediaItem[]; meta?: { page: number; limit: number; total: number } }>(`/media?${qs}`);
}

export function getMediaById(id: string) {
  return request<MediaItem>(`/media/${encodeURIComponent(id)}`);
}

export function createMedia(data: Partial<MediaItem>) {
  return request<MediaItem>("/media", { method: "POST", body: JSON.stringify(data) });
}

export function updateMedia(id: string, data: Partial<MediaItem>) {
  return request<MediaItem>(`/media/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteMedia(id: string) {
  return request<void>(`/media/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function patchMediaStatus(id: string, data: { status: string; fileUrl?: string; thumbnailUrl?: string; duration?: number }) {
  return request<MediaItem>(`/media/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify(data) });
}

// ─── Posts ─────────────────────────────────────────────────────

export interface PostItem {
  _id: string;
  title: string;
  description: string;
  coverUrl?: string;
  totalViews?: number;
  totalComments?: number;
  totalShares?: number;
  totalFavorites?: number;
  postedAt?: string;
  author?: { name?: string; avatarUrl?: string };
}

export function getPosts(params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.category) qs.set("category", params.category);
  if (params?.sort) qs.set("sort", params.sort);
  return request<{ data: PostItem[]; meta: { page: number; limit: number; total: number } }>(`/posts?${qs}`);
}

export function getPost(id: string) {
  return request<PostItem>(`/posts/${encodeURIComponent(id)}`);
}

export function createPost(data: Partial<PostItem>) {
  return request<PostItem>("/posts", { method: "POST", body: JSON.stringify(data) });
}

export function updatePost(id: string, data: Partial<PostItem>) {
  return request<PostItem>(`/posts/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deletePost(id: string) {
  return request<void>(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Notifications ─────────────────────────────────────────────

export interface NotificationItem {
  _id: string;
  title: string;
  description?: string;
  avatarUrl?: string;
  type?: string;
  postedAt?: string;
  isUnread?: boolean;
}

export function getNotifications(params?: { page?: number; limit?: number; isUnread?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.isUnread !== undefined) qs.set("isUnread", String(params.isUnread));
  return request<{ data: NotificationItem[]; meta: { page: number; limit: number; total: number } }>(`/notifications?${qs}`);
}

export function patchNotification(id: string, isUnread: boolean) {
  return request<NotificationItem>(`/notifications/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ isUnread }),
  });
}

export function markAllNotificationsRead() {
  return request<void>("/notifications/read-all", { method: "PATCH" });
}

export function deleteNotification(id: string) {
  return request<void>(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function deleteAllNotifications() {
  return request<void>("/notifications", { method: "DELETE" });
}

// ─── Users: status patch ───────────────────────────────────────

export function patchUserStatus(id: string, status: string) {
  return request<UserItem>(`/users/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ─── Admin summary with params ─────────────────────────────────

export function getDashboardSummary(params?: { from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  return request<DashboardSummary>(`/admin/summary${qs.toString() ? `?${qs}` : ""}`);
}
