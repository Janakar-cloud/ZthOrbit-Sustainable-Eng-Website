export interface LiveConfig {
  streamUrl: string;
  title: string;
  description: string;
}

export interface PodcastEpisode {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  publishedAt: string; // ISO string
  duration: string; // e.g. "12:34"
}
