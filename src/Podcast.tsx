import { useState } from 'react'
import './Podcast.css'

interface PodcastProps {
  onNavigate: (page: string) => void
}

interface Comment {
  id: number
  author: string
  content: string
  timestamp: string
  avatar: string
}

interface PodcastEpisode {
  id: number
  title: string
  description: string
  audioFile: string
  image: string
  duration: string
  category: string
  publishDate: string
  commentsEnabled: boolean
  comments: Comment[]
}

export default function Podcast({ onNavigate }: PodcastProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isAdmin] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastEpisode | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([
    {
      id: 1,
      title: 'A Call from the Earth: Opportunities',
      description: 'Exploring the urgent opportunities presented by our planet\'s environmental challenges. Discover how we can transform Earth\'s call to action into sustainable business ventures and meaningful impact.',
      audioFile: '/assets/podcast/A CALL FROM THE EARTH OPPORTUNITIES.m4a',
      image: '/assets/podcast/back-view-happy-young-man-looking-opportunity-door-wooden-background-success-future-abstraction-concept_670147-37595.jpg',
      duration: '45:30',
      category: 'sustainability',
      publishDate: 'Jan 15, 2026',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 2,
      title: 'Artificial Intelligence: A Great Enabler Towards Sustainable Development',
      description: 'How AI is revolutionizing sustainability efforts across industries. Learn about cutting-edge AI applications driving environmental conservation and sustainable practices.',
      audioFile: '/assets/podcast/ARTIFICIAL INTELLIGENCE IS A GREAT ENABLER TOWARDS SUSTAINABLE DEVELOPMENT.m4a',
      image: '/assets/podcast/shutterstock_1663029574.jpg',
      duration: '52:15',
      category: 'technology',
      publishDate: 'Jan 12, 2026',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 3,
      title: 'Digital Disruption: Case Studies & Cyber Hygiene',
      description: 'Real-world case studies of digital transformation and the critical importance of cyber hygiene in today\'s connected world. Essential insights for modern businesses.',
      audioFile: '/assets/podcast/DIGITAL DISRUPTION CASE STUDIES & CYBER HYGIENE.m4a',
      image: '/assets/podcast/at-is-digital-disruption-in-business-1024x577.webp',
      duration: '48:20',
      category: 'technology',
      publishDate: 'Jan 10, 2026',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 4,
      title: 'Understanding Market Dynamics: Examples and Insights',
      description: 'Practical examples to help you understand complex market dynamics. A deep dive into economic patterns, trends, and strategic thinking for sustainable growth.',
      audioFile: '/assets/podcast/EXAMPLES TO UNDERSTAND MARKET DYNAMICS.m4a',
      image: '/assets/podcast/apple-brainstorming-business-908288.jpg',
      duration: '41:45',
      category: 'economy',
      publishDate: 'Jan 8, 2026',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 5,
      title: 'Finance is Not Just Profit: It is Responsibility',
      description: 'Reimagining finance beyond profit margins. Understanding financial responsibility in the context of environmental stewardship and social impact.',
      audioFile: '/assets/podcast/FINANCE IS NOT JUST PROFIT. IT IS RESPONSIBILITY.m4a',
      image: '/assets/podcast/Fotolia_84568194_Subscription_Monthly_M.jpg',
      duration: '39:30',
      category: 'economy',
      publishDate: 'Jan 5, 2026',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 6,
      title: 'Financial Markets: About Meaning, Not Just Money',
      description: 'Exploring the deeper purpose of financial markets. How purpose-driven investing is reshaping global finance and creating lasting value.',
      audioFile: '/assets/podcast/FINANCIAL MARKETS ARE NOT ABOUT MONEY, IT IS ABOUT MEANING.m4a',
      image: '/assets/podcast/blog_financial_markets.jpg',
      duration: '44:10',
      category: 'economy',
      publishDate: 'Jan 3, 2026',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 7,
      title: 'Funding Opportunities for Sustainable Technologies',
      description: 'A comprehensive guide to funding sources for sustainable technology ventures. Learn about grants, investments, and innovative financing mechanisms.',
      audioFile: '/assets/podcast/FUNDING OPPORTUNITIES FOR SUSTAINABLE TECHNOLOGIES.m4a',
      image: '/assets/podcast/business funding.jpg',
      duration: '50:25',
      category: 'sustainability',
      publishDate: 'Dec 28, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 8,
      title: 'Global Markets vs India: A Performing Economic Eminence',
      description: 'Comparative analysis of India\'s economic performance against global markets. Insights into India\'s emerging economic leadership and opportunities.',
      audioFile: '/assets/podcast/GLOBAL MARKETS VS INDIA... A PERFORMING ECONOMIC EMINENCE.m4a',
      image: '/assets/podcast/global-markets-rise-100912619-16x9_0.jpg',
      duration: '46:55',
      category: 'economy',
      publishDate: 'Dec 25, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 9,
      title: 'Governance & Risk Management are Integral',
      description: 'Why governance and risk management cannot be separated. Essential frameworks for building resilient, sustainable organizations.',
      audioFile: '/assets/podcast/GOVERNANCE & RISK MANAGEMENT ARE INTEGRAL.m4a',
      image: '/assets/podcast/Risk-Management-shutterstock_1490634692-scaled.jpg',
      duration: '43:40',
      category: 'leadership',
      publishDate: 'Dec 22, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 10,
      title: 'Creating Opportunities in the New World Order',
      description: 'Navigating and capitalizing on opportunities in our rapidly changing world. Strategic insights for thriving in the new global landscape.',
      audioFile: '/assets/podcast/How do we create opportunities in the new world order .m4a',
      image: '/assets/podcast/common-ethical-issues-in-the-workplace.jpg',
      duration: '47:15',
      category: 'leadership',
      publishDate: 'Dec 20, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 11,
      title: 'From Waste to Value: Opportunities Unveiled',
      description: 'Transforming waste streams into valuable resources. Business opportunities in the circular economy and sustainable waste management.',
      audioFile: '/assets/podcast/OPPORTUNITIES FROM WASTE TO VALUES.m4a',
      image: '/assets/podcast/ecommerce-companie-lose-revenue.jpg',
      duration: '42:30',
      category: 'sustainability',
      publishDate: 'Dec 18, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 12,
      title: 'Opportunities in Climate Risk Management Start-ups',
      description: 'The emerging landscape of climate risk management ventures. How start-ups are addressing climate challenges with innovative solutions.',
      audioFile: '/assets/podcast/Opportunities in climate risk management start-up.m4a',
      image: '/assets/podcast/Climate-change-iStock-2157860285-679x419.jpg',
      duration: '49:20',
      category: 'sustainability',
      publishDate: 'Dec 15, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 13,
      title: 'Opportunities in Sustainable Development',
      description: 'Comprehensive overview of opportunities across sustainable development sectors. From clean energy to social impact, explore pathways to meaningful change.',
      audioFile: '/assets/podcast/OPPORTUNITIES IN SUSTAINABLE DEVELOPMENTS.m4a',
      image: '/assets/podcast/shutterstock_2490103407 (1).jpg',
      duration: '51:45',
      category: 'sustainability',
      publishDate: 'Dec 12, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 14,
      title: 'Recycling Opportunities: Good Business',
      description: 'Why recycling makes excellent business sense. Economic and environmental benefits of building a recycling-centered enterprise.',
      audioFile: '/assets/podcast/RECYCLING OPPORTUNITIES GOOD BUSINESS.m4a',
      image: '/assets/podcast/global_marketing.jpg',
      duration: '38:50',
      category: 'sustainability',
      publishDate: 'Dec 10, 2025',
      commentsEnabled: true,
      comments: []
    },
    {
      id: 15,
      title: 'Waste to Value: Business Opportunities in Dubai',
      description: 'Case studies from Dubai showcasing successful waste-to-value business models. Learn from real-world implementations in the Middle East.',
      audioFile: '/assets/podcast/WASTE TO VALUE BUSINESS OPPORTUNITIES CASE STUDIES IN DUBAI.m4a',
      image: '/assets/podcast/yoga part 2 (1).jpg',
      duration: '45:00',
      category: 'sustainability',
      publishDate: 'Dec 8, 2025',
      commentsEnabled: true,
      comments: []
    }
  ])

  const categories = [
    { id: 'all', name: 'All Episodes', icon: 'podcasts' },
    { id: 'sustainability', name: 'Sustainability', icon: 'eco' },
    { id: 'technology', name: 'Technology', icon: 'computer' },
    { id: 'economy', name: 'Economy', icon: 'trending_up' },
    { id: 'leadership', name: 'Leadership', icon: 'groups' }
  ]

  const filteredPodcasts = selectedCategory === 'all'
    ? podcasts
    : podcasts.filter(podcast => podcast.category === selectedCategory)

  const handlePlayPodcast = (podcast: PodcastEpisode) => {
    setSelectedPodcast(podcast)
    setCurrentlyPlaying(podcast.id)
  }

  const handleToggleComments = (podcastId: number) => {
    if (!isAdmin) return
    setPodcasts(podcasts.map(p => 
      p.id === podcastId ? { ...p, commentsEnabled: !p.commentsEnabled } : p
    ))
  }

  const handleAddComment = () => {
    if (!selectedPodcast || !newComment.trim()) return
    
    const comment: Comment = {
      id: Date.now(),
      author: 'Guest User',
      content: newComment,
      timestamp: new Date().toLocaleString(),
      avatar: 'account_circle'
    }

    setPodcasts(podcasts.map(p => 
      p.id === selectedPodcast.id 
        ? { ...p, comments: [...p.comments, comment] }
        : p
    ))
    
    setNewComment('')
    setSelectedPodcast({ ...selectedPodcast, comments: [...selectedPodcast.comments, comment] })
  }

  return (
    <div className={`podcast-page ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/assets/images/GREENTVLOGO.png" alt="Green TV Logo" className="logo-image" />
            <h1 className="logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
              Green Generation <span className="logo-highlight">TV</span>
            </h1>
          </div>
          
          <nav className="desktop-nav">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate('livetv'); }}>LiveTV</a>
            <a href="#" className="nav-link active">Podcast</a>
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

      <section className="podcast-hero">
        <div className="podcast-hero-overlay"></div>
        <div className="podcast-hero-content">
          <div className="podcast-icon-large">
            <span className="material-icons">podcasts</span>
          </div>
          <h1 className="podcast-hero-title">Green Generation Podcast</h1>
          <p className="podcast-hero-subtitle">
            Conversations that inspire sustainable action and conscious leadership
          </p>
        </div>
      </section>

      <section className="podcast-filter-section">
        <div className="podcast-container">
          <h2 className="filter-title">Browse by Category</h2>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="material-icons">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="podcast-episodes-section">
        <div className="podcast-container">
          <div className="episodes-grid">
            {filteredPodcasts.map(podcast => (
              <div key={podcast.id} className={`episode-card ${currentlyPlaying === podcast.id ? 'playing' : ''}`}>
                <div className="episode-image-container">
                  <img src={podcast.image} alt={podcast.title} className="episode-image" />
                  <div className="episode-category-badge">{podcast.category}</div>
                </div>
                <div className="episode-content">
                  <h3 className="episode-title">{podcast.title}</h3>
                  <p className="episode-description">{podcast.description}</p>
                  <div className="episode-meta">
                    <span className="episode-duration">
                      <span className="material-icons">schedule</span>
                      {podcast.duration}
                    </span>
                    <span className="episode-date">
                      <span className="material-icons">calendar_today</span>
                      {podcast.publishDate}
                    </span>
                  </div>
                  <div className="episode-actions">
                    <button 
                      className="play-btn"
                      onClick={() => handlePlayPodcast(podcast)}
                    >
                      <span className="material-icons">
                        {currentlyPlaying === podcast.id ? 'pause_circle' : 'play_circle'}
                      </span>
                      <span>{currentlyPlaying === podcast.id ? 'Playing' : 'Play Episode'}</span>
                    </button>
                    <button className="comment-count-btn" onClick={() => handlePlayPodcast(podcast)}>
                      <span className="material-icons">comment</span>
                      <span>{podcast.comments.length}</span>
                    </button>
                    {isAdmin && (
                      <button 
                        className={`toggle-comments-btn ${podcast.commentsEnabled ? 'enabled' : 'disabled'}`}
                        onClick={() => handleToggleComments(podcast.id)}
                        title={podcast.commentsEnabled ? 'Disable Comments' : 'Enable Comments'}
                      >
                        <span className="material-icons">
                          {podcast.commentsEnabled ? 'comment' : 'comments_disabled'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedPodcast && (
        <div className="podcast-modal-overlay" onClick={() => setSelectedPodcast(null)}>
          <div className="podcast-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPodcast(null)}>
              <span className="material-icons">close</span>
            </button>
            
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-icon">
                  <span className="material-icons">podcasts</span>
                </div>
                <div className="modal-info">
                  <h2 className="modal-title">{selectedPodcast.title}</h2>
                  <div className="modal-meta">
                    <span className="modal-category">{selectedPodcast.category}</span>
                    <span className="modal-duration">{selectedPodcast.duration}</span>
                    <span className="modal-date">{selectedPodcast.publishDate}</span>
                  </div>
                </div>
              </div>

              <p className="modal-description">{selectedPodcast.description}</p>

              <div className="audio-player">
                <audio controls autoPlay className="audio-element">
                  <source src={selectedPodcast.audioFile} type="audio/mp4" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              {selectedPodcast.commentsEnabled ? (
                <div className="comments-section">
                  <div className="comments-header">
                    <h3 className="comments-title">
                      <span className="material-icons">comment</span>
                      Comments ({selectedPodcast.comments.length})
                    </h3>
                    {isAdmin && (
                      <button 
                        className="disable-comments-btn"
                        onClick={() => handleToggleComments(selectedPodcast.id)}
                      >
                        <span className="material-icons">comments_disabled</span>
                        <span>Disable Comments</span>
                      </button>
                    )}
                  </div>

                  <div className="add-comment">
                    <div className="comment-avatar">
                      <span className="material-icons">account_circle</span>
                    </div>
                    <div className="comment-input-wrapper">
                      <textarea
                        className="comment-input"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <button 
                        className="submit-comment-btn"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <span className="material-icons">send</span>
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </div>

                  <div className="comments-list">
                    {selectedPodcast.comments.length === 0 ? (
                      <div className="no-comments">
                        <span className="material-icons">chat_bubble_outline</span>
                        <p>No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      selectedPodcast.comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            <span className="material-icons">{comment.avatar}</span>
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">{comment.author}</span>
                              <span className="comment-timestamp">{comment.timestamp}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="comments-disabled">
                  <span className="material-icons">comments_disabled</span>
                  <p>Comments are disabled for this episode</p>
                  {isAdmin && (
                    <button 
                      className="enable-comments-btn"
                      onClick={() => handleToggleComments(selectedPodcast.id)}
                    >
                      <span className="material-icons">comment</span>
                      <span>Enable Comments</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
