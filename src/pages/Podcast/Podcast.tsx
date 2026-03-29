import { useEffect, useState } from 'react'
import '../../style/Podcast.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import { PodcastProps, PodcastEpisode, Comment } from './type/type'
import { categories } from './data/data'
import PodcastHero from './components/PodcastHero'
import CategoryFilter from './components/CategoryFilter'
import EpisodeCard from './components/EpisodeCard'
import PodcastComments from './components/PodcastComments/PodcastComments'
import { podcastEpisode } from '../../hooks/podcast'
import Loader from '../../components/Loader'
import ErrorMessage from '../../components/ErroMessage'
import NoData from '../../components/Nodatafound'

export default function Podcast({ onNavigate }: PodcastProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastEpisode | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const { darkMode, isAdmin } = useAppContext()

  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([])

  const { podcast: podcastList, loading, error, refetch } = podcastEpisode()

  // Sync API data safely
  useEffect(() => {
    if (!Array.isArray(podcastList?.items)) return
    const formatted = podcastList.items.map((p: any) => ({
      id: p._id,
      title: p.title,
      audioFile: p.audioUrl,
      image: p.imageUrl,
      category: p.category,
      comments: p.comments || [],
      commentsEnabled: p.commentsEnabled ?? true,
      description: p.description,
      publishDate: new Date(p.publishDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      duration: p.duration,
    }))

    setPodcasts(formatted)
  }, [podcastList])

  // Filter
  const filteredPodcasts =
    selectedCategory === 'all'
      ? podcasts
      : podcasts.filter((p) => p.category === selectedCategory)

  //Play
  const handlePlayPodcast = (podcast: PodcastEpisode) => {
    setSelectedPodcast(podcast)
    setCurrentlyPlaying(podcast.id)
  }

  // Toggle comments
  const handleToggleComments = (podcastId: number) => {
    if (!isAdmin) return

    setPodcasts((prev) =>
      prev.map((p) =>
        p.id === podcastId
          ? { ...p, commentsEnabled: !p.commentsEnabled }
          : p
      )
    )
  }

  // Add comment
  const handleAddComment = () => {
    if (!selectedPodcast || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now(),
      author: 'Guest User',
      content: newComment,
      timestamp: new Date().toLocaleString(),
      avatar: 'account_circle',
    }

    setPodcasts((prev) =>
      prev.map((p) =>
        p.id === selectedPodcast.id
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    )

    setSelectedPodcast((prev) =>
      prev
        ? { ...prev, comments: [...prev.comments, comment] }
        : prev
    )

    setNewComment('')
  }

  //  Close modal
  const closeModal = () => {
    setSelectedPodcast(null)
    setCurrentlyPlaying(null)
  }

  return (
    <div className={`podcast-page ${darkMode ? 'dark' : ''}`}>
      <Header onNavigate={onNavigate} />

      <PodcastHero
        title="Green Generation Podcast"
        subtitle="Conversations that inspire sustainable action and conscious leadership"
        imgStatus={true}
        className="podcast-hero"
        buttonStatus={false}
        onHandleNavigate={() => undefined}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Episodes Section */}
      <section className="podcast-episodes-section">
        <div className="podcast-container">

          {/* Loading */}
          {loading && (
            <Loader />
          )}

          {/* Error */}
          {error && (
            <ErrorMessage message={error} onRetry={() => { refetch() }}/>
          )}

          {/* Data */}
          {!loading && !error && (
            <>
              {filteredPodcasts.length > 0 ? (
                <div className="episodes-grid">
                  {filteredPodcasts.map((podcastData) => (
                    <EpisodeCard
                      key={podcastData.id}
                      podcast={podcastData}
                      isPlaying={currentlyPlaying === podcastData.id}
                      isAdmin={isAdmin}
                      onPlay={handlePlayPodcast}
                      onToggleComments={handleToggleComments}
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

      {/* Modal */}
      {selectedPodcast && (
        <div className="podcast-modal-overlay" onClick={closeModal}>
          <div
            className="podcast-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
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