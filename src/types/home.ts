export interface HomeVideo {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  streamUrl: string;
  isLive: boolean;
  publishDate?: string;
}

export interface HomePodcast {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  audioUrl: string;
  duration?: string;
  publishDate?: string;
}

export interface HomeArticle {
  _id: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  readTime?: string;
  publishDate?: string;
}

export interface HomeData {
  videos: HomeVideo[];
  podcasts: HomePodcast[];
  articles: HomeArticle[];
}
