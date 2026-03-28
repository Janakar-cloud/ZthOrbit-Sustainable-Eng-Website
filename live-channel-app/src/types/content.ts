export interface LiveConfig {
  streamUrl: string;
  title: string;
  description: string;
}

export interface PodcastEpisode {
  _id?: string; // from MongoDB
  id?: number; // legacy local data
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  publishedAt?: string; // ISO string
  duration?: string; // e.g. "12:34"
}
