import {
  parsePublishedProjection,
  type PublishedProjection,
} from './contract'

export interface SanityConfig {
  projectId: string
  dataset: string
  apiVersion: string
}

// GROQ query deterministik: hanya dokumen yang sudah di-Publish (bukan drafts.*)
// dan langsung memetakan URL CDN untuk Foto (Auto-WebP), Video (.mp4), serta Dokumen (.pdf)
export const SANITY_PUBLISHED_GROQ_QUERY = `*[_type == "karantinaContent" && !(_id in path("drafts.**")) && coalesce(status, "PUBLISHED") == "PUBLISHED" && (!defined(expireAt) || expireAt > now())] | order(coalesce(sortOrder, 50) asc, coalesce(publishAt, _updatedAt) desc) {
  "id": _id,
  "slug": coalesce(slug.current, slug),
  title,
  summary,
  body,
  "category": coalesce(category, "announcement"),
  "siteScope": coalesce(siteScope, "GLOBAL"),
  "contentType": coalesce(contentType, category, "article"),
  "status": coalesce(status, "PUBLISHED"),
  "mediaUrl": coalesce(mediaImage.asset->url + "?auto=format&fit=max&w=1200&q=80", mediaUrl),
  "videoUrl": coalesce(videoFile.asset->url, videoUrl),
  "documentUrl": coalesce(documentFile.asset->url, documentUrl),
  "publishAt": coalesce(publishAt, _createdAt),
  expireAt,
  "updatedAt": coalesce(updatedAt, _updatedAt),
  "sortOrder": coalesce(sortOrder, 50)
}`

const SAFE_PROJECT_ID_REGEX = /^[a-z0-9-]+$/
const SAFE_DATASET_REGEX = /^[a-z0-9_-]+$/

export function isSanityConfigured(projectId?: string): boolean {
  if (!projectId) return false
  const clean = projectId.trim()
  return clean.length > 0 && SAFE_PROJECT_ID_REGEX.test(clean)
}

export function buildSanityCdnQueryUrl(config: SanityConfig): string {
  const projectId = config.projectId.trim()
  const dataset = config.dataset.trim() || 'production'
  const apiVersion = (config.apiVersion.trim() || '2025-02-01').replace(
    /^v/i,
    '',
  )

  if (!SAFE_PROJECT_ID_REGEX.test(projectId)) {
    throw new Error('Konfigurasi VITE_SANITY_PROJECT_ID tidak valid')
  }
  if (!SAFE_DATASET_REGEX.test(dataset)) {
    throw new Error('Konfigurasi VITE_SANITY_DATASET tidak valid')
  }

  const encodedQuery = encodeURIComponent(SANITY_PUBLISHED_GROQ_QUERY)
  return `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`
}

// Sanitasi berlapis (Defense-in-Depth UAT-11): memastikan dokumen draft tidak pernah lolos ke UI publik
export function transformSanityResponseToProjection(
  rawResponse: unknown,
): PublishedProjection {
  if (!rawResponse || typeof rawResponse !== 'object') {
    throw new Error('Respons Sanity CMS tidak valid')
  }

  const payload = rawResponse as Record<string, unknown>

  // Jika input sudah berbentuk PublishedProjection (memiliki array items), tetap saring draftnya
  const rawList = Array.isArray(payload.result)
    ? payload.result
    : Array.isArray(payload.items)
      ? payload.items
      : null

  if (!rawList) {
    throw new Error('Format daftar konten Sanity tidak ditemukan')
  }

  const sanitizedItems = rawList
    .filter((entry): entry is Record<string, unknown> => {
      if (!entry || typeof entry !== 'object') return false
      const item = entry as Record<string, unknown>
      const rawId = String(item.id ?? item._id ?? '').trim()
      // Blokir semua dokumen dengan prefix internal Sanity 'drafts.'
      if (!rawId || rawId.startsWith('drafts.')) return false

      const rawStatus = String(item.status ?? 'PUBLISHED')
        .trim()
        .toUpperCase()
      if (rawStatus !== 'PUBLISHED') return false

      return true
    })
    .map((item) => {
      const rawSlug = item.slug
      const normalizedSlug =
        typeof rawSlug === 'string'
          ? rawSlug
          : rawSlug &&
              typeof rawSlug === 'object' &&
              typeof (rawSlug as Record<string, unknown>).current === 'string'
            ? String((rawSlug as Record<string, unknown>).current)
            : ''

      const mediaAssetUrl = extractNestedAssetUrl(item.mediaImage)
      const videoAssetUrl = extractNestedAssetUrl(item.videoFile)
      const docAssetUrl = extractNestedAssetUrl(item.documentFile)

      return {
        id: String(item.id ?? item._id ?? '').trim(),
        slug: normalizedSlug.trim(),
        title: String(item.title ?? '').trim(),
        summary: String(item.summary ?? '').trim(),
        body:
          typeof item.body === 'string' && item.body.trim()
            ? item.body
            : String(item.summary ?? '').trim(),
        category: String(item.category ?? 'announcement')
          .trim()
          .toLowerCase(),
        siteScope: item.siteScope ?? item.site_scope ?? 'GLOBAL',
        contentType:
          item.contentType ?? item.content_type ?? item.category ?? 'article',
        status: 'PUBLISHED',
        mediaUrl:
          typeof item.mediaUrl === 'string' && item.mediaUrl.trim()
            ? item.mediaUrl.trim()
            : mediaAssetUrl
              ? `${mediaAssetUrl}?auto=format&fit=max&w=1200&q=80`
              : null,
        videoUrl:
          typeof item.videoUrl === 'string' && item.videoUrl.trim()
            ? item.videoUrl.trim()
            : videoAssetUrl,
        documentUrl:
          typeof item.documentUrl === 'string' && item.documentUrl.trim()
            ? item.documentUrl.trim()
            : docAssetUrl,
        publishAt:
          typeof item.publishAt === 'string'
            ? item.publishAt
            : typeof item._createdAt === 'string'
              ? item._createdAt
              : null,
        expireAt: typeof item.expireAt === 'string' ? item.expireAt : null,
        updatedAt:
          typeof item.updatedAt === 'string'
            ? item.updatedAt
            : typeof item._updatedAt === 'string'
              ? item._updatedAt
              : new Date().toISOString(),
        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 50,
      }
    })

  return parsePublishedProjection({
    generatedAt: new Date().toISOString(),
    items: sanitizedItems,
  })
}

function extractNestedAssetUrl(field: unknown): string | null {
  if (!field || typeof field !== 'object') return null
  const record = field as Record<string, unknown>
  if (typeof record.url === 'string' && record.url.trim()) {
    return record.url.trim()
  }
  if (record.asset && typeof record.asset === 'object') {
    const asset = record.asset as Record<string, unknown>
    if (typeof asset.url === 'string' && asset.url.trim()) {
      return asset.url.trim()
    }
  }
  return null
}

