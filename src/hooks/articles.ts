import { useEffect, useState } from "react";
import { getArticles } from "../services/articles";
import { ArticleResponse } from "../types/articles";

export const ArticlesHooks = () => {
  const [articlesCast, setArticlescast] = useState<ArticleResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data: ArticleResponse = await getArticles();
      setArticlescast(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return { articlesCast, loading, error, refetch: fetchArticles };
};