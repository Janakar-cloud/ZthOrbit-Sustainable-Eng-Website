import { useEffect, useState } from "react";
import { getVideo } from "../services/videolive";
import { VideoLiveResponse } from "../types/videolive";

export const LiveVideo = () => {
  const [videocast, setVideocast] = useState<VideoLiveResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const data: VideoLiveResponse = await getVideo();
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