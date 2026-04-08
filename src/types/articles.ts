export type Status = "published" | "draft" | "archived";

export interface Tag {
  _id: string;
  name: string;
  kind: "category" | "tag";
}

export interface Article {
  _id: string;
  title: string;
  subtitle: string;
  bodyMd: string;
  bodyHtml?: string;
  coverImage: string;
  publishDate: string; // ISO date string
  status: 'draft' | 'published' | 'archived'; // you can extend if needed
  featured: boolean;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface ArticleResponse {
  items: Article[]
  total: number
  page: number
  pageSize: number
}