import { useCallback, useState } from 'react'
import '../../style/HomePage.css'
import Header from '../../components/header/Header'
import { useAppContext } from '../../context/AppContext'
import Footer from '../../components/footer/Footer'
import PodcastModal from '../../components/PodcastModal'
import VideoModal from '../../components/VideoModal'
import WorkSection from './components/WorkSection'
import {ArticleItem,LiveTvItem,PodcastItem,Video, Podcast, HomePageProps} from './type/type'
import {latestVideo,articlesData,liveTVVideos,liveTv,ourVideo,podcast,podcastEpisodes} from './data/data'

export default function HomePage({ onNavigate }: HomePageProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const { darkMode, showProfileMenu, isAdmin,setActivePage } = useAppContext()

  
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
          items={liveTv}
          viewAll={() => {
             onNavigate('livetv')
             setActivePage('livetv')
          }}
          onItemClick={(item, poistion) => playVideo(liveTVVideos[poistion])}
        />

       {/* Podcasts */}
        <WorkSection
          title="Podcasts"
          subtitle="Listen to inspiring conversations and insights on sustainability."
          items={podcast}
          viewAll={() => {
            onNavigate('podcast')
            setActivePage('podcast')
            }
          }
          onItemClick={(item, poistion) => playPodcast(podcastEpisodes[poistion])}
        />


       {/* ARTICLES */}
        <WorkSection
          title="Articles"
          subtitle="Read thought leadership on sustainable development and innovation."
          items={articlesData}
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