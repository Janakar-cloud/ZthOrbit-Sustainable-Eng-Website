import { useState, useEffect } from 'react'
import { ArticleDetailsProps } from "../type/type"
import { normalizeCategoryKey } from '../../../utils/category'

export default function ArticleDetails({
  article,
  categories,
}: ArticleDetailsProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null)

  useEffect(() => {
    if (!article.bodyHtml) return
    const isUrl = article.bodyHtml.startsWith('http://') || article.bodyHtml.startsWith('https://')
    if (isUrl) {
      // Hosted in S3 — fetch the file
      setHtmlContent(null)
      fetch(article.bodyHtml)
        .then(r => r.text())
        .then(setHtmlContent)
        .catch(() => setHtmlContent(null))
    } else {
      // Raw HTML from the dashboard editor — render directly
      setHtmlContent(article.bodyHtml)
    }
  }, [article.bodyHtml])

  const category = categories.find(c => c.id === normalizeCategoryKey(article.category))
  const docEmbed = !article.bodyHtml && article.docUrl && article.docUrl.endsWith('.docx')
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(article.docUrl)}`
    : null

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
          {htmlContent ? (
            <div
              className="article-html-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : docEmbed ? (
            <div className="article-doc-embed">
              <iframe
                title="article-document"
                src={docEmbed}
                width="100%"
                height="800"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            article.content.map((paragraph, index) => (
              <p
                key={index}
                className="article-paragraph"
              >
                {paragraph}
              </p>
            ))
          )}
        </div>

        {/* Footer */}
        {/* <div className="article-footer-section">
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
        </div> */}

      </div>
    </article>
  )
}
