import { ArticleCardProps } from "../type/type"
import { normalizeCategoryKey } from '../../../utils/category'

export default function ArticleCard({
  article,
  categories,
  onSelect,
}: ArticleCardProps) {
  const category = categories.find(c => c.id === normalizeCategoryKey(article.category))

  return (
    <div
      className="article-card"
      onClick={() => onSelect(article)}
    >
      <div className="article-card-image">
        <img src={article.image} alt={article.title} />

        <div className="article-card-category">
          <span className="material-icons">
            {category?.icon}
          </span>
          <span>{category?.name ?? article.category}</span>
        </div>
      </div>

      <div className="article-card-content">
        <h3 className="article-card-title">
          {article.title}
        </h3>

        <p className="article-card-excerpt">
          {(article.content[0] || "View document").substring(0, 150)}...
        </p>

        <div className="article-card-footer">
          <div className="article-card-meta">
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>

          <button
            className="article-card-btn"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(article)
            }}
          >
            <span>Read</span>
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
