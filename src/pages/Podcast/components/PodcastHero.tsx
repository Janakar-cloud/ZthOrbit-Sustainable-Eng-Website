import React from 'react'
import { PodcastHeroProps } from '../type/type'

const PodcastHero = React.memo(function PodcastHero({
  imgStatus,
  title,
  subtitle,
  className = ''
}: PodcastHeroProps) {
  return (
    <section className={`${className}`}>
      <div className="podcast-hero-overlay" />
      <div className="podcast-hero-content">
        { imgStatus && (
        <div className="podcast-icon-large">
          <span className="material-icons">podcasts</span>
        </div> )}

        <h1 className="podcast-hero-title">{title}</h1>

        <p className="podcast-hero-subtitle">
          {subtitle}
        </p>
      </div>
    </section>
  )
})

export default PodcastHero
