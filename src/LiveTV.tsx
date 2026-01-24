import { useState, useEffect } from 'react'
import './LiveTV.css'

interface LiveTVProps {
  onNavigate: (page: string) => void
}

interface Video {
  id: number
  title: string
  description: string
  videoId: string
  category: string
  publishDate: string
  thumbnail: string
}

export default function LiveTV({ onNavigate }: LiveTVProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0)

  const videos: Video[] = [
    {
      id: 1,
      title: 'Sustainable Engineering Innovation',
      description: 'Exploring cutting-edge sustainable engineering solutions and innovations for a greener future.',
      videoId: '1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ',
      category: 'sustainability',
      publishDate: 'Jan 20, 2026',
      thumbnail: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png'
    },
    {
      id: 2,
      title: 'Green Technology Insights',
      description: 'Deep dive into green technology applications and their impact on environmental conservation.',
      videoId: '121y0xbR6SEQSMZSIg0PVZA8Wn1DHzx7P',
      category: 'technology',
      publishDate: 'Jan 18, 2026',
      thumbnail: '/assets/images/delivering the sdg through the technology, governance and measurable impact.png'
    },
    {
      id: 3,
      title: 'Digital Transformation for Sustainability',
      description: 'How digital transformation is driving sustainable business practices across industries.',
      videoId: '1251b1AGfXIPIP_hGkk-mlnhr5s0TsnfJ',
      category: 'technology',
      publishDate: 'Jan 15, 2026',
      thumbnail: '/assets/images/digital ecosystem as a new driver of sustainable economic growth .png'
    },
    {
      id: 4,
      title: 'Economic Growth & Sustainability',
      description: 'Balancing economic development with environmental responsibility and sustainable practices.',
      videoId: '1SYOtz1TxW_iXmLd1PmVIMi6Ynqhj2Vh9',
      category: 'economy',
      publishDate: 'Jan 12, 2026',
      thumbnail: '/assets/images/Global Investor confiedence and qoatar_s reaffirmed financial credibility.png'
    },
    {
      id: 5,
      title: 'Leadership in Sustainable Development',
      description: 'Conscious leadership strategies for driving sustainable transformation in organizations.',
      videoId: '1Gxx8aFxFXFkmUc5jM94EC4orJJE_WMw0',
      category: 'leadership',
      publishDate: 'Jan 10, 2026',
      thumbnail: '/assets/images/Aligning Sustainabillity, ethics and governence for the future .png'
    },
    {
      id: 6,
      title: 'AI & Sustainable Development',
      description: 'Leveraging artificial intelligence for achieving sustainable development goals.',
      videoId: '1ZdEmNMQpkBhRIzfMf_BCERdnTQJgyqa6',
      category: 'technology',
      publishDate: 'Jan 8, 2026',
      thumbnail: '/assets/images/AI & Sustainability.jpeg'
    },
    {
      id: 7,
      title: 'Waste Management Innovation',
      description: 'Transforming waste into valuable resources through innovative management strategies.',
      videoId: '1_vqRWG1-m9-yqzQl-bLcxldQqUEJwUkh',
      category: 'sustainability',
      publishDate: 'Jan 5, 2026',
      thumbnail: '/assets/images/From Waste to Worth.png'
    },
    {
      id: 8,
      title: 'Financial Responsibility & Ethics',
      description: 'Understanding the role of finance in driving responsible and ethical business practices.',
      videoId: '1_ERDjEswCOTLWObPLA6T7cdgJK6IO-Hp',
      category: 'economy',
      publishDate: 'Jan 3, 2026',
      thumbnail: '/assets/images/Finance&Responsibilty.jpg'
    },
    {
      id: 9,
      title: 'Governance & Risk Management',
      description: 'Building resilient organizations through effective governance and risk management frameworks.',
      videoId: '15t9-nTlOgIMCyCBV-PzyxcnRAEa6nCCp',
      category: 'leadership',
      publishDate: 'Dec 28, 2025',
      thumbnail: '/assets/images/Governance-Risk-Management-and-Compliance.webp'
    },
    {
      id: 10,
      title: 'Sustainable Development Goals',
      description: 'Strategic approaches to achieving UN Sustainable Development Goals in business.',
      videoId: '1aqR59K66ZBXGn6yJAk1X6_SiVC6zOu_V',
      category: 'sustainability',
      publishDate: 'Dec 25, 2025',
      thumbnail: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png'
    },
    {
      id: 11,
      title: 'India\'s Digital Economy',
      description: 'Exploring India\'s digital convergence and its role in economic transformation.',
      videoId: '1nSNoRvalFMOjYnAPEAP5WkpneuEuqY2a',
      category: 'economy',
      publishDate: 'Dec 22, 2025',
      thumbnail: '/assets/images/India_s digital convergence and the imperative  of financial inclusion in 2026.png'
    },
    {
      id: 12,
      title: 'Green Banking Solutions',
      description: 'Innovation in banking sector driving sustainable financial solutions.',
      videoId: '199MXOMc2WKPW1EoO7qg-2TFCMTR6qLC4',
      category: 'economy',
      publishDate: 'Dec 20, 2025',
      thumbnail: '/assets/images/banking transformation in qatar from crisis response to strategic reinvention.png'
    },
    {
      id: 13,
      title: 'Technology for SDGs',
      description: 'Using technology, governance, and measurable impact to deliver sustainable development goals.',
      videoId: '19uh2THvg-NP7sq5yt4HwmHpTB5HJb7lZ',
      category: 'technology',
      publishDate: 'Dec 18, 2025',
      thumbnail: '/assets/images/delivering the sdg through the technology, governance and measurable impact.png'
    },
    {
      id: 14,
      title: 'Circular Economy Principles',
      description: 'Implementing circular economy principles for sustainable business models.',
      videoId: '1dxlSxij_Sy1crUUITUq6ujQyW4ug46Xa',
      category: 'sustainability',
      publishDate: 'Dec 15, 2025',
      thumbnail: '/assets/images/digital ecosystem as a new driver of sustainable economic growth .png'
    },
    {
      id: 15,
      title: 'Climate Risk Management',
      description: 'Strategic approaches to managing climate risks in business operations.',
      videoId: '1P5qt6TBLcT-r9O-zt3-LQYtqWB0Hx6M4',
      category: 'sustainability',
      publishDate: 'Dec 12, 2025',
      thumbnail: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png'
    },
    {
      id: 16,
      title: 'Ethical Leadership',
      description: 'Building ethical leadership frameworks for sustainable organizational growth.',
      videoId: '1HwDAbDruhmVpBm-lTJck3_i2hFImoZ7e',
      category: 'leadership',
      publishDate: 'Dec 10, 2025',
      thumbnail: '/assets/images/Aligning Sustainabillity, ethics and governence for the future .png'
    },
    {
      id: 17,
      title: 'Global Financial Markets',
      description: 'Understanding global financial markets and their impact on sustainable development.',
      videoId: '1d_nv4187CWh5OyPZJQOU0V00qW2uUcHE',
      category: 'economy',
      publishDate: 'Dec 8, 2025',
      thumbnail: '/assets/images/Global Investor confiedence and qoatar_s reaffirmed financial credibility.png'
    },
    {
      id: 18,
      title: 'Future of Sustainable Engineering',
      description: 'Vision for the future of sustainable engineering and environmental innovation.',
      videoId: '1LbHMMWP0PpfcbihotbbpTg2CtzqC8CM0',
      category: 'sustainability',
      publishDate: 'Dec 5, 2025',
      thumbnail: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png'
    }
  ]

  // Auto-rotate videos every 15 minutes to allow full-length playback
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }, 900000) // Change video every 15 minutes (900000ms)

    return () => clearInterval(interval)
  }, [videos.length])

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory)

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
  }

  return (
    <div className={`livetv ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="logo-container" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="logo-image" />
            <h1 className="logo">
              Green Generation <span className="logo-highlight">TV</span>
            </h1>
          </div>
          
          <nav className="desktop-nav">
            <a href="#" className="nav-link active">LiveTV</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('podcast'); }}>Podcast</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('articles'); }}>Articles</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About Us</a>
          </nav>

          <div className="header-actions">
            <div className="profile-menu-container">
              <button 
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="material-icons">account_circle</span>
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="profile-dropdown-item" onClick={() => setDarkMode(!darkMode)}>
                    <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button className="profile-dropdown-item">
                    <span className="material-icons">settings</span>
                    <span>Settings</span>
                  </button>
                  <button className="profile-dropdown-item">
                    <span className="material-icons">lock</span>
                    <span>Forgot Password</span>
                  </button>
                  <button className="profile-dropdown-item">
                    <span className="material-icons">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            
            <button className="login-button" onClick={() => onNavigate('login')}>
              Login
            </button>
          </div>
        </div>
      </header>

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
        <div className="livetv-filters">
          <button 
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span className="material-icons">apps</span>
            All Videos
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'sustainability' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('sustainability')}
          >
            <span className="material-icons">eco</span>
            Sustainability
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'technology' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('technology')}
          >
            <span className="material-icons">computer</span>
            Technology
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'economy' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('economy')}
          >
            <span className="material-icons">trending_up</span>
            Economy
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'leadership' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('leadership')}
          >
            <span className="material-icons">group</span>
            Leadership
          </button>
        </div>

        <div className="video-grid">
          {filteredVideos.map(video => (
            <div key={video.id} className="video-card" onClick={() => handlePlayVideo(video)}>
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="video-overlay">
                  <span className="material-icons play-icon">play_circle</span>
                </div>
                <span className="video-category">{video.category}</span>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-description">{video.description}</p>
                <div className="video-meta">
                  <span className="video-date">
                    <span className="material-icons">calendar_today</span>
                    {video.publishDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedVideo && (
        <div className="video-modal" onClick={handleCloseModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <span className="material-icons">close</span>
            </button>
            
            <div className="video-player">
              <iframe
                src={`https://drive.google.com/file/d/${selectedVideo.videoId}/preview`}
                width="100%"
                height="100%"
                allow="autoplay"
                allowFullScreen
              ></iframe>
            </div>

            <div className="video-details">
              <span className="video-category-badge">{selectedVideo.category}</span>
              <h2 className="video-details-title">{selectedVideo.title}</h2>
              <p className="video-details-description">{selectedVideo.description}</p>
              <div className="video-details-meta">
                <span>
                  <span className="material-icons">calendar_today</span>
                  {selectedVideo.publishDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo-container">
                <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="logo-image" />
                <h1 className="logo">
                  Green Generation <span className="logo-highlight">TV</span>
                </h1>
              </div>
              <p className="footer-description">
                Leading the way in sustainable engineering and environmental innovation for a greener future.
              </p>
            </div>
            
            <div>
              <h3 className="footer-heading">Explore</h3>
              <ul className="footer-list">
                <li><a onClick={() => onNavigate('home')}>Home</a></li>
                <li><a>Videos</a></li>
                <li><a onClick={() => onNavigate('podcast')}>Podcast</a></li>
                <li><a onClick={() => onNavigate('articles')}>Articles</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-list">
                <li><a onClick={() => onNavigate('about')}>About Us</a></li>
                <li><a>Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-newsletter">
              <h3 className="footer-heading">Engineering Insights</h3>
              <p className="newsletter-description">
                Get the latest sustainability updates from our team.
              </p>
              <form className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-button">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2026 Green Generation TV. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
