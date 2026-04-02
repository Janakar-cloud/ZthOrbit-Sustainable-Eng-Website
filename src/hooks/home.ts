import { useEffect, useState } from "react";
import { getHomeData } from "../services/home";
import { HomeData } from "../types/home";

function dedupeByTitle<T extends { title: string }>(items: T[]): T[] {
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

export const useHomeData = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHomeData()
      .then((d: HomeData) => {
        d.videos = dedupeByTitle(d.videos.filter(item => hasValue(item.thumbnailUrl)));
        d.podcasts = dedupeByTitle(d.podcasts.filter(item => hasValue(item.imageUrl)));
        d.articles = dedupeByTitle(d.articles.filter(item => hasValue(item.coverImage)));
        setData(d);
      })
      .catch((err) => setError(err.message || "Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
