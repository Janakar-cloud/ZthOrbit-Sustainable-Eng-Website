import { Video } from '../pages/HomePage/type/type'
import { canonicalizeCategoryNames } from './category'

export function mapApiItemToVideo(
  item: object,
  sharedCategories: Array<{ name: string }> = []
): Video {
  const data = item as Record<string, unknown>
  const categoryNames = canonicalizeCategoryNames(
    [
      data.category as string | undefined,
      ...(Array.isArray(data.categories) ? (data.categories as string[]) : []),
      ...(Array.isArray(data.tags)
        ? (data.tags as Array<{ kind?: string; name?: string }>)
            .filter((tag) => tag?.kind === 'category')
            .map((tag) => tag?.name)
        : []),
    ],
    sharedCategories
  )

  const id = data._id ?? data.id
  const publishDateRaw = (data.publishDate ?? data.createdAt) as string | undefined
  const streamUrl =
    (data.streamUrl as string) ||
    (data.fileUrl as string) ||
    (data.hlsUrl as string) ||
    (data.url as string) ||
    ''

  return {
    id: String(id),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    videoId: String(data.videoId ?? ''),
    streamUrl,
    category: categoryNames[0] || '',
    categories: categoryNames,
    isLive: Boolean(data.isLive),
    publishDate: publishDateRaw
      ? new Date(publishDateRaw).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '',
    thumbnail: String(data.thumbnailUrl ?? data.thumbnail ?? ''),
  }
}
