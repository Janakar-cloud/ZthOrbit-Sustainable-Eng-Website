import { useCallback, useState } from 'react'
import '../../style/HomePage.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import PodcastModal from '../../components/PodcastModal'
import VideoModal from '../../components/VideoModal'
import WorkSection from './components/WorkSection'
import {Video, Podcast, HomePageProps} from './type/type'
import {latestVideo,articlesData,liveTVVideos,liveTv,ourVideo,podcast,podcastEpisodes} from './data/data'
import { useHomeData } from '../../hooks/home'

export default function HomePage({ onNavigate }: HomePageProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const { darkMode,setActivePage } = useAppContext()
  const { data: homeData } = useHomeData()

  // Map API videos → WorkSection items + modal items (fallback to static)
  const liveTvItems = homeData
    ? homeData.videos.slice(0, 4).map((v, i) => ({
        id: i + 1,
        title: v.title,
        description: v.description,
        image: v.thumbnailUrl,
      }))
    : liveTv

  const videosForModal: Video[] = homeData
    ? homeData.videos.slice(0, 4).map((v, i) => ({
        id: String(i + 1),
        title: v.title,
        description: v.description,
        streamUrl: v.streamUrl,
        thumbnail: v.thumbnailUrl || '',
        isLive: v.isLive,
        category: '',
        publishDate: v.publishDate || '',
      }))
    : liveTVVideos

  // Map API podcasts → WorkSection items + modal items (fallback to static)
  const podcastItems = homeData
    ? homeData.podcasts.slice(0, 4).map((p, i) => ({
        id: i + 1,
        title: p.title,
        description: p.description,
        image: p.imageUrl || '',
      }))
    : podcast

  const podcastsForModal: Podcast[] = homeData
    ? homeData.podcasts.slice(0, 4).map((p, i) => ({
        id: i + 1,
        title: p.title,
        description: p.description,
        audioFile: p.audioUrl,
        image: p.imageUrl || '',
        duration: p.duration || '',
        category: '',
        publishDate: p.publishDate || '',
      }))
    : podcastEpisodes

  // Map API articles → WorkSection items (fallback to static)
  const articleItems = homeData
    ? homeData.articles.slice(0, 4).map((a, i) => ({
        id: i + 1,
        title: a.title,
        description: a.subtitle || '',
        image: a.coverImage || '',
      }))
    : articlesData

  
  /* -------------------- HANDLERS -------------------- */

  const playVideo = useCallback((video?: Video) => {
    setSelectedVideo(video || latestVideo)
  }, [])

  const playPodcast = useCallback((podcast: Podcast) => {
    setSelectedPodcast(podcast)
  }, [])


  return (
    <div className={`homepage ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate} />

      <main className="main-container">
        <section className="hero-section">
          <div className="hero-background">
            <img
              src="/assets/images/seetharaman/Seetharaman2.jpg"
              alt="Dr. R. Seetharaman - Sustainable Leadership"
              className="hero-bg-image"
            />
            <div className="hero-overlay-bg"></div>
          </div>
          <div className="hero-content-container">
            <div className="hero-text-box-home">
              <div className="hero-icon-home">
                <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="hero-logo-image" />
              </div>
              <h1 className="hero-heading-home">EMPOWERING SUSTAINABILITY</h1>
              <p className="hero-subheading-home">Through Conscious Leadership and Media</p>
              <div className="hero-stats-home">
                <div className="hero-stat-home">
                  <span className="stat-number-home">20+</span>
                  <span className="stat-label-home">Years Leadership</span>
                </div>
                <div className="hero-stat-home">
                  <span className="stat-number-home">Global</span>
                  <span className="stat-label-home">Impact</span>
                </div>
                <div className="hero-stat-home">
                  <span className="stat-number-home">Future</span>
                  <span className="stat-label-home">Generation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="work-section">
          <div className="work-header">
            <div className="work-header-left">
              <h2 className="work-title">Our Work</h2>
              <p className="work-subtitle">
                Discover our latest productions and featured content.
              </p>
            </div>
            <a href="#" className="work-view-all">
              View All
              <span className="material-icons">arrow_forward</span>
            </a>
          </div>
          <div className="work-grid" style={{ cursor: 'pointer' }}>
            {ourVideo.map((item, i) => (
              item.isPlay ? (
                <div key={i} className="work-card" onClick={() => playVideo()}>
                  <div className="work-image-wrapper">
                    <img
                      src={item.imgurl}
                      alt={item.title}
                    />
                    <div className="work-image-overlay" />
                  </div>
                  <div className="work-card-content" onClick={() => 
                  {
                    onNavigate(item.onNavigation);
                    setActivePage(item.onNavigation)
                  }}>
                    <h3 className='work-sub-title'>{item.title}</h3>
                    <p className='work-description'>{item.desc}</p>
                  </div>
                </div>) : (
                <div key={i} className="work-card" onClick={() =>  {
                    onNavigate(item.onNavigation);
                    setActivePage(item.onNavigation)
                  }}>
                  <div className="work-image-wrapper">
                    <img
                      src={item.imgurl}
                      alt={item.title}
                    />
                    <div className="work-image-overlay" />
                  </div>
                  <div className="work-card-content">
                    <h3 className='work-sub-title'>{item.title}</h3>
                    <p className='work-description'>{item.desc}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>



       {/* Live Tv */}
        <WorkSection
          title="Live TV"
          subtitle="Discover our latest live broadcasts and streaming content."
          items={liveTvItems}
          viewAll={() => {
             onNavigate('livetv')
             setActivePage('livetv')
          }}
          onItemClick={(_, position) => playVideo(videosForModal[position])}
        />

       {/* Podcasts */}
        <WorkSection
          title="Podcasts"
          subtitle="Listen to inspiring conversations and insights on sustainability."
          items={podcastItems}
          viewAll={() => {
            onNavigate('podcast')
            setActivePage('podcast')
            }
          }
          onItemClick={(_, position) => playPodcast(podcastsForModal[position])}
        />


       {/* ARTICLES */}
        <WorkSection
          title="Articles"
          subtitle="Read thought leadership on sustainable development and innovation."
          items={articleItems}
          viewAll={() => {
            onNavigate('articles')
            setActivePage('articles')
           }
          }
          onItemClick={() => {
            onNavigate('articles')
            setActivePage('articles')
           }}
        />
      </main>


      <Footer onNavigate={onNavigate} />

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Podcast Modal */}
      {selectedPodcast && (
        <PodcastModal
          podcast={selectedPodcast}
          onClose={() => setSelectedPodcast(null)}
        />
      )}
    </div>
  )
}