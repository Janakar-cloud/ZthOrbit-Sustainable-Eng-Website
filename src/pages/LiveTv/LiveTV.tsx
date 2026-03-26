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
import { getLiveConfig, type LiveConfig } from '../../utils/api'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const { darkMode } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveConfig, setLiveConfig] = useState<LiveConfig | null>(null)
  const [liveError, setLiveError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);


  // useEffect(() => {
  //   setCurrentHeroVideoIndex(0); // first video
  // }, []);

  // // Auto-rotate videos every 15 minutes to allow full-length playback
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentHeroVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
  //   }, 900000) // Change video every 15 minutes (900000ms)

  //   return () => clearInterval(interval)
  // }, [videos.length])

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    async function loadLive() {
      try {
        const cfg = await getLiveConfig()
        setLiveConfig(cfg)
        setLiveError(null)
      } catch (err: any) {
        setLiveError((err as Error)?.message || 'Could not load live stream')
      }
    }
    loadLive()
  }, [])

  useEffect(() => {
    if (!liveConfig?.streamUrl || !videoRef.current) return

    const videoEl = videoRef.current
    let hls: any = null

    const setup = async () => {
      // Native HLS support
      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = liveConfig.streamUrl
        try {
          await videoEl.play()
        } catch {
          /* autoplay may be blocked */
        }
        return
      }

      // Fallback to hls.js via CDN without bundling
      if (!(window as any).Hls) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js'
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      const Hls = (window as any).Hls
      if (!Hls?.isSupported()) {
        setLiveError('Browser does not support HLS playback')
        return
      }

      hls = new Hls({ enableWorker: true, lowLatencyMode: true })
      hls.loadSource(liveConfig.streamUrl)
      hls.attachMedia(videoEl)
      hls.on(Hls.Events.ERROR, (_evt: any, data: any) => {
        if (data?.fatal) setLiveError('Live stream error, please retry')
      })

      try {
        await videoEl.play()
      } catch {
        /* autoplay may be blocked */
      }
    }

    setup()

    return () => {
      if (hls) hls.destroy()
      if (videoEl) {
        videoEl.pause()
        videoEl.removeAttribute('src')
      }
    }
  }, [liveConfig?.streamUrl])


  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(video => video.category === selectedCategory)

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
  }


  return (
    <div className={`livetv ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      <section className="livetv-hero">
        <div className="hero-video-carousel">
          <div className="hero-video-player">
            {liveConfig?.streamUrl ? (
              <video
                ref={videoRef}
                className="hero-video-player"
                controls
                muted
                playsInline
                autoPlay
              />
            ) : (
              <div className="hero-video-fallback">
                <p>No live stream configured.</p>
              </div>
            )}
          </div>

          <div className="live-container">
            <div className="live-tag">LIVE</div>
            <div className="live-time">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="hero-video-overlay">
            <div className="hero-video-info">
              <span className="hero-video-category">Live</span>
              <h2 className="hero-video-title">{liveConfig?.title || 'Live Sustainable Engineering Channel'}</h2>
              <p className="hero-video-description">{liveConfig?.description || 'Streaming now'}</p>
            </div>
          </div>
        </div>
      </section>

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