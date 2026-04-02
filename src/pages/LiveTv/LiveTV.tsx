import { useState, useEffect, useRef } from 'react'

function getMimeType(url: string): string {
  const ext = (url ?? '').split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    mp4: 'video/mp4', m4v: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    ts: 'video/mp2t',
    ogv: 'video/ogg',
  };
  return map[ext] ?? 'video/mp4';
}
import '../../style/LiveTV.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import VideoModal from '../../components/VideoModal'
import { Video } from '../HomePage/type/type'
import VideoCategoryFilters from './components/renderFilterButtons'
import VideoGrid from './components/VideoGrid'
import { VideoCategory } from './type/type'
import { LiveVideo } from '../../hooks/videolive'
import NoData from '../../components/Nodatafound'
import ErrorMessage from '../../components/ErroMessage'
import Loader from '../../components/Loader'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [liveVideos, setLiveVideos] = useState<Video[]>([]);
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0)
  const { darkMode } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [videos, setVideos] = useState<Video[]>([])
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([{
    key: 'all',
    label: 'All Videos',
    icon: 'apps'
  }])
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { videocast, loading, error, refetch } = LiveVideo();

  useEffect(() => {
    if (!Array.isArray(videocast?.items)) return;
    const allVideos: Video[] = videocast.items
      .filter((item: any) => typeof item.thumbnailUrl === 'string' && item.thumbnailUrl.trim().length > 0)
      .map((item: any) => ({
      id: item._id,
      title: item.title,
      description: item.description || "",
      videoId: item.videoId || "",
      streamUrl: item.streamUrl || item.hlsUrl || item.url,
      category: item.tags?.[0]?.name || "",
      isLive: item.isLive ?? false,
      publishDate: new Date(item.publishDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      thumbnail: item.thumbnailUrl,
    }));


    setVideos(allVideos);
    setLiveVideos(allVideos);
    const categoryList = buildCategoryList(allVideos);
    setVideoCategories(categoryList);

  }, [videocast]);



  const buildCategoryList = (videos: Video[]) => {
    return [
      { key: 'all', label: 'All Videos', icon: 'apps' },
      ...Array.from(new Set(videos.map(v => v.category)))
        .filter(Boolean)
        .map(cat => ({
          key: cat,
          label: cat,
          icon: 'video_library'
        }))
    ];
  };

  //  Load saved session (index + time)
  useEffect(() => {
    const savedIndex = localStorage.getItem("currentVideoIndex")
    const savedTime = localStorage.getItem("videoTime")

    if (savedIndex !== null) {
      setCurrentHeroVideoIndex(Number(savedIndex))
      // index will be clamped after videos load in the reset effect
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

  // Clamp hero index to valid range whenever videos change
  useEffect(() => {
    if (videos.length > 0) {
      setCurrentHeroVideoIndex(prev => Math.min(prev, videos.length - 1))
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

  if (!loading && videos.length === 0) {
    return (
      <div className={`livetv ${darkMode ? 'dark' : ''}`}>
        <Header onNavigate={onNavigate} />
        <div className="livetv-container">
          <NoData message="No videos available" onRetry={() => { refetch() }} />
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    )
  }

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
                {liveVideos[currentHeroVideoIndex]?.category}
              </span>
              <h2 className="hero-video-title">
                {liveVideos[currentHeroVideoIndex]?.title}
              </h2>
              <p className="hero-video-description">
                {liveVideos[currentHeroVideoIndex]?.description}
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

        {/* Loading */}
        {loading && (
          <Loader />
        )}

        {/* Error */}
        {error && (
          <ErrorMessage message={error} onRetry={() => { refetch() }} />
        )}

        {/* Data */}
        {!loading && !error && (
          <>
            {filteredVideos.length > 0 ? (
              <VideoGrid
                videos={filteredVideos}
                onPlay={handlePlayVideo}
                className="livetv-grid"
                cardClassName="livetv-card"
              />
            ) : (
              <NoData message="No videos available" onRetry={() => { refetch() }} />
            )}
          </>
        )}

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