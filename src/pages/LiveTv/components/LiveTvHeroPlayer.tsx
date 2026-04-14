import { useState, useEffect, useRef } from 'react'
import { LiveVideo } from '../../../hooks/videolive'
import { useSharedCategories } from '../../../hooks/categories'
import { canonicalizeCategoryNames } from '../../../utils/category'
import '../../../style/LiveTV.css'

function getMimeType(url: string): string {
  const ext = (url ?? '').split('?')[0].split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    mp4: 'video/mp4', m4v: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    ts: 'video/mp2t',
    ogv: 'video/ogg',
  }
  return map[ext] ?? 'video/mp4'
}

interface VideoItem {
  id: string
  title: string
  description: string
  streamUrl: string
  category: string
  isLive: boolean
}

interface LiveTvHeroPlayerProps {
  isModalOpen?: boolean
}

export default function LiveTvHeroPlayer({ isModalOpen = false }: LiveTvHeroPlayerProps) {
  const [liveVideos, setLiveVideos] = useState<VideoItem[]>([])
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [overlayVisible, setOverlayVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { videocast } = LiveVideo()
  const { categories: sharedCategories } = useSharedCategories()

  useEffect(() => {
    if (!Array.isArray(videocast?.items)) return
    const heroVideos: VideoItem[] = videocast.items
      .filter((item: any) => !!(item.streamUrl || item.fileUrl || item.hlsUrl || item.url))
      .map((item: any) => {
        const categoryNames = canonicalizeCategoryNames(
          [
            item.category,
            ...(Array.isArray(item.categories) ? item.categories : []),
            ...(Array.isArray(item.tags)
              ? item.tags
                  .filter((tag: any) => tag?.kind === 'category')
                  .map((tag: any) => tag?.name)
              : []),
          ],
          sharedCategories
        )
        return {
          id: item._id,
          title: item.title,
          description: item.description || '',
          streamUrl: item.streamUrl || item.fileUrl || item.hlsUrl || item.url || '',
          category: categoryNames[0] || '',
          isLive: item.isLive ?? false,
        }
      })
    setLiveVideos(heroVideos)
  }, [sharedCategories, videocast])

  // Restore saved session + start clock
  useEffect(() => {
    const savedIndex = localStorage.getItem('currentVideoIndex')
    const savedTime = localStorage.getItem('videoTime')
    if (savedIndex !== null) setCurrentHeroVideoIndex(Number(savedIndex))
    setTimeout(() => {
      if (savedTime && videoRef.current) {
        videoRef.current.currentTime = Number(savedTime)
      }
    }, 500)
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // Clamp index when videos load
  useEffect(() => {
    if (liveVideos.length > 0) {
      setCurrentHeroVideoIndex(prev => Math.min(prev, liveVideos.length - 1))
    }
  }, [liveVideos])

  // Reset overlay visibility whenever the video changes
  useEffect(() => {
    setOverlayVisible(true)
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    overlayTimerRef.current = setTimeout(() => setOverlayVisible(false), 10000)
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    }
  }, [currentHeroVideoIndex])

  // Mute hero while a modal is open
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isModalOpen
    }
  }, [isModalOpen])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      localStorage.setItem('videoTime', videoRef.current.currentTime.toString())
    }
  }

  const handleVideoEnd = () => {
    setCurrentHeroVideoIndex(prev => {
      const nextIndex = liveVideos.length ? (prev + 1) % liveVideos.length : 0
      localStorage.setItem('currentVideoIndex', nextIndex.toString())
      localStorage.setItem('videoTime', '0')
      return nextIndex
    })
  }

  if (liveVideos.length === 0) return null

  return (
    <section className="livetv-hero">
      <div className="hero-video-carousel">

        {/* VIDEO PLAYER */}
        <video
          ref={videoRef}
          key={currentHeroVideoIndex}
          className="hero-video-player"
          controls={false}
          autoPlay
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate}
        >
          <source
            src={liveVideos[currentHeroVideoIndex]?.streamUrl || ''}
            type={getMimeType(liveVideos[currentHeroVideoIndex]?.streamUrl || '')}
          />
        </video>

        {/* LIVE TAG */}
        <div className="live-container">
          <div className="live-tag">LIVE</div>
          <div className="live-time">{currentTime.toLocaleTimeString()}</div>
        </div>

        {/* OVERLAY */}
        <div className={`hero-video-overlay${overlayVisible ? '' : ' hero-video-overlay--hidden'}`}>
          <div className="hero-video-info">
            <span className="hero-video-category">
              {liveVideos[currentHeroVideoIndex]?.category}
            </span>
            <h2 className="hero-video-title">
              {liveVideos[currentHeroVideoIndex]?.title}
            </h2>
          </div>
        </div>

      </div>
    </section>
  )
}
