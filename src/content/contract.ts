export type ContentSiteScope = 'GLOBAL' | 'SIAU' | 'TAHUNA' | 'MELONGUANE'

export type ContentType =
  | 'article'
  | 'announcement'
  | 'faq'
  | 'service'
  | 'document'
  | 'media'

export type ContentStatus =
  | 'DRAFT'
  | 'VALIDATION'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'

export type PublishedContentItem = {
  id: string
  slug: string
  title: string
  summary: string
  body?: string
  category: string
  siteScope: ContentSiteScope
  contentType: ContentType
  status: ContentStatus
  mediaUrl: string | null
  videoUrl?: string | null
  publishAt?: string | null
  expireAt?: string | null
  updatedAt: string
  sortOrder?: number
}

export type PublishedProjection = {
  generatedAt: string
  items: PublishedContentItem[]
}

const VALID_SCOPES: readonly ContentSiteScope[] = [
  'GLOBAL',
  'SIAU',
  'TAHUNA',
  'MELONGUANE',
]

const VALID_TYPES: readonly ContentType[] = [
  'article',
  'announcement',
  'faq',
  'service',
  'document',
  'media',
]

function normalizeScope(raw: unknown): ContentSiteScope {
  if (typeof raw === 'string') {
    const upper = raw.trim().toUpperCase()
    if ((VALID_SCOPES as readonly string[]).includes(upper)) {
      return upper as ContentSiteScope
    }
  }
  return 'GLOBAL'
}

function normalizeType(raw: unknown, fallbackCategory: string): ContentType {
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase()
    if ((VALID_TYPES as readonly string[]).includes(lower)) {
      return lower as ContentType
    }
  }
  const catLower = fallbackCategory.toLowerCase()
  if ((VALID_TYPES as readonly string[]).includes(catLower)) {
    return catLower as ContentType
  }
  return 'article'
}

// Malformed records are skipped so a single bad entry never crashes the Portal (FR-014).
export function parsePublishedProjection(raw: unknown): PublishedProjection {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid content projection payload')
  }

  const record = raw as Record<string, unknown>
  const rawItems = Array.isArray(record.items) ? record.items : []

  const items: PublishedContentItem[] = []

  for (const entry of rawItems) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as Record<string, unknown>

    const id = typeof item.id === 'string' ? item.id.trim() : ''
    const slug = typeof item.slug === 'string' ? item.slug.trim() : ''
    const title = typeof item.title === 'string' ? item.title.trim() : ''
    const summary = typeof item.summary === 'string' ? item.summary.trim() : ''
    const status =
      typeof item.status === 'string'
        ? (item.status.trim().toUpperCase() as ContentStatus)
        : 'DRAFT'

    if (!id || !slug || !title) continue

    const category =
      typeof item.category === 'string' && item.category.trim()
        ? item.category.trim().toLowerCase()
        : 'article'

    const siteScope = normalizeScope(item.siteScope ?? item.site_scope)
    const contentType = normalizeType(
      item.contentType ?? item.content_type,
      category,
    )

    items.push({
      id,
      slug,
      title,
      summary,
      body: typeof item.body === 'string' ? item.body : summary,
      category,
      siteScope,
      contentType,
      status,
      mediaUrl:
        typeof item.mediaUrl === 'string'
          ? item.mediaUrl
          : typeof item.media_url === 'string'
            ? item.media_url
            : null,
      videoUrl:
        typeof item.videoUrl === 'string'
          ? item.videoUrl
          : typeof item.video_url === 'string'
            ? item.video_url
            : null,
      publishAt:
        typeof item.publishAt === 'string'
          ? item.publishAt
          : typeof item.publish_at === 'string'
            ? item.publish_at
            : null,
      expireAt:
        typeof item.expireAt === 'string'
          ? item.expireAt
          : typeof item.expire_at === 'string'
            ? item.expire_at
            : null,
      updatedAt:
        typeof item.updatedAt === 'string'
          ? item.updatedAt
          : typeof item.updated_at === 'string'
            ? item.updated_at
            : new Date(0).toISOString(),
      sortOrder:
        typeof item.sortOrder === 'number'
          ? item.sortOrder
          : typeof item.sort_order === 'number'
            ? item.sort_order
            : 50,
    })
  }

  return {
    generatedAt:
      typeof record.generatedAt === 'string'
        ? record.generatedAt
        : new Date().toISOString(),
    items,
  }
}
