import { useEffect, useState, useMemo } from 'react'
import '../../style/Podcast.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import { PodcastProps, PodcastEpisode, Comment, Category } from './type/type'
import { categories as staticCategories } from './data/data'
import PodcastHero from './components/PodcastHero'
import CategoryFilter from './components/CategoryFilter'
import EpisodeCard from './components/EpisodeCard'
import PodcastComments from './components/PodcastComments/PodcastComments'
import { podcastEpisode } from '../../hooks/podcast'
import { useSharedCategories } from '../../hooks/categories'
import Loader from '../../components/Loader'
import ErrorMessage from '../../components/ErroMessage'
import NoData from '../../components/Nodatafound'
import { canonicalizeCategoryNames, normalizeCategoryKey } from '../../utils/category'
import { getPodcastComments, addPodcastComment, togglePodcastComments } from '../../utils/api'

export default function Podcast({ onNavigate }: PodcastProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastEpisode | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const { darkMode, isAdmin } = useAppContext()

  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([])

  const { podcast: podcastList, loading, error, refetch } = podcastEpisode()
  const { categories: sharedCategories } = useSharedCategories()

  // Sync API data safely
  useEffect(() => {
    if (!Array.isArray(podcastList?.items)) return
    const formatted = podcastList.items
      .filter((p: any) => typeof p.imageUrl === 'string' && p.imageUrl.trim().length > 0)
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
        audioFile: p.audioUrl,
        image: p.imageUrl,
        category: cats[0] || 'General',
        categories: cats,
        comments: p.comments || [],
        commentsEnabled: p.commentsEnabled ?? true,
        description: p.description,
        publishDate: new Date(p.publishDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        duration: p.duration,
      }
    })
    setPodcasts(formatted)
  }, [podcastList, sharedCategories])

  // Build categories dynamically from API data, fall back to static list
  const categories: Category[] = useMemo(() => {
    const iconMap: Record<string, string> = {
      sustainability: 'eco', technology: 'computer', economy: 'trending_up',
      leadership: 'groups', ethics: 'balance', finance: 'account_balance',
      innovation: 'lightbulb', health: 'favorite', education: 'school',
    }
    const dynamic: Category[] = [{ id: 'all', name: 'ALL EPISODES', icon: 'podcasts' }]
    const sourceNames = canonicalizeCategoryNames(
      sharedCategories.length > 0
        ? sharedCategories.map((category) => category.name)
        : podcasts.flatMap((podcast) => podcast.categories),
      sharedCategories
    )

    sourceNames.forEach((name) => {
      const key = normalizeCategoryKey(name)
      if (!key) return
      dynamic.push({ id: key, name, icon: iconMap[key] || 'label' })
    })

    return dynamic.length > 1 ? dynamic : staticCategories
  }, [podcasts, sharedCategories])

  // Filter
  const filteredPodcasts =
    selectedCategory === 'all'
      ? podcasts
      : podcasts.filter((p) => p.categories.some((category) => normalizeCategoryKey(category) === selectedCategory))

  //Play — load real comments from DB when modal opens
  const handlePlayPodcast = async (podcast: PodcastEpisode) => {
    setSelectedPodcast(podcast)
    setCurrentlyPlaying(podcast.id)
    try {
      const res = await getPodcastComments(String(podcast.id))
      const mapped: Comment[] = res.comments.map((c) => ({
        id: c._id,
        author: c.author,
        content: c.message,
        timestamp: new Date(c.createdAt).toLocaleString(),
        avatar: 'account_circle',
      }))
      const enabled = res.commentsEnabled ?? true
      setSelectedPodcast((prev) => prev ? { ...prev, comments: mapped, commentsEnabled: enabled } : prev)
      setPodcasts((prev) => prev.map((p) => p.id === podcast.id ? { ...p, comments: mapped, commentsEnabled: enabled } : p))
    } catch {
      // non-critical — show modal without comments
    }
  }

  // Toggle comments — persists to DB
  const handleToggleComments = async (podcastId: string) => {
    if (!isAdmin) return
    const podcast = podcasts.find((p) => p.id === podcastId)
    if (!podcast) return
    const nextEnabled = !podcast.commentsEnabled
    // Optimistic update
    setPodcasts((prev) => prev.map((p) => p.id === podcastId ? { ...p, commentsEnabled: nextEnabled } : p))
    setSelectedPodcast((prev) => prev && prev.id === podcastId ? { ...prev, commentsEnabled: nextEnabled } : prev)
    try {
      await togglePodcastComments(String(podcastId), nextEnabled)
    } catch {
      // Revert on failure
      setPodcasts((prev) => prev.map((p) => p.id === podcastId ? { ...p, commentsEnabled: !nextEnabled } : p))
      setSelectedPodcast((prev) => prev && prev.id === podcastId ? { ...prev, commentsEnabled: !nextEnabled } : prev)
    }
  }

  // Add comment — saves to DB
  const handleAddComment = async () => {
    if (!selectedPodcast || !newComment.trim()) return

    const optimistic: Comment = {
      id: Date.now(),
      author: 'Guest User',
      content: newComment,
      timestamp: new Date().toLocaleString(),
      avatar: 'account_circle',
    }

    // Optimistic update
    setSelectedPodcast((prev) => prev ? { ...prev, comments: [...prev.comments, optimistic] } : prev)
    setPodcasts((prev) => prev.map((p) => p.id === selectedPodcast.id ? { ...p, comments: [...p.comments, optimistic] } : p))
    setNewComment('')

    try {
      const saved = await addPodcastComment(String(selectedPodcast.id), {
        author: 'Guest User',
        message: newComment.trim(),
      })
      const real: Comment = {
        id: saved._id,
        author: saved.author,
        content: saved.message,
        timestamp: new Date(saved.createdAt).toLocaleString(),
        avatar: 'account_circle',
      }
      // Replace optimistic with real saved comment
      setSelectedPodcast((prev) =>
        prev ? { ...prev, comments: prev.comments.map((c) => c.id === optimistic.id ? real : c) } : prev
      )
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === selectedPodcast.id
            ? { ...p, comments: p.comments.map((c) => c.id === optimistic.id ? real : c) }
            : p
        )
      )
    } catch {
      // Revert optimistic comment on failure
      setSelectedPodcast((prev) =>
        prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== optimistic.id) } : prev
      )
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === selectedPodcast.id
            ? { ...p, comments: p.comments.filter((c) => c.id !== optimistic.id) }
            : p
        )
      )
    }
  }

  //  Close modal
  const closeModal = () => {
    setSelectedPodcast(null)
    setCurrentlyPlaying(null)
  }


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

    if (!loading && podcasts.length === 0) {
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
          <div className="podcast-episodes-section">
            <div className="podcast-container">
              <NoData message="No podcasts found." onRetry={() => { refetch() }} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </div>
      )
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