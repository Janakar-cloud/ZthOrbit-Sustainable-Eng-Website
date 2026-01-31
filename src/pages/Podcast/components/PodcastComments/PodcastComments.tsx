import { PodcastCommentsProps } from '../../type/type'
import './PodcastComments.css'

export default function PodcastComments({
  podcast,
  isAdmin,
  newComment,
  onChangeComment,
  onAddComment,
  onToggleComments
}: PodcastCommentsProps) {
  return (
    <>
      {/* Header */}
      <div className="modal-header">
        <div className="modal-icon">
          <span className="material-icons">podcasts</span>
        </div>
        <div className="modal-info">
          <h2 className="modal-title">{podcast.title}</h2>
          <div className="modal-meta">
            <span className="modal-category">{podcast.category}</span>
            <span className="modal-duration">{podcast.duration}</span>
            <span className="modal-date">{podcast.publishDate}</span>
          </div>
        </div>
      </div>

      <p className="modal-description">{podcast.description}</p>

      {/* Audio */}
      <div className="audio-player">
        <audio controls autoPlay className="audio-element">
          <source src={podcast.audioFile} type="audio/mp4" />
        </audio>
      </div>

      {/* Comments */}
      {podcast.commentsEnabled ? (
        <div className="comments-section">
          <div className="comments-header">
            <h3 className="comments-title">
              <span className="material-icons">comment</span>
              Comments ({podcast.comments.length})
            </h3>

            {isAdmin && (
              <button
                className="disable-comments-btn"
                onClick={() => onToggleComments(podcast.id)}
              >
                <span className="material-icons">comments_disabled</span>
                <span>Disable Comments</span>
              </button>
            )}
          </div>

          {/* Add comment */}
          <div className="add-comment">
            <div className="comment-avatar">
              <span className="material-icons">account_circle</span>
            </div>

            <div className="comment-input-wrapper">
              <textarea
                className="comment-input"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => onChangeComment(e.target.value)}
                rows={3}
              />

              <button
                className="submit-comment-btn"
                onClick={onAddComment}
                disabled={!newComment.trim()}
              >
                <span className="material-icons">send</span>
                <span>Post Comment</span>
              </button>
            </div>
          </div>

          {/* Comments list */}
          <div className="comments-list">
            {podcast.comments.length === 0 ? (
              <div className="no-comments">
                <span className="material-icons">chat_bubble_outline</span>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              podcast.comments.map((comment: any) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    <span className="material-icons">{comment.avatar}</span>
                  </div>

                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-timestamp">{comment.timestamp}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="comments-disabled">
          <span className="material-icons">comments_disabled</span>
          <p>Comments are disabled for this episode</p>

          {isAdmin && (
            <button
              className="enable-comments-btn"
              onClick={() => onToggleComments(podcast.id)}
            >
              <span className="material-icons">comment</span>
              <span>Enable Comments</span>
            </button>
          )}
        </div>
      )}
    </>
  )
}
