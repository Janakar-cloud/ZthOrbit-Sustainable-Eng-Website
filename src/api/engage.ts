import axiosClient from "./axiosClient";

export type ContentType = "video" | "podcast" | "article";

export interface EngageStats {
  views: number;
  likes: number;
  commentsCount: number;
}

export interface TrendingItem {
  _id: string;
  title: string;
  views: number;
  likes: number;
  commentsCount: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  coverImage?: string;
  publishDate?: string;
  createdAt?: string;
  _type: ContentType;
}

/** Record a single view — call when media starts playing */
export async function recordView(type: ContentType, id: string): Promise<void> {
  try {
    await axiosClient.post(`/engage/${type}/${id}/view`);
  } catch {
    // Non-critical — silently ignore failures
  }
}

/** Toggle like/unlike */
export async function recordLike(
  type: ContentType,
  id: string,
  action: "like" | "unlike" = "like"
): Promise<number> {
  const { data } = await axiosClient.post(`/engage/${type}/${id}/like`, { action });
  return data.likes as number;
}

/** Get views, likes, commentsCount for one item */
export async function getEngageStats(type: ContentType, id: string): Promise<EngageStats> {
  const { data } = await axiosClient.get(`/engage/stats/${type}/${id}`);
  return data as EngageStats;
}

/** Trending content sorted by views */
export async function getTrending(opts: {
  type?: "video" | "podcast" | "article" | "all";
  limit?: number;
  days?: number;
} = {}): Promise<TrendingItem[]> {
  const params = new URLSearchParams();
  if (opts.type) params.set("type", opts.type);
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.days) params.set("days", String(opts.days));
  const { data } = await axiosClient.get(`/engage/trending?${params.toString()}`);
  return data.items as TrendingItem[];
}

/** Latest published content sorted by date */
export async function getLatest(opts: {
  type?: "video" | "podcast" | "article" | "all";
  limit?: number;
} = {}): Promise<TrendingItem[]> {
  const params = new URLSearchParams();
  if (opts.type) params.set("type", opts.type);
  if (opts.limit) params.set("limit", String(opts.limit));
  const { data } = await axiosClient.get(`/engage/latest?${params.toString()}`);
  return data.items as TrendingItem[];
}
