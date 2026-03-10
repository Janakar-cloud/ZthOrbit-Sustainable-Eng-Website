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

/** A single item in the 24/7 live playlist */
export interface PlaylistItem {
  id: number;
  title: string;
  description?: string;
  /** Public URL of the video (e.g. AWS S3 object URL) */
  videoUrl: string;
  /** Thumbnail image URL (optional) */
  thumbnailUrl?: string;
  /** Duration string, e.g. "45:00" */
  duration?: string;
  /** Zero-based order index used to determine playback sequence */
  order: number;
  addedAt: string; // ISO string
}
