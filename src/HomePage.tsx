import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Green Generation TV</h1>
          <p className="hero-subtitle">Sustainable Engineering Media Platform</p>
          <p className="hero-description">
            Empowering the next generation with knowledge and insights on sustainable engineering,
            eco-friendly innovations, and environmental solutions.
          </p>
          <div className="hero-cta">
            <button className="btn-primary">Explore Content</button>
            <button className="btn-secondary">Watch Live</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="material-icons">article</span>
              <h3>Articles</h3>
              <p>In-depth analysis and research on sustainable engineering practices</p>
            </div>
            <div className="feature-card">
              <span className="material-icons">mic</span>
              <h3>Podcast</h3>
              <p>Expert interviews and discussions on environmental innovations</p>
            </div>
            <div className="feature-card">
              <span className="material-icons">video_library</span>
              <h3>Case Stories</h3>
              <p>Real-world success stories of sustainable engineering projects</p>
            </div>
            <div className="feature-card">
              <span className="material-icons">live_tv</span>
              <h3>Live TV</h3>
              <p>Live broadcasts featuring sustainability experts and innovators</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
