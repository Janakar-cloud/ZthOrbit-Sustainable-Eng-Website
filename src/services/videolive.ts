import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { VideoLiveResponse } from "../types/videolive";

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

export const getVideo = async (): Promise<VideoLiveResponse> => {
  const res = await axiosClient.get<MediaListResponse>(API_ENDPOINTS.VIDEO);
  return {
    items: (res.data.data ?? []).map((item) => ({
      _id: item.id,
      title: item.title,
      description: item.description,
      streamUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl,
      publishDate: item.createdAt,
      status: item.status === "ready" ? "published" : "draft",
      isLive: false,
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