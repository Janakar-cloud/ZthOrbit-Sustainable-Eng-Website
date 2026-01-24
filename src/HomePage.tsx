import { useState } from 'react'
import './HomePage.css'

interface HomePageProps {
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

export default function HomePage({ onNavigate }: HomePageProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isAdmin] = useState(false) // Set to true for admin users
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Latest video (same as in LiveTV.tsx)
  const latestVideo: Video = {
    id: 1,
    title: 'Sustainable Engineering Innovation',
    description: 'Exploring cutting-edge sustainable engineering solutions and innovations for a greener future.',
    videoId: '1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ',
    category: 'sustainability',
    publishDate: 'Jan 20, 2026',
    thumbnail: '/assets/images/Sustainable development goals as a strategic framework for global stability (2).png'
  }

  // Live TV videos
  const liveTVVideos: Video[] = [
    {
      id: 1,
      title: 'Digital Ecosystem Growth',
      description: 'Exploring digital ecosystems as drivers of sustainable economic growth.',
      videoId: '1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ',
      category: 'technology',
      publishDate: 'Jan 20, 2026',
      thumbnail: '/assets/images/digital ecosystem as a new driver of sustainable economic growth .png'
    },
    {
      id: 2,
      title: 'Waste to Worth',
      description: 'Transforming waste into valuable resources through innovative solutions.',
      videoId: '121y0xbR6SEQSMZSIg0PVZA8Wn1DHzx7P',
      category: 'sustainability',
      publishDate: 'Jan 18, 2026',
      thumbnail: '/assets/images/From Waste to Worth.png'
    },
    {
      id: 3,
      title: 'Finance & Responsibility',
      description: 'Balancing financial growth with environmental responsibility.',
      videoId: '1251b1AGfXIPIP_hGkk-mlnhr5s0TsnfJ',
      category: 'finance',
      publishDate: 'Jan 15, 2026',
      thumbnail: '/assets/images/Finance&Responsibilty.jpg'
    },
    {
      id: 4,
      title: 'Digital Convergence in India',
      description: 'India\'s digital transformation and financial inclusion in 2026.',
      videoId: '1RFsLTZ8tI6z8-C9JgLfVhE7QGz9vXdqN',
      category: 'technology',
      publishDate: 'Jan 12, 2026',
      thumbnail: '/assets/images/India_s digital convergence and the imperative  of financial inclusion in 2026.png'
    }
  ]

  const handlePlayVideo = (video?: Video) => {
    setSelectedVideo(video || latestVideo)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
  }

  return (
    <div className={`homepage ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="logo-image" />
            <h1 className="logo">
              Green Generation <span className="logo-highlight">TV</span>
            </h1>
          </div>
          
          <nav className="desktop-nav">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('livetv'); }}>LiveTV</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('podcast'); }}>Podcast</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('articles'); }}>Articles</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About Us</a>
          </nav>
          
          <div className="header-actions">
            <div className="user-profile-container">
              <button className="user-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <span className="material-icons">account_circle</span>
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={() => setDarkMode(!darkMode)}>
                    <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button className="dropdown-item">
                    <span className="material-icons">settings</span>
                    <span>Settings</span>
                  </button>
                  <button className="dropdown-item">
                    <span className="material-icons">lock_reset</span>
                    <span>Forgot Password</span>
                  </button>
                  <button className="dropdown-item logout">
                    <span className="material-icons">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            {isAdmin && (
              <button className="admin-btn" onClick={() => onNavigate('admin')}>
                <span className="material-icons">admin_panel_settings</span>
                <span>Admin</span>
              </button>
            )}
            <button className="login-btn" onClick={() => onNavigate('login')}>
              <span>Login</span>
            </button>
            <button className="mobile-menu">
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </header>

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

        <section id="insights" className="work-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Our Work</h2>
              <p className="section-subtitle">Discover our latest productions and featured content.</p>
            </div>
            <a href="#" className="view-all">
              View All <span className="material-icons">arrow_forward</span>
            </a>
          </div>
          
          <div className="work-grid">
            <div className="work-card" style={{ cursor: 'pointer' }}>
              <div className="work-image-container" onClick={handlePlayVideo}>
                <img src="/assets/images/Sustainable development goals as a strategic framework for global stability (2).png" alt="Latest Videos" className="work-image" />
              </div>
              <h4 className="work-title" onClick={() => onNavigate('livetv')}>Latest Videos</h4>
              <p className="work-description" onClick={() => onNavigate('livetv')}>Check out our newest visual creations.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('podcast')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/AI & Sustainability.jpeg" alt="Featured Podcasts" className="work-image" />
              </div>
              <h4 className="work-title">Featured Podcasts</h4>
              <p className="work-description">Tune in to our most popular series.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('livetv')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/delivering the sdg through the technology, governance and measurable impact.png" alt="Recent Productions" className="work-image" />
              </div>
              <h4 className="work-title">Recent Productions</h4>
              <p className="work-description">Explore the work we're most proud of.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('livetv')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/Governance-Risk-Management-and-Compliance.webp" alt="Top Documentaries" className="work-image" />
              </div>
              <h4 className="work-title">Top Documentaries</h4>
              <p className="work-description">Stories that matter, told visually.</p>
            </div>
          </div>
        </section>
        <section id="insights" className="work-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Live TV</h2>
              <p className="section-subtitle">Discover our latest live broadcasts and streaming content.</p>
            </div>
            <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); onNavigate('livetv'); }}>
              View All <span className="material-icons">arrow_forward</span>
            </a>
          </div>
          
          <div className="work-grid">
            <div className="work-card" style={{ cursor: 'pointer' }}>
              <div className="work-image-container" onClick={() => handlePlayVideo(liveTVVideos[0])}>
                <img src="/assets/images/digital ecosystem as a new driver of sustainable economic growth .png" alt="Latest Videos" className="work-image" />
              </div>
              <h4 className="work-title">Latest Videos</h4>
              <p className="work-description">Check out our newest visual creations.</p>
            </div>
            
            <div className="work-card" style={{ cursor: 'pointer' }}>
              <div className="work-image-container" onClick={() => handlePlayVideo(liveTVVideos[1])}>
                <img src="/assets/images/From Waste to Worth.png" alt="Environmental Videos" className="work-image" />
              </div>
              <h4 className="work-title">Environmental Videos</h4>
              <p className="work-description">Sustainability solutions in action.</p>
            </div>
            
            <div className="work-card" style={{ cursor: 'pointer' }}>
              <div className="work-image-container" onClick={() => handlePlayVideo(liveTVVideos[2])}>
                <img src="/assets/images/Finance&Responsibilty.jpg" alt="Finance Videos" className="work-image" />
              </div>
              <h4 className="work-title">Finance Videos</h4>
              <p className="work-description">Responsible finance and growth.</p>
            </div>
            
            <div className="work-card" style={{ cursor: 'pointer' }}>
              <div className="work-image-container" onClick={() => handlePlayVideo(liveTVVideos[3])}>
                <img src="/assets/images/India_s digital convergence and the imperative  of financial inclusion in 2026.png" alt="Technology Videos" className="work-image" />
              </div>
              <h4 className="work-title">Technology Videos</h4>
              <p className="work-description">Digital innovation stories.</p>
            </div>
          </div>
        </section>

        <section id="podcasts" className="work-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Podcasts</h2>
              <p className="section-subtitle">Listen to inspiring conversations and insights on sustainability.</p>
            </div>
            <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); onNavigate('podcast'); }}>
              View All <span className="material-icons">arrow_forward</span>
            </a>
          </div>
          
          <div className="work-grid">
            <div className="work-card" onClick={() => onNavigate('podcast')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/AI & Sustainability.jpeg" alt="AI & Sustainable Development" className="work-image" />
              </div>
              <h4 className="work-title">AI & Sustainable Development</h4>
              <p className="work-description">How AI is enabling sustainability efforts globally.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('podcast')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/From Waste to Worth.png" alt="Waste to Value Opportunities" className="work-image" />
              </div>
              <h4 className="work-title">Waste to Value Opportunities</h4>
              <p className="work-description">Transforming waste into valuable business ventures.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('podcast')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/Finance&Responsibilty.jpg" alt="Finance & Responsibility" className="work-image" />
              </div>
              <h4 className="work-title">Finance & Responsibility</h4>
              <p className="work-description">Understanding financial responsibility beyond profit.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('podcast')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/Governance-Risk-Management-and-Compliance.webp" alt="Governance & Risk Management" className="work-image" />
              </div>
              <h4 className="work-title">Governance & Risk Management</h4>
              <p className="work-description">Building resilient sustainable organizations.</p>
            </div>
          </div>
        </section>

        <section id="articles" className="work-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Articles</h2>
              <p className="section-subtitle">Read thought leadership on sustainable development and innovation.</p>
            </div>
            <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); onNavigate('articles'); }}>
              View All <span className="material-icons">arrow_forward</span>
            </a>
          </div>
          
          <div className="work-grid">
            <div className="work-card" onClick={() => onNavigate('articles')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/Sustainable development goals as a strategic framework for global stability (2).png" alt="Latest Insights" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
              <h4 className="work-title">Latest Insights</h4>
              <p className="work-description">Fresh perspectives on sustainability.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('articles')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/digital ecosystem as a new driver of sustainable economic growth .png" alt="Technology & Innovation" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
              <h4 className="work-title">Technology & Innovation</h4>
              <p className="work-description">Digital transformation for sustainability.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('articles')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/Aligning Sustainabillity, ethics and governence for the future .png" alt="Leadership & Strategy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
              <h4 className="work-title">Leadership & Strategy</h4>
              <p className="work-description">Conscious leadership in action.</p>
            </div>
            
            <div className="work-card" onClick={() => onNavigate('articles')} style={{ cursor: 'pointer' }}>
              <div className="work-image-container">
                <img src="/assets/images/India_s digital convergence and the imperative  of financial inclusion in 2026.png" alt="Global Economics" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
              <h4 className="work-title">Global Economics</h4>
              <p className="work-description">Economic insights for a sustainable future.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
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
            
            <div className="footer-links">
              <h5 className="footer-heading">Explore</h5>
              <ul className="footer-list">
                <li><a onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>Home</a></li>
                <li><a onClick={() => onNavigate('livetv')} style={{ cursor: 'pointer' }}>Videos</a></li>
                <li><a onClick={() => onNavigate('livetv')} style={{ cursor: 'pointer' }}>Productions</a></li>
                <li><a onClick={() => onNavigate('articles')} style={{ cursor: 'pointer' }}>Case Stories</a></li>
              </ul>
            </div>
            
            <div className="footer-links">
              <h5 className="footer-heading">Company</h5>
              <ul className="footer-list">
                <li><a onClick={() => onNavigate('about')} style={{ cursor: 'pointer' }}>About Us</a></li>
                <li><a onClick={() => onNavigate('articles')} style={{ cursor: 'pointer' }}>Blog</a></li>
                <li><a onClick={() => onNavigate('about')} style={{ cursor: 'pointer' }}>Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-newsletter">
              <h5 className="footer-heading">Engineering Insights</h5>
              <p className="newsletter-description">
                Get the latest sustainability updates from our team.
              </p>
              <form className="newsletter-form">
                <input type="email" placeholder="Enter your email" className="newsletter-input" />
                <button type="submit" className="newsletter-button">Subscribe</button>
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

      <div className="mobile-nav">
        <button className="mobile-nav-button active">
          <span className="material-icons">grid_view</span>
          <span className="mobile-nav-label">Home</span>
        </button>
        <button className="mobile-nav-button">
          <span className="material-icons">bar_chart</span>
          <span className="mobile-nav-label">Stats</span>
        </button>
        <button className="mobile-nav-fab">
          <span className="material-icons">add</span>
        </button>
        <button className="mobile-nav-button">
          <span className="material-icons">article</span>
          <span className="mobile-nav-label">Blog</span>
        </button>
        <button className="mobile-nav-button" onClick={() => onNavigate('about')}>
          <span className="material-icons">settings</span>
          <span className="mobile-nav-label">Tools</span>
        </button>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={handleCloseModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <span className="material-icons">close</span>
            </button>
            <div className="modal-video-wrapper">
              <iframe
                src={`https://drive.google.com/file/d/${selectedVideo.videoId}/preview`}
                allow="autoplay"
                allowFullScreen
                className="modal-video"
              />
            </div>
            <div className="modal-info">
              <h3>{selectedVideo.title}</h3>
              <p className="modal-date">{selectedVideo.publishDate}</p>
              <p className="modal-description">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
