import { useState, useEffect } from 'react'
import '../../style/Articles.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import CategoryFilter from '../Podcast/components/CategoryFilter'
import PodcastHero from '../Podcast/components/PodcastHero'
import { ArticlesProps, Article } from './type/type'
import ArticlesList from './components/ArticlesList'
import {categories } from './data/data'
import ArticleDetails from './components/ArticleDetails'
import { ArticlesHooks } from '../../hooks/articles'
import Loader from '../../components/Loader'



export default function Articles({ onNavigate }: ArticlesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const { darkMode, setActivePage } = useAppContext()
  const [articles, setArticles] = useState<Article[]>([])
  const { articlesCast, loading, error, refetch } = ArticlesHooks();

  useEffect(() => {
    if (!Array.isArray(articlesCast?.items)) return

    const formatted = articlesCast.items.map((p: any) => ({
      id: p._id,
      title: p.title,
      subtitle: p.subtitle || '',
      category: (p.tags?.[0] || 'general').toLowerCase(),
      readTime: p.readTime || '',
      content: (() => {
        const docUrl = typeof p.bodyMd === 'string' ? (p.bodyMd.match(/https?:\/\/\S+/)?.[0] || '') : ''
        const paragraphs = p.bodyMd ? p.bodyMd.split('\n\n') : []
        // Drop the raw URL paragraph if present; will show embed instead.
        return paragraphs.filter((a: any) => !docUrl || !a.includes(docUrl))
      })(),
      featured: p.featured,
      image: p.coverImage || '',
      docUrl: typeof p.bodyMd === 'string' ? (p.bodyMd.match(/https?:\/\/\S+/)?.[0] || undefined) : undefined,
      date: new Date(p.publishDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }))
    setArticles(formatted)
  }, [articlesCast])

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory)

  // BLOCK RENDER UNTIL READY
  if (articles.length === 0) {
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
