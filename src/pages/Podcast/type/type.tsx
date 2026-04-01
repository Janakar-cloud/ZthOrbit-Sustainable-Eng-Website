
export interface PodcastProps {
  onNavigate: (page: string) => void
}

export interface Comment {
  id: number
  author: string
  content: string
  timestamp: string
  avatar: string
}

export interface PodcastEpisode {
  id: number
  title: string
  description: string
  audioFile: string
  image: string
  duration: string
  category: string
  categories: string[]
  publishDate: string
  commentsEnabled: boolean
  comments: Comment[]
}



export interface PodcastHeroProps {
  imgStatus?: boolean
  title: string
  subtitle: string
  className?: string
  buttonStatus: boolean
  onHandleNavigate: (page: string) => void
}


export interface Category {
  id: string
  name: string
  icon: string
}

export interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onSelect: (categoryId: string) => void
}

export interface EpisodeCardProps {
  podcast: PodcastEpisode
  isPlaying: boolean
  isAdmin: boolean
  onPlay: (podcast: PodcastEpisode) => void
  onToggleComments: (id: number) => void
}


export interface PodcastComment {
  id: string
  author: string
  message: string
  createdAt: string
}

export interface Podcast {
  id: string
  title: string
  description: string
  image: string
  audioFile: string
  category: string
  duration: string
  publishDate: string
  comments: PodcastComment[]
  commentsEnabled: boolean
}


// export interface PodcastCommentsProps {
//   comments: Comment[]
//   isAdmin: boolean
//   commentsEnabled: boolean
//   newComment: string
//   onChangeComment: (value: string) => void
//   onAddComment: () => void
//   onToggleComments: () => void
// }


export interface PodcastCommentsProps {
  podcast: PodcastEpisode
  isAdmin: boolean

  newComment: string
  onChangeComment: (value: string) => void
  onAddComment: () => void

  onToggleComments: (podcastId: number) => void
}