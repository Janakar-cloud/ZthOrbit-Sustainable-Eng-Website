import React from 'react'
import { EpisodeCardProps } from '../type/type'

const EpisodeCard = React.memo(function EpisodeCard({
  podcast,
  isPlaying,
  isAdmin,
  onPlay,
  onToggleComments
}: EpisodeCardProps) {
  return (
    <div key={podcast.id} className={`episode-card ${isPlaying ? 'playing' : ''}`}>
      <div className="episode-image-container">
        <img
          src={podcast.image}
          alt={podcast.title}
          className="episode-image"
        />
        <div className="episode-category-badge">
          {podcast.category}
        </div>
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
            onClick={() => onPlay(podcast)}
          >
            <span className="material-icons">
              {isPlaying ? 'pause_circle' : 'play_circle'}
            </span>
            <span>{isPlaying ? 'Playing' : 'Play Episode'}</span>
          </button>

          <button
            className="comment-count-btn"
            onClick={() => onPlay(podcast)}
          >
            <span className="material-icons">comment</span>
            <span>{podcast.comments.length}</span>
          </button>

          {isAdmin && (
            <button
              className={`toggle-comments-btn ${
                podcast.commentsEnabled ? 'enabled' : 'disabled'
              }`}
              onClick={() => onToggleComments(podcast.id)}
              title={
                podcast.commentsEnabled
                  ? 'Disable Comments'
                  : 'Enable Comments'
              }
            >
              <span className="material-icons">
                {podcast.commentsEnabled
                  ? 'comment'
                  : 'comments_disabled'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default EpisodeCard
