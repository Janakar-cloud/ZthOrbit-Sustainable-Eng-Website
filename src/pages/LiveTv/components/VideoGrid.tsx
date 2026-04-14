import { VideoGridProps } from "../type/type"

export default function VideoGrid({
  videos,
  onPlay,
  className = '',
  cardClassName = '',
}: VideoGridProps) {
  const TEXT_LIMIT = 120;
  const truncateText = (text: string = "", limit: number = TEXT_LIMIT) => {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };
  return (
    <div className={`video-grid ${className}`}>
      {videos.map(video => (
        <div
          key={video.id}
          className={`video-card ${cardClassName}`}
          onClick={() => onPlay(video)}
        >
          <div className="video-thumbnail">
            {video.thumbnail
              ? <img src={video.thumbnail} alt={video.title} />
              : <div className="video-thumbnail-placeholder"><span className="material-icons">play_circle</span></div>
            }
            <div className="video-overlay">
              <span className="material-icons play-icon">play_circle</span>
            </div>
            <span className="video-category">{truncateText(video.category, 15)}</span>
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
  )
}
