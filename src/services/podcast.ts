import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { PodcastApiResponse } from "../types/podcast";

type MediaTag = {
  _id?: string;
  name: string;
  kind?: "category" | "tag";
};

type MediaItem = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string;
  status: "processing" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
  duration?: number;
  category?: string;
  categories?: string[];
  tags?: MediaTag[];
};

type MediaListResponse = {
  data: MediaItem[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

function formatDuration(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  return [minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export const getPodcasts = async (): Promise<PodcastApiResponse> => {
  const res = await axiosClient.get<MediaListResponse>(API_ENDPOINTS.PODCAST);
  return {
    items: (res.data.data ?? []).map((item) => ({
      _id: item.id,
      title: item.title,
      description: item.description,
      audioUrl: item.fileUrl,
      imageUrl: item.thumbnailUrl,
      duration: formatDuration(item.duration),
      publishDate: item.createdAt,
      status: item.status === "ready" ? "published" : "draft",
      tags: item.tags ?? [],
      category: item.category,
      categories: item.categories ?? [],
      __v: 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    total: res.data.meta?.total ?? 0,
    page: res.data.meta?.page ?? 1,
    pageSize: res.data.meta?.limit ?? 20,
  };
};

// export const createUser = async (data: Partial<User>): Promise<User> => {
//   const res = await axiosClient.post<User>(API_ENDPOINTS.USERS, data);
//   return res.data;
// };