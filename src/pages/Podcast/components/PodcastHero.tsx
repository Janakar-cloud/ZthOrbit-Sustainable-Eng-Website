import React from 'react'
import { PodcastHeroProps } from '../type/type'

const PodcastHero = React.memo(function PodcastHero({
  imgStatus,
  title,
  subtitle,
  className = '',
  buttonStatus,
  onHandleNavigate,
}: PodcastHeroProps) {
  return (
    <section className={`${className}`}>
      <div className="podcast-hero-overlay" />
      <div className="podcast-hero-content">
        {imgStatus && (
          <div className="podcast-icon-large">
            <span className="material-icons">podcasts</span>
          </div>)}

        <h1 className="podcast-hero-title">{title}</h1>

        <p className="podcast-hero-subtitle">
          {subtitle}
        </p>
      </div>
      {buttonStatus && (
        <div className="cta-action-buttons">
          <button className="cta-action-btn primary" onClick={() => onHandleNavigate('about')}>
            <span>Contact Us</span>
            <span className="material-icons">send</span>
          </button>
          <button className="cta-action-btn secondary" onClick={() => onHandleNavigate('home')}>
            <span>Explore More</span>
            <span className="material-icons">explore</span>
          </button>
        </div>
      )}
    </section>
  )
})

export default PodcastHero
