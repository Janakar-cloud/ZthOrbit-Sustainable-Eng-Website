import { useState, useEffect, useMemo } from 'react'
import '../../style/Articles.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import CategoryFilter from '../Podcast/components/CategoryFilter'
import PodcastHero from '../Podcast/components/PodcastHero'
import { ArticlesProps, Article } from './type/type'
import { Category } from '../Podcast/type/type'
import ArticlesList from './components/ArticlesList'
import { categories as staticCategories } from './data/data'
import ArticleDetails from './components/ArticleDetails'
import { ArticlesHooks } from '../../hooks/articles'
import { useSharedCategories } from '../../hooks/categories'
import Loader from '../../components/Loader'
import NoData from '../../components/Nodatafound'
import { canonicalizeCategoryNames, normalizeCategoryKey } from '../../utils/category'



export default function Articles({ onNavigate }: ArticlesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const { darkMode, setActivePage } = useAppContext()
  const [articles, setArticles] = useState<Article[]>([])
  const { articlesCast, loading, error, refetch } = ArticlesHooks();
  const { categories: sharedCategories } = useSharedCategories();

  useEffect(() => {
    if (!Array.isArray(articlesCast?.items)) return

    const formatted = articlesCast.items
      .filter((p: any) => typeof p.coverImage === 'string' && p.coverImage.trim().length > 0)
      .map((p: any) => {
      const cats = canonicalizeCategoryNames(
        [
          p.category,
          ...(Array.isArray(p.categories) ? p.categories : []),
          ...(Array.isArray(p.tags)
            ? p.tags
                .filter((t: any) => t?.kind === 'category')
                .map((t: any) => t?.name)
            : []),
        ],
        sharedCategories
      )
      return {
        id: p._id,
        title: p.title,
        subtitle: p.subtitle || '',
        category: cats[0] || 'General',
        readTime: p.readTime || '',
        content: (() => {
          const docUrl = typeof p.bodyMd === 'string' ? (p.bodyMd.match(/https?:\/\/\S+/)?.[0] || '') : ''
          const paragraphs = p.bodyMd ? p.bodyMd.split('\n\n') : []
          return paragraphs.filter((a: any) => !docUrl || !a.includes(docUrl))
        })(),
        featured: p.featured,
        image: p.coverImage || '',
        docUrl: typeof p.bodyMd === 'string' ? (p.bodyMd.match(/https?:\/\/\S+/)?.[0] || undefined) : undefined,
        bodyHtml: p.bodyHtml || undefined,
        date: new Date(p.publishDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
    })
    setArticles(formatted)
  }, [articlesCast, sharedCategories])

  // Build categories dynamically from API data, fall back to static list
  const categories: Category[] = useMemo(() => {
    const iconMap: Record<string, string> = {
      sustainability: 'eco', technology: 'computer', economy: 'trending_up',
      leadership: 'groups', ethics: 'balance', finance: 'account_balance',
      innovation: 'lightbulb', health: 'favorite', education: 'school',
    }
    const dynamic: Category[] = [{ id: 'all', name: 'ALL ARTICLES', icon: 'article' }]
    const sourceNames = canonicalizeCategoryNames(
      sharedCategories.length > 0
        ? sharedCategories.map((category) => category.name)
        : articles.map((article) => article.category),
      sharedCategories
    )

    sourceNames.forEach((name) => {
      const key = normalizeCategoryKey(name)
      if (!key) return
      dynamic.push({ id: key, name, icon: iconMap[key] || 'label' })
    })

    return dynamic.length > 1 ? dynamic : staticCategories
  }, [articles, sharedCategories])

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => normalizeCategoryKey(article.category) === selectedCategory)

  // BLOCK RENDER UNTIL READY
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <Loader />
      </div>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <div className={`articles-page ${darkMode ? 'dark' : ''}`}>
        <Header onNavigate={onNavigate} />
        <PodcastHero
          title="Thought Leadership in Sustainable Development"
          subtitle="Deep insights on global economics, technology, sustainability, and conscious leadership"
          imgStatus={false}
          className='articles-hero'
          buttonStatus={false}
          onHandleNavigate={() => undefined}
        />
        <div className="articles-container">
          <NoData message="No articles found." onRetry={() => { refetch() }} />
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    )
  }

  if (selectedArticle) {
    return (
      <div className={`articles-page ${darkMode ? 'dark' : ''}`}>
        <Header onNavigate={onNavigate} />
        <ArticleDetails
          article={selectedArticle}
          categories={categories}
        />
        <Footer onNavigate={onNavigate} />

      </div>
    )
  }

  return (
    <div className={`articles-page ${darkMode ? 'dark' : ''}`}>
      <Header onNavigate={onNavigate} />

      <PodcastHero
        title="Thought Leadership in Sustainable Development"
        subtitle="Deep insights on global economics, technology, sustainability, and conscious leadership"
        imgStatus={false}
        className='articles-hero'
        buttonStatus={false}
        onHandleNavigate={() => undefined} />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ArticlesList
        loading = {loading}
        error ={error}
        refetch={refetch}
        articles={filteredArticles}
        categories={categories}
        onSelectArticle={setSelectedArticle}
      />

      <PodcastHero
        title="Stay Updated"
        subtitle="Subscribe to receive the latest insights on sustainable development, technology, and conscious leadership"
        imgStatus={false}
        className='articles-cta-section'
        buttonStatus={true}
        onHandleNavigate={(page) => { setActivePage(page); onNavigate(page) }} />

      <Footer onNavigate={onNavigate} />

    </div>
  )
}
