import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { SharedCategoryResponse } from "../types/categories";

export const getSharedCategories = async (): Promise<SharedCategoryResponse> => {
  const res = await axiosClient.get<SharedCategoryResponse>(API_ENDPOINTS.CATEGORIES);
  return res.data;
};