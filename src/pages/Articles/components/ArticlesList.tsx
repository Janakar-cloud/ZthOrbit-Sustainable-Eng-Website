import ArticleCard from "./ArticleCard"
import { ArticlesListProps } from "../type/type"

export default function ArticlesList({
  articles,
  categories,
  onSelectArticle,
}: ArticlesListProps) {
  return (
    <section className="articles-list-section">
      <div className="articles-container">
        <div className="articles-grid">
          {articles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              categories={categories}
              onSelect={onSelectArticle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
