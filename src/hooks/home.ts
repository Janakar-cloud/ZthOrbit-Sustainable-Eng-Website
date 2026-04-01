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

export const useHomeData = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHomeData()
      .then((d: HomeData) => {
        d.videos   = dedupeByTitle(d.videos);
        d.podcasts = dedupeByTitle(d.podcasts);
        d.articles = dedupeByTitle(d.articles);
        setData(d);
      })
      .catch((err) => setError(err.message || "Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
