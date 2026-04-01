import { useEffect, useState } from "react";
import { getVideo } from "../services/videolive";
import { VideoLiveResponse } from "../types/videolive";

function dedupeByTitle<T extends { title: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.title.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const LiveVideo = () => {
  const [videocast, setVideocast] = useState<VideoLiveResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const data: VideoLiveResponse = await getVideo();
      if (data?.items) data.items = dedupeByTitle(data.items);
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