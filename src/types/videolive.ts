export type Status = "published" | "draft" | "archived";

export interface Tag {
  _id: string;
  name: string;
  kind: "category" | "tag";
}

export interface VideoLive {
  _id: string;
  title: string;
  description: string;
  streamUrl: string;
  thumbnailUrl: string;
  publishDate: string;
  status: Status;
  isLive: boolean;
  tags: Tag[];
  category?: string;
  categories?: string[];
  __v: number;
  createdAt: string;
  updatedAt: string;
}


export interface VideoLiveResponse {
  items: VideoLive[]
  total: number
  page: number
  pageSize: number
}