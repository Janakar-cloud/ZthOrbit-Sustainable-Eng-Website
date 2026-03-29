import { useState, useEffect, useRef } from 'react'
import '../../style/LiveTV.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import VideoModal from '../../components/VideoModal'
import { Video } from '../HomePage/type/type'
import VideoCategoryFilters from './components/renderFilterButtons'
import VideoGrid from './components/VideoGrid'
import { getVideos } from '../../utils/api'
import { VideoCategory } from './type/type'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0)
  const { darkMode } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [videos, setVideos] = useState<Video[]>([])
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([{
    key: 'all',
    label: 'All Videos',
    icon: 'apps'
  }])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Pull videos from backend (S3-backed) only
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const res = await getVideos()
        const items = (res as any)?.items ?? (res as any)?.data ?? []
        const mapped: Video[] = items.map((item: any, idx: number) => ({
          id: idx + 1,
          title: item.title,
          description: item.description || '',
          videoId: item.videoId,
          streamUrl: item.streamUrl || item.hlsUrl || item.url,
          category: (item.tags?.[0] || 'general') as string,
          publishDate: item.publishDate || '',
          thumbnail: item.thumbnailUrl || '/assets/livetv/placeholder.jpg',
        }))
        setVideos(mapped)

        const derivedCategories: VideoCategory[] = Array.from(
          new Set(mapped.map((v) => v.category))
        ).map((cat) => ({ key: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1), icon: 'label' }))

        setVideoCategories([
          { key: 'all', label: 'All Videos', icon: 'apps' },
          ...derivedCategories,
        ])
      } catch (err: any) {
        setError(err?.message || 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  //  Load saved session (index + time)
  useEffect(() => {
    const savedIndex = localStorage.getItem("currentVideoIndex")
    const savedTime = localStorage.getItem("videoTime")

    if (savedIndex !== null) {
      setCurrentHeroVideoIndex(Number(savedIndex))
    }

    // restore time after video loads
    setTimeout(() => {
      if (savedTime && videoRef.current) {
        videoRef.current.currentTime = Number(savedTime)
      }
    }, 500)

    // Clock
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockTimer)
  }, [])

  // Reset hero index if videos change
  useEffect(() => {
    if (videos.length > 0) {
      setCurrentHeroVideoIndex(0)
    }
  }, [videos])

  // Save playback time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      localStorage.setItem(
        "videoTime",
        videoRef.current.currentTime.toString()
      )
    }
  }

  // Auto next video + save index
  const handleVideoEnd = () => {
    setCurrentHeroVideoIndex((prev) => {
      const nextIndex = videos.length ? (prev + 1) % videos.length : 0
      localStorage.setItem("currentVideoIndex", nextIndex.toString())
      localStorage.setItem("videoTime", "0")
      return nextIndex
    })
  }

  

  // select popvideo make live video pause
  useEffect(() => {
    if (videoRef.current) {
      if (selectedVideo) {
        videoRef.current.muted = true;   // mute when modal opens
      } else {
        videoRef.current.muted = false;  // unmute when modal closes
      }
    }
  }, [selectedVideo]);

  // Filter videos (grid section)
  const filteredVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((video) => video.category === selectedCategory)

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!videos.length) return <div>No videos available.</div>

  return (
    <div className={`livetv ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      <section className="livetv-hero">
        <div className="hero-video-carousel">

          {/*VIDEO PLAYER */}
          <video
            ref={videoRef}
            key={currentHeroVideoIndex}
            className="hero-video-player"
            controls
            autoPlay
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onTimeUpdate={handleTimeUpdate}
          >
            <source
              src={videos[currentHeroVideoIndex]?.streamUrl || ''}
              type="video/mp4"
            />
          </video>

          {/*  LIVE TAG */}
          <div className="live-container">
            <div className="live-tag">LIVE</div>
            <div className="live-time">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>

          {/* OVERLAY */}
          <div className="hero-video-overlay">
            <div className="hero-video-info">
              <span className="hero-video-category">
                {videos[currentHeroVideoIndex].category}
              </span>
              <h2 className="hero-video-title">
                {videos[currentHeroVideoIndex].title}
              </h2>
              <p className="hero-video-description">
                {videos[currentHeroVideoIndex].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO GRID */}
      <div className="livetv-container">

        <VideoCategoryFilters
          selectedCategory={selectedCategory}
          categories={videoCategories}
          onCategoryChange={setSelectedCategory}
        />

        <VideoGrid
          videos={filteredVideos}
          onPlay={handlePlayVideo}
          className="livetv-grid"
          cardClassName="livetv-card"
        />

      </div>

      {/* MODAL */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  )
}