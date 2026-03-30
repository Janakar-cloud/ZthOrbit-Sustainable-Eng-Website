
export interface ArticlesProps {
  onNavigate: (page: string) => void
}

export interface Article {
  id: number
  title: string
  subtitle: string
  category: string
  readTime: string
  date: string
  content: string[]
  featured: boolean
  image: string
  docUrl?: string
}


export interface ArticleCardProps {
  article: Article
  categories: Category[]
  onSelect: (article: Article) => void
}

export interface Category {
  id: string
  name: string
  icon: string
}


export interface ArticlesListProps {
  articles: Article[]
  categories: Category[]
  onSelectArticle: (article: Article) => void
}


export interface ArticleDetailsProps {
  article: Article
  categories: Category[]
}
