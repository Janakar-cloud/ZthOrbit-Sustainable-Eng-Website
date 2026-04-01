import ArticleCard from "./ArticleCard"
import { ArticlesListProps } from "../type/type"
import Loader from "../../../components/Loader"
import ErrorMessage from "../../../components/ErroMessage"
import NoData from "../../../components/Nodatafound"

export default function ArticlesList({
  loading,
  error,
  refetch,
  articles,
  categories,
  onSelectArticle,
}: ArticlesListProps) {
  return (
    <section className="articles-list-section">
      <div className="articles-container">
        {/* Loading */}
        {loading && (
          <Loader />
        )}

        {/* Error */}
        {error && (
          <ErrorMessage message={error} onRetry={() => { refetch() }} />
        )}

        {/* Data */}
        {!loading && !error && (
          <>
            {articles.length > 0 ? (
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
            ) : (
              <NoData message="No podcasts found." onRetry={() => { refetch() }} />
            )}
          </>
        )}

      </div>
    </section>
  )
}
