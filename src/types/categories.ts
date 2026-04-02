export interface SharedCategoryApiItem {
  id: string;
  name: string;
  kind: "category" | "topic" | "role";
  appliesTo?: string[];
}

export interface SharedCategoryResponse {
  data: SharedCategoryApiItem[];
}