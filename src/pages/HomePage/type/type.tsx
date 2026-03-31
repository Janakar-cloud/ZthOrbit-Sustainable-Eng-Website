
export interface HomePageProps {
  onNavigate: (page: string) => void
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoId?: string;
  streamUrl: string;
  category: string;
  isLive: boolean;
  publishDate: string;   // formatted date
  thumbnail: string;
}
export interface Podcast {
  id: number
  title: string
  description: string
  audioFile: string
  image: string
  duration: string
  category: string
  publishDate: string
}


export interface PodcastItem {
  id: number;
  title: string;
  description: string;
  image: string;
}


export interface ArticleItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface LiveTvItem {
  id: number;
  title: string
  description: string
  image: string
}
