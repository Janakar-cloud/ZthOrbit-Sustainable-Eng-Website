import { useState, useEffect } from 'react'
import '../../style/Articles.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import CategoryFilter from '../Podcast/components/CategoryFilter'
import PodcastHero from '../Podcast/components/PodcastHero'
import { ArticlesProps, Article } from './type/type'
import ArticlesList from './components/ArticlesList'
import { articles as localArticles, categories } from './data/data'
import ArticleDetails from './components/ArticleDetails'
import { getArticles } from '../../utils/api'


export default function Articles({ onNavigate }: ArticlesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const { darkMode, setActivePage } = useAppContext()
  const [articles, setArticles] = useState<Article[]>(localArticles)

  useEffect(() => {
    getArticles()
      .then((res) => {
        if (res.items.length) {
          const mapped: Article[] = res.items.map((a, i) => ({
            id: i + 1,
            title: a.title,
            subtitle: a.subtitle || '',
            category: (a.tags?.[0] || 'general').toLowerCase(),
            readTime: a.readTime || '',
            date: a.publishDate || '',
            content: a.bodyMd ? a.bodyMd.split('\n\n') : [],
            featured: a.featured,
            image: a.coverImage || '',
          }))
          setArticles(mapped)
        }
      })
      .catch(() => { /* fallback to local data */ })
  }, [])

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory)

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
