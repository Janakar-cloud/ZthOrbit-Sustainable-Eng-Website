import { useEffect, useState } from "react";
import { getHomeData } from "../services/home";
import { HomeData } from "../types/home";

export const useHomeData = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHomeData()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
