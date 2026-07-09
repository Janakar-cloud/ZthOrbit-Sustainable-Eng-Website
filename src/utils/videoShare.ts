const VIDEO_PARAM = 'v'

export interface VideoSharePayload {
  url: string
  title: string
  text: string
}

export function getVideoShareUrl(videoId: string): string {
  const url = new URL('/videos', window.location.origin)
  url.searchParams.set(VIDEO_PARAM, videoId)
  return url.toString()
}

export function getVideoSharePayload(videoId: string, title: string): VideoSharePayload {
  const url = getVideoShareUrl(videoId)
  return {
    url,
    title,
    text: `Watch "${title}" on The Green TV`,
  }
}

export function getWhatsAppShareUrl(url: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

export function getTwitterShareUrl(url: string, text: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}

export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function shareVideoNative(videoId: string, title: string): Promise<boolean> {
  const { url, text, title: shareTitle } = getVideoSharePayload(videoId, title)

  if (!canUseNativeShare()) {
    return copyVideoShareLink(videoId)
  }

  try {
    await navigator.share({ title: shareTitle, text, url })
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false
    }
    return copyVideoShareLink(videoId)
  }
}

export function openShareWindow(shareUrl: string): void {
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
}

export function getVideoIdFromUrl(search?: string): string | null {
  const params = new URLSearchParams(search ?? window.location.search)
  return params.get(VIDEO_PARAM)
}

export function setVideoShareParam(videoId: string | null): void {
  const url = new URL(window.location.href)

  if (videoId) {
    url.pathname = '/videos'
    url.searchParams.set(VIDEO_PARAM, videoId)
  } else {
    url.searchParams.delete(VIDEO_PARAM)
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}`)
}

export async function copyVideoShareLink(videoId: string): Promise<boolean> {
  const link = getVideoShareUrl(videoId)

  try {
    await navigator.clipboard.writeText(link)
    return true
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = link
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(textarea)
      return copied
    } catch {
      return false
    }
  }
}
