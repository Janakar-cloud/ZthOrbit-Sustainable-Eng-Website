import axiosClient from "../api/axiosClient";
import { API_ENDPOINTS } from "../api/endpoints";
import { VideoLiveResponse } from "../types/videolive";

export const getVideo = async (): Promise<VideoLiveResponse> => {
  const res = await axiosClient.get<VideoLiveResponse>(API_ENDPOINTS.VIDEO);
  console.log("fgfdsgsdfgsd", res);
  return res.data;
};