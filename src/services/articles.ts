import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { ArticleResponse } from "../types/articles";

export const getArticles = async (): Promise<ArticleResponse> => {
  const res = await axiosClient.get<ArticleResponse>(API_ENDPOINTS.ARTICLE);
  return res.data;
};