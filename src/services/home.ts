import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { HomeData } from "../types/home";

export const getHomeData = async (): Promise<HomeData> => {
  const res = await axiosClient.get<HomeData>(API_ENDPOINTS.HOME);
  return res.data;
};
