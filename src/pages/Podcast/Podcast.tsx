import { useState, useEffect } from 'react'
import '../../style/Podcast.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import { PodcastProps, PodcastEpisode, Comment } from './type/type'
import { PODCASTS_DATA, categories } from './data/data'
import PodcastHero from './components/PodcastHero'
import CategoryFilter from './components/CategoryFilter'
import EpisodeCard from './components/EpisodeCard'
import PodcastComments from './components/PodcastComments/PodcastComments'
import { getPodcasts } from '../../utils/api'

export default function Podcast({ onNavigate }: PodcastProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastEpisode | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const { darkMode, isAdmin } = useAppContext()
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>(PODCASTS_DATA)

  useEffect(() => {
    getPodcasts()
      .then((res) => {
        if (res.items.length) {
          const mapped: PodcastEpisode[] = res.items.map((p, i) => ({
            id: i + 1,
            title: p.title,
            description: p.description,
            audioFile: p.audioUrl,
            image: p.imageUrl || '',
            duration: p.duration || '',
            category: (p.tags?.[0] || 'general').toLowerCase(),
            publishDate: p.publishDate || '',
            commentsEnabled: true,
            comments: [],
          }))
          setPodcasts(mapped)
        }
      })
      .catch(() => { /* fallback to local data */ })
  }, [])


  const filteredPodcasts = selectedCategory === 'all'
    ? podcasts
    : podcasts.filter(podcast => podcast.category === selectedCategory)

  const handlePlayPodcast = (podcast: PodcastEpisode) => {
    setSelectedPodcast(podcast)
    setCurrentlyPlaying(podcast.id)
  }

  const handleToggleComments = (podcastId: number) => {
    if (!isAdmin) return
    setPodcasts(podcasts.map(p =>
      p.id === podcastId ? { ...p, commentsEnabled: !p.commentsEnabled } : p
    ))
  }

  const handleAddComment = () => {
    if (!selectedPodcast || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now(),
      author: 'Guest User',
      content: newComment,
      timestamp: new Date().toLocaleString(),
      avatar: 'account_circle'
    }

    setPodcasts(podcasts.map(p =>
      p.id === selectedPodcast.id
        ? { ...p, comments: [...p.comments, comment] }
        : p
    ))

    setNewComment('')
    setSelectedPodcast({ ...selectedPodcast, comments: [...selectedPodcast.comments, comment] })
  }

  return (
    <div className={`podcast-page ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      <PodcastHero
        title="Green Generation Podcast"
        subtitle="Conversations that inspire sustainable action and conscious leadership"
        imgStatus={true}  
        className='podcast-hero'
        buttonStatus={false}
        onHandleNavigate={() => undefined}/>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <section className="podcast-episodes-section">
        <div className="podcast-container">
          <div className="episodes-grid">
            {filteredPodcasts.map((podcastData) => (
              <EpisodeCard
                key={podcastData.id}
                podcast={podcastData}
                isPlaying={currentlyPlaying === podcastData.id}
                isAdmin={isAdmin}
                onPlay={(podcast) => handlePlayPodcast(podcast)}
                onToggleComments={(id) => handleToggleComments(id)}
              />
            ))}
          </div>
        </div>
      </section>
    
      {selectedPodcast && (
        <div className="podcast-modal-overlay" onClick={() =>{ setSelectedPodcast(null); setCurrentlyPlaying(null)}}>
          <div className="podcast-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() =>{ setSelectedPodcast(null); setCurrentlyPlaying(null)}}>
              <span className="material-icons">close</span>
            </button>
            <PodcastComments
              podcast={selectedPodcast}
              isAdmin={isAdmin}
              newComment={newComment}
              onChangeComment={setNewComment}
              onAddComment={handleAddComment}
              onToggleComments={handleToggleComments}
            />
          </div>
        </div>
      )}
      <Footer onNavigate={onNavigate} />

    </div>
  )
}
