import { useState } from 'react'
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import {
  canUseNativeShare,
  copyVideoShareLink,
  getFacebookShareUrl,
  getLinkedInShareUrl,
  getTwitterShareUrl,
  getVideoSharePayload,
  getWhatsAppShareUrl,
  openShareWindow,
  shareVideoNative,
} from '../utils/videoShare'
import './VideoShareControls.css'

interface VideoShareControlsProps {
  videoId: string
  title?: string
}

export default function VideoShareControls({
  videoId,
  title = 'video',
}: VideoShareControlsProps) {
  const [copied, setCopied] = useState(false)
  const sharePayload = getVideoSharePayload(videoId, title)
  const showNativeShare = canUseNativeShare()

  const handleCopyLink = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const success = await copyVideoShareLink(videoId)
    if (!success) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await shareVideoNative(videoId, title)
  }

  const handleSocialShare = (event: React.MouseEvent, shareUrl: string) => {
    event.stopPropagation()
    openShareWindow(shareUrl)
  }

  return (
    <div className="video-share-controls" onClick={(event) => event.stopPropagation()}>
      <span className="video-share-controls__label">Share</span>
      <div className="video-share-controls__buttons">
        {showNativeShare && (
          <button
            type="button"
            className="video-share-controls__btn video-share-controls__btn--native"
            onClick={handleNativeShare}
            title="Share via device"
            aria-label={`Share ${title} using your device`}
          >
            <span className="material-icons">ios_share</span>
          </button>
        )}

        <button
          type="button"
          className="video-share-controls__btn video-share-controls__btn--whatsapp"
          onClick={(event) =>
            handleSocialShare(event, getWhatsAppShareUrl(sharePayload.url, sharePayload.text))
          }
          title="Share on WhatsApp"
          aria-label={`Share ${title} on WhatsApp`}
        >
          <FaWhatsapp />
        </button>

        <button
          type="button"
          className="video-share-controls__btn video-share-controls__btn--facebook"
          onClick={(event) => handleSocialShare(event, getFacebookShareUrl(sharePayload.url))}
          title="Share on Facebook"
          aria-label={`Share ${title} on Facebook`}
        >
          <FaFacebook />
        </button>

        <button
          type="button"
          className="video-share-controls__btn video-share-controls__btn--twitter"
          onClick={(event) =>
            handleSocialShare(event, getTwitterShareUrl(sharePayload.url, sharePayload.text))
          }
          title="Share on X"
          aria-label={`Share ${title} on X`}
        >
          <FaTwitter />
        </button>

        <button
          type="button"
          className="video-share-controls__btn video-share-controls__btn--linkedin"
          onClick={(event) => handleSocialShare(event, getLinkedInShareUrl(sharePayload.url))}
          title="Share on LinkedIn"
          aria-label={`Share ${title} on LinkedIn`}
        >
          <FaLinkedin />
        </button>

        <button
          type="button"
          className={`video-share-controls__btn video-share-controls__btn--copy${copied ? ' is-copied' : ''}`}
          onClick={handleCopyLink}
          title={copied ? 'Link copied!' : 'Copy link'}
          aria-label={`Copy link to ${title}`}
        >
          <span className="material-icons">{copied ? 'check' : 'link'}</span>
        </button>
      </div>
    </div>
  )
}
