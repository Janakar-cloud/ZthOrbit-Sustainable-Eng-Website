import { useRef, useState, useEffect } from 'react'
import { Video } from '../pages/HomePage/type/type'
import { recordView, recordLike, getEngageStats } from '../api/engage'

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
  const viewTracked = useRef(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id)

  useEffect(() => {
    if (!video.id || !isMongoId(String(video.id))) return
    getEngageStats('video', String(video.id))
      .then((stats) => setLikeCount(stats.likes))
      .catch(() => {})
  }, [video.id])

  const handleLike = async () => {
    const action = liked ? 'unlike' : 'like'
    setLiked(!liked)
    setLikeCount((c) => liked ? c - 1 : c + 1)
    if (!isMongoId(String(video.id))) return
    try {
      const updated = await recordLike('video', String(video.id), action)
      setLikeCount(updated)
    } catch {
      setLiked(liked)
      setLikeCount((c) => liked ? c + 1 : c - 1)
    }
  }

  const handlePlay = () => {
    if (!viewTracked.current && video.id && isMongoId(String(video.id))) {
      viewTracked.current = true
      recordView('video', String(video.id))
    }
  }

  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <div className="modal-video-wrapper">
          <video
            className="modal-video"
            controls
            autoPlay
            playsInline
            preload="auto"
            onPlay={handlePlay}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: liked ? '#e8f5e9' : '#f3f4f6',
                color: liked ? '#2e7d32' : '#6b7280',
                border: liked ? '1px solid #a5d6a7' : '1px solid #e5e7eb',
                borderRadius: '20px', padding: '6px 16px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
              }}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>
                {liked ? 'thumb_up' : 'thumb_up_off_alt'}
              </span>
              {likeCount > 0 ? likeCount : ''} {liked ? 'Liked' : 'Like'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
