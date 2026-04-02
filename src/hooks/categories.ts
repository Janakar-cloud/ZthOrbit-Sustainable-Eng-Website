import { useEffect, useState } from "react";
import { getSharedCategories } from "../services/categories";
import { SharedCategoryApiItem } from "../types/categories";

export const useSharedCategories = () => {
  const [categories, setCategories] = useState<SharedCategoryApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getSharedCategories();
        setCategories(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};