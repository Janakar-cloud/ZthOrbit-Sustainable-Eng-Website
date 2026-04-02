import { useEffect, useState } from "react";
import { getVideo } from "../services/videolive";
import { VideoLiveResponse } from "../types/videolive";

const COPY_SUFFIX_RE = /\s*\(\d+\)\s*$/;

function normalizeTitle(title: string): string {
  return title.replace(COPY_SUFFIX_RE, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function dedupeByTitle<T extends { title: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const rawTitle = item.title?.trim() ?? "";
    if (!rawTitle || COPY_SUFFIX_RE.test(rawTitle)) return false;
    const key = normalizeTitle(rawTitle);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasValue(value?: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export const LiveVideo = () => {
  const [videocast, setVideocast] = useState<VideoLiveResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const data: VideoLiveResponse = await getVideo();
      if (data?.items) data.items = dedupeByTitle(data.items.filter(item => hasValue(item.thumbnailUrl)));
      setVideocast(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  return { videocast, loading, error, refetch: fetchVideo };
};