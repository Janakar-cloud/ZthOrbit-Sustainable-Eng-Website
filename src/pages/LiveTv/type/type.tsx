import { Video } from "../../HomePage/type/type"

export interface VideoCategory {
  key: string
  label: string
  icon: string
}


export interface VideoCategoryFiltersProps {
  selectedCategory: string
  categories: VideoCategory[]
  onCategoryChange: (category: string) => void
}


export interface VideoGridProps {
  videos: Video[]
  onPlay: (video: Video) => void
  className?: string
  cardClassName?: string
}