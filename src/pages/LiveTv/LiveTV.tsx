import { useState, useEffect } from 'react'
import '../../style/LiveTV.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import VideoModal from '../../components/VideoModal'
import { Video } from '../HomePage/type/type'
import { videos } from '../LiveTv/data/data'
import VideoCategoryFilters from './components/renderFilterButtons'
import VideoGrid from './components/VideoGrid'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0)
  const { darkMode } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date());

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
    // Set first video
    setCurrentHeroVideoIndex(0);

    // Clock timer (updates every second)
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Video rotation timer (every 15 minutes)
    const videoInterval = setInterval(() => {
      setCurrentHeroVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 900000);

    // Cleanup
    return () => {
      clearInterval(clockTimer);
      clearInterval(videoInterval);
    };
  }, [videos.length]);


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
          <iframe
            key={currentHeroVideoIndex}
            src={`https://drive.google.com/file/d/${videos[currentHeroVideoIndex].videoId}/preview`}
            className="hero-video-player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={videos[currentHeroVideoIndex].title}
          ></iframe>

          {/* LIVE Tag Overlay */}
          {/* <div className="live-tag">LIVE</div> */}
              {/* LIVE Tag Overlay */}
          <div className="live-container">
            <div className="live-tag">LIVE</div>
            <div className="live-time">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="hero-video-overlay">
            <div className="hero-video-info">
              <span className="hero-video-category">{videos[currentHeroVideoIndex].category}</span>
              <h2 className="hero-video-title">{videos[currentHeroVideoIndex].title}</h2>
              <p className="hero-video-description">{videos[currentHeroVideoIndex].description}</p>
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