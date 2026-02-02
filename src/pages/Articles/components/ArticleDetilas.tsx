import { ArticleDetailsProps } from "../type/type"

export default function ArticleDetails({
  article,
  categories,
}: ArticleDetailsProps) {
  const category = categories.find(c => c.id === article.category)

  return (
    <article className="article-full">
      <div className="article-container">

        {/* Header */}
        <div className="article-header-section">
          <div className="article-category-badge">
            <span className="material-icons">
              {category?.icon}
            </span>
            <span>{category?.name ?? article.category}</span>
          </div>

          <h1 className="article-full-title">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="article-full-subtitle">
              {article.subtitle}
            </p>
          )}

          <div className="article-meta-info">
            <span className="meta-item">
              <span className="material-icons">calendar_today</span>
              {article.date}
            </span>

            <span className="meta-item">
              <span className="material-icons">schedule</span>
              {article.readTime} read
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="article-featured-image">
          <img src={article.image} alt={article.title} />
        </div>

        {/* Body */}
        <div className="article-body">
          {article.content.map((paragraph, index) => (
            <p
              key={index}
              className="article-paragraph"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="article-footer-section">
          <div className="article-share">
            <h3>Share this article</h3>

            <div className="share-buttons">
              <button className="share-btn">
                <span className="material-icons">link</span>
              </button>
              <button className="share-btn">
                <span className="material-icons">email</span>
              </button>
              <button className="share-btn">
                <span className="material-icons">bookmark</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </article>
  )
}
