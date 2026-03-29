import { useEffect, useState } from "react";
import { getPodcasts } from "../services/podcast";
import { PodcastApiResponse } from "../types/podcast";

export const podcastEpisode = () => {
  const [podcast, setPodcast] = useState<PodcastApiResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodcast = async () => {
    try {
      setLoading(true);
      const data: PodcastApiResponse = await getPodcasts();
      setPodcast(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcast();
  }, []);

  return { podcast, loading, error, refetch: fetchPodcast };
};