import { Video } from '../pages/HomePage/type/type'

function getMimeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    mp4: 'video/mp4', m4v: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    ts: 'video/mp2t',
    ogv: 'video/ogg',
  };
  return map[ext] ?? 'video/mp4';
}

export default function VideoModal({
  video,
  onClose
}: {
  video: Video
  onClose: () => void
}) {
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <div className="modal-video-wrapper">
          <video
            className="hero-video-player-model"
            controls
            autoPlay
            playsInline
            preload="auto"
          >
            <source
              src={video.streamUrl || ''}
              type={getMimeType(video.streamUrl || '')}
            />
          </video>

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
