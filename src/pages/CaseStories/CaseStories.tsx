import { useState, useEffect } from 'react'
import './CaseStories.css'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import { useAppContext } from '../../context/AppContext'
import { getCaseStories } from '../../utils/api'

interface CaseStoriesProps {
  onNavigate: (page: string) => void
}

interface Story {
  id: number
  title: string
  category: string
  description: string
  impact: string
  duration: string
  image: string
  metrics: {
    label: string
    value: string
  }[]
}

export default function CaseStories({ onNavigate }: CaseStoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { darkMode } = useAppContext()

  const categories = [
    { id: 'all', name: 'All Stories', icon: 'apps' },
    { id: 'sustainability', name: 'Sustainability', icon: 'eco' },
    { id: 'leadership', name: 'Leadership', icon: 'groups' },
    { id: 'innovation', name: 'Innovation', icon: 'lightbulb' },
    { id: 'technology', name: 'Technology', icon: 'computer' }
  ]

  const defaultStories: Story[] = [
    {
      id: 1,
      title: 'Transforming Urban Waste Management',
      category: 'sustainability',
      description: 'Implemented comprehensive waste reduction program across major metropolitan areas, achieving zero-waste certification for 15 facilities.',
      impact: 'Reduced landfill waste by 85% and created 200+ green jobs',
      duration: '18 months',
      image: '/assets/images/seetharaman/Seetharaman1.jpg',
      metrics: [
        { label: 'CO₂ Reduced', value: '50K tons' },
        { label: 'Recycling Rate', value: '85%' },
        { label: 'Cost Savings', value: '$2.5M' }
      ]
    },
    {
      id: 2,
      title: 'Renewable Energy Transition Initiative',
      category: 'innovation',
      description: 'Led a Fortune 500 company through complete transition to renewable energy sources, establishing solar and wind infrastructure.',
      impact: 'Achieved 100% renewable energy across 50+ facilities',
      duration: '24 months',
      image: '/assets/images/seetharaman/Seetharaman2.jpg',
      metrics: [
        { label: 'Energy Clean', value: '100%' },
        { label: 'Facilities', value: '50+' },
        { label: 'Investment', value: '$45M' }
      ]
    },
    {
      id: 3,
      title: 'Sustainable Supply Chain Revolution',
      category: 'leadership',
      description: 'Redesigned global supply chain operations to prioritize sustainability, ethical sourcing, and carbon neutrality.',
      impact: 'Carbon-neutral supply chain serving 3 continents',
      duration: '36 months',
      image: '/assets/images/seetharaman/Seetharaman3.jpg',
      metrics: [
        { label: 'Carbon Offset', value: '100%' },
        { label: 'Suppliers', value: '200+' },
        { label: 'Countries', value: '25' }
      ]
    },
    {
      id: 4,
      title: 'AI-Powered Environmental Monitoring',
      category: 'technology',
      description: 'Developed machine learning platform to monitor and predict environmental impact across industrial operations.',
      impact: 'Real-time monitoring of 1000+ environmental data points',
      duration: '12 months',
      image: '/assets/images/seetharaman/Seetharaman1.jpg',
      metrics: [
        { label: 'Data Points', value: '1000+' },
        { label: 'Accuracy', value: '97%' },
        { label: 'Alerts', value: '24/7' }
      ]
    },
    {
      id: 5,
      title: 'Green Building Certification Program',
      category: 'sustainability',
      description: 'Achieved LEED Platinum certification for 20 corporate buildings through innovative design and sustainability practices.',
      impact: 'Energy consumption reduced by 60% per building',
      duration: '30 months',
      image: '/assets/images/seetharaman/Seetharaman2.jpg',
      metrics: [
        { label: 'Buildings', value: '20' },
        { label: 'Energy Saved', value: '60%' },
        { label: 'LEED Rating', value: 'Platinum' }
      ]
    },
    {
      id: 6,
      title: 'Community-Led Conservation Initiative',
      category: 'leadership',
      description: 'Mobilized local communities to protect and restore 10,000 acres of critical ecosystems and wildlife habitats.',
      impact: '10,000 acres restored, 50 species protected',
      duration: '48 months',
      image: '/assets/images/seetharaman/Seetharaman3.jpg',
      metrics: [
        { label: 'Acres Restored', value: '10K' },
        { label: 'Species', value: '50+' },
        { label: 'Volunteers', value: '2000+' }
      ]
    }
  ]

  const [stories, setStories] = useState<Story[]>(defaultStories)

  useEffect(() => {
    getCaseStories()
      .then((res) => {
        if (res.items.length) {
          const mapped: Story[] = res.items.map((s, i) => ({
            id: i + 1,
            title: s.title,
            category: (s.tags?.[0] || 'sustainability').toLowerCase(),
            description: s.bodyMd || '',
            impact: s.impact,
            duration: s.duration || '',
            image: s.heroImage || '/assets/images/seetharaman/Seetharaman1.jpg',
            metrics: s.metrics || [],
          }))
          setStories(mapped)
        }
      })
      .catch(() => { /* fallback to local data */ })
  }, [])

  const filteredStories = selectedCategory === 'all'
    ? stories
    : stories.filter(story => story.category === selectedCategory)

  return (
    <div className={`case-stories ${darkMode ? 'dark' : ''}`}>

      <Header onNavigate={onNavigate}/>
      

      <section className="case-hero">
        <div className="case-hero-overlay"></div>
        <div className="case-hero-content">
          <h1 className="case-hero-title">Transforming the World Through Action</h1>
          <p className="case-hero-subtitle">
            Explore real-world examples of sustainable leadership driving meaningful environmental and social impact
          </p>
          <div className="case-hero-stats">
            <div className="case-hero-stat">
              <span className="case-stat-number">50+</span>
              <span className="case-stat-label">Success Stories</span>
            </div>
            <div className="case-hero-stat">
              <span className="case-stat-number">30+</span>
              <span className="case-stat-label">Countries</span>
            </div>
            <div className="case-hero-stat">
              <span className="case-stat-number">100M+</span>
              <span className="case-stat-label">Lives Impacted</span>
            </div>
          </div>
        </div>
      </section>

      <section className="case-filter-section">
        <div className="case-container">
          <h2 className="filter-title">Filter by Category</h2>
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

      <section className="stories-section">
        <div className="case-container">
          <div className="stories-grid">
            {filteredStories.map(story => (
              <div key={story.id} className="story-card">
                <div className="story-image-container">
                  <img src={story.image} alt={story.title} className="story-image" />
                  <div className="story-category-badge">
                    <span className="material-icons">
                      {categories.find(c => c.id === story.category)?.icon}
                    </span>
                    <span>{story.category}</span>
                  </div>
                </div>
                <div className="story-content">
                  <div className="story-meta">
                    <span className="story-duration">
                      <span className="material-icons">schedule</span>
                      {story.duration}
                    </span>
                  </div>
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-description">{story.description}</p>
                  <div className="story-impact">
                    <span className="material-icons">trending_up</span>
                    <span>{story.impact}</span>
                  </div>
                  <div className="story-metrics">
                    {story.metrics.map((metric, index) => (
                      <div key={index} className="metric-item">
                        <span className="metric-value">{metric.value}</span>
                        <span className="metric-label">{metric.label}</span>
                      </div>
                    ))}
                  </div>
                  <button className="story-read-more">
                    <span>Read Full Story</span>
                    <span className="material-icons">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="case-cta-section">
        <div className="case-container">
          <div className="case-cta-content">
            <div className="cta-icon">
              <span className="material-icons">rocket_launch</span>
            </div>
            <h2 className="cta-title">Have a Success Story to Share?</h2>
            <p className="cta-description">
              We're always looking for inspiring examples of sustainable leadership and environmental impact.
              Share your story with our global community.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={() => onNavigate('about')}>
                <span>Submit Your Story</span>
                <span className="material-icons">send</span>
              </button>
              <button className="cta-btn secondary" onClick={() => onNavigate('home')}>
                <span>Learn More</span>
                <span className="material-icons">info</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* <footer className="case-footer">
        <div className="case-container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3 className="footer-title">Green Generation TV</h3>
              <p className="footer-description">
                Empowering sustainability through conscious leadership and media excellence.
              </p>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Home</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About Us</a></li>
                <li><a href="#" className="active">Case Stories</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Contact</h4>
              <ul className="footer-links">
                <li>info@greengenerationtv.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-heading">Follow Us</h4>
              <div className="social-icons">
                <a href="#" className="social-icon"><span className="material-icons">facebook</span></a>
                <a href="#" className="social-icon"><span className="material-icons">link</span></a>
                <a href="#" className="social-icon"><span className="material-icons">info</span></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Green Generation TV. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
      <Footer onNavigate={onNavigate}/>
      
    </div>
  )
}
