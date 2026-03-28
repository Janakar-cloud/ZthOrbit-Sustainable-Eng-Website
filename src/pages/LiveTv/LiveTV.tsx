import { useState, useEffect, useRef } from 'react'
import '../../style/LiveTV.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import VideoModal from '../../components/VideoModal'
import { Video } from '../HomePage/type/type'
import { videos } from '../LiveTv/data/data'
import VideoCategoryFilters from './components/renderFilterButtons'
import VideoGrid from './components/VideoGrid'
import { requestLiveAccess } from '../../utils/api'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

interface S3Video {
  key: string
  url: string
  fileName: string
  size: number
  lastModified: string
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0)
  const { darkMode } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date())

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Live Videos List
  const liveVideos = [
    {
      title: "Sustainability in sanatana Dharma PART 1",
      category: "Karma",
      description: "Culture GreenEarth",
      videoUrl:
        "https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+DharmaPART+1+(1).mp4",
    },
    {
      title: "Sustainability in sanatana Dharma PART 2",
      category: "Karma",
      description: "Culture GreenEarth",
      videoUrl:
        "https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4",
    },
  ]

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
      const nextIndex = (prev + 1) % liveVideos.length
      localStorage.setItem("currentVideoIndex", nextIndex.toString())
      localStorage.setItem("videoTime", "0")
      return nextIndex
    })
  }

  // Filter videos (grid section)
  const filteredVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((video) => video.category === selectedCategory)

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
  }

  // Prevent crash
  if (!liveVideos.length) return <div>Loading...</div>

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
              src={encodeURI(liveVideos[currentHeroVideoIndex]?.videoUrl)}
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
                {liveVideos[currentHeroVideoIndex].category}
              </span>
              <h2 className="hero-video-title">
                {liveVideos[currentHeroVideoIndex].title}
              </h2>
              <p className="hero-video-description">
                {liveVideos[currentHeroVideoIndex].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO GRID */}
      <div className="livetv-container">

        <VideoCategoryFilters
          selectedCategory={selectedCategory}
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