import { Podcast } from '../pages/HomePage/type/type'

export default function PodcastModal({
  podcast,
  onClose
}: {
  podcast: Podcast
  onClose: () => void
}) {
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <div className="modal-video-wrapper">
          <img src={podcast.image} alt={podcast.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
          <audio controls style={{ width: '100%' }} autoPlay>
            <source src={podcast.audioFile} type="audio/mp4" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <div className="modal-info">
          <h3>{podcast.title}</h3>
          <p className="modal-date">{podcast.publishDate} • {podcast.duration}</p>
          <p className="modal-description">{podcast.description}</p>
          <span className="podcast-category" style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#00ff88', color: '#0a0a0a', borderRadius: '12px', fontSize: '0.85rem', marginTop: '10px' }}>{podcast.category}</span>
        </div>
      </div>
      </div>
      )
}
