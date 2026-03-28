import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { PodcastEpisode } from "../types/podcast";

export const getPodcasts = async (): Promise<PodcastEpisode[]> => {
  const res = await axiosClient.get<PodcastEpisode[]>(API_ENDPOINTS.PODCAST);
  return res.data;
};

// export const createUser = async (data: Partial<User>): Promise<User> => {
//   const res = await axiosClient.post<User>(API_ENDPOINTS.USERS, data);
//   return res.data;
// };