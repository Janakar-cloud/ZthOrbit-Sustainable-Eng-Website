
export interface AboutUsProps {
  onNavigate: (page: string) => void;
}

export interface TimelineItemProps {
  title: string
  text: string
}

export type Theme = {
  icon: string
  title: string
  desc: string
}

export interface CTACardProps {
  title: string
  desc: string
  link: string
  label: string
  external?: boolean
}
