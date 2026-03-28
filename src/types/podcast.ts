export interface PodcastEpisode {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  duration: string; // format "mm:ss" or "hh:mm:ss"
  publishDate: string; // ISO date string
  status: "draft" | "published" | "archived"; // extend if needed
  tags: string[];
  __v: number;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}