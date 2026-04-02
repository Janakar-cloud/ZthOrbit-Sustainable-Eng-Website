import { useEffect, useState } from "react";
import { getArticles } from "../services/articles";
import { Article, ArticleResponse } from "../types/articles";

function dedupeByTitle(items: Article[]): Article[] {
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

export const ArticlesHooks = () => {
  const [articlesCast, setArticlescast] = useState<ArticleResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data: ArticleResponse = await getArticles();
      if (data?.items) data.items = dedupeByTitle(data.items.filter(item => hasValue(item.coverImage)));
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