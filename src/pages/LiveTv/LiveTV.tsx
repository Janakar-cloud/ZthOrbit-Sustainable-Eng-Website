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
  const { darkMode, isLoggedIn } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [liveUrl, setLiveUrl] = useState('')
  const [liveTitle, setLiveTitle] = useState('Live Sustainable Engineering Channel')
  const [liveDescription, setLiveDescription] = useState('Streaming now')
  const [liveError, setLiveError] = useState<string | null>(null)
  const [accessMode, setAccessMode] = useState<'direct' | 'cloudfront' | 's3_playlist' | null>(null)
  const [playlist, setPlaylist] = useState<S3Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Clock
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setLiveUrl('')
      setLiveError('Please login to watch the live stream.')
      return
    }

    requestLiveAccess()
      .then((res) => {
        // Handle S3 playlist mode
        if (res.accessMode === 's3_playlist') {
          setPlaylist(res.playlist)
          setCurrentVideoIndex(0)
          if (res.playlist.length > 0) {
            setLiveUrl(res.playlist[0].url)
          }
          setAccessMode('s3_playlist')
          setLiveTitle(res.title || 'Live Sustainable Engineering Channel')
          setLiveDescription(res.description || 'Streaming now')
        } else {
          // Handle direct/cloudfront modes
          setLiveUrl(res.streamUrl)
          const mode = res.accessMode === 'cloudfront' ? 'cloudfront' : 'direct'
          setAccessMode(mode)
          setLiveTitle(res.title || 'Live Sustainable Engineering Channel')
          setLiveDescription(res.description || 'Streaming now')
        }
        
        setLiveError(null)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Could not load live stream'
        setLiveError(message)
        setLiveUrl('')
        setAccessMode(null)
      })
  }, [isLoggedIn])

  useEffect(() => {
    if (!liveUrl || !videoRef.current) return

    const videoEl = videoRef.current
    let hls: any = null

    const setup = async () => {
      // For S3 playlist mode, play MP4 directly
      if (accessMode === 's3_playlist') {
        videoEl.src = liveUrl
        try {
          await videoEl.play()
        } catch {
          /* autoplay may be blocked */
        }
        return
      }

      // For HLS streams (direct/cloudfront modes)
      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = liveUrl
        try {
          await videoEl.play()
        } catch {
          /* autoplay may be blocked */
        }
        return
      }

      if (!(window as any).Hls) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load HLS library'))
          document.body.appendChild(script)
        })
      }

      const Hls = (window as any).Hls
      if (!Hls?.isSupported()) {
        setLiveError('Browser does not support HLS playback')
        return
      }

      const hlsConfig: Record<string, unknown> = {
        lowLatencyMode: true,
        enableWorker: true,
      }

      if (accessMode === 'cloudfront') {
        hlsConfig.xhrSetup = (xhr: XMLHttpRequest) => {
          xhr.withCredentials = true
        }
      }

      hls = new Hls(hlsConfig)

      hls.loadSource(liveUrl)
      hls.attachMedia(videoEl)
      hls.on(Hls.Events.ERROR, (_evt: unknown, data: { fatal?: boolean }) => {
        if (data?.fatal) setLiveError('Live stream playback error. Please refresh.')
      })

      try {
        await videoEl.play()
      } catch {
        /* autoplay may be blocked */
      }
    }

    setup().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to start stream'
      setLiveError(message)
    })

    return () => {
      if (hls) hls.destroy()
      if (videoEl) {
        videoEl.pause()
        videoEl.removeAttribute('src')
      }
    }
  }, [liveUrl, accessMode])

  // Handle playlist looping
  useEffect(() => {
    if (accessMode !== 's3_playlist' || !videoRef.current || playlist.length === 0) return

    const videoEl = videoRef.current

    const handleVideoEnd = () => {
      // Move to next video in playlist, loop back to start
      setCurrentVideoIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % playlist.length
        setLiveUrl(playlist[nextIndex].url)
        setLiveDescription(`Playing ${playlist[nextIndex].fileName} (${nextIndex + 1}/${playlist.length})`)
        return nextIndex
      })
    }

    videoEl.addEventListener('ended', handleVideoEnd)

    return () => {
      videoEl.removeEventListener('ended', handleVideoEnd)
    }
  }, [accessMode, playlist, currentVideoIndex])

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
            {liveUrl ? (
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
                <p>{liveError || 'No live stream configured.'}</p>
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
              <h2 className="hero-video-title">{liveTitle}</h2>
              <p className="hero-video-description">{liveDescription}</p>
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