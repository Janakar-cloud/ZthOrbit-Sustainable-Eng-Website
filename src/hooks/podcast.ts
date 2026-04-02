import { useEffect, useState } from "react";
import { getPodcasts } from "../services/podcast";
import { PodcastApiResponse, PodcastEpisode } from "../types/podcast";

function dedupeByTitle(items: PodcastEpisode[]): PodcastEpisode[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.title.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasValue(value?: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export const podcastEpisode = () => {
  const [podcast, setPodcast] = useState<PodcastApiResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodcast = async () => {
    try {
      setLoading(true);
      const data: PodcastApiResponse = await getPodcasts();
      if (data?.items) data.items = dedupeByTitle(data.items.filter(item => hasValue(item.imageUrl)));
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