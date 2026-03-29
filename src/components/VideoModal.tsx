import { Video } from '../pages/HomePage/type/type'

export default function VideoModal({
  video,
  onClose
}: {
  video: Video
  onClose: () => void
}) {
  const videoSrc = video.streamUrl || (video.videoId ? `https://drive.google.com/file/d/${video.videoId}/preview` : '')
  return (
     <div className="video-modal" onClick={onClose}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
            <div className="modal-video-wrapper">
              {video.streamUrl ? (
                <video controls className="modal-video" src={videoSrc} />
              ) : (
                <iframe
                  src={videoSrc}
                  allow="autoplay"
                  allowFullScreen
                  className="modal-video"
                />
              )}
            </div>
            <div className="modal-info">
              <h3>{video.title}</h3>
              <p className="modal-date">{video.publishDate}</p>
              <p className="modal-description">{video.description}</p>
            </div>
          </div>
        </div>
  )
}
