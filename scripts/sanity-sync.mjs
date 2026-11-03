#!/usr/bin/env node
/**
 * Script CLI Sinkronisasi & Verifikasi Konten Sanity.io CMS (Phase 4B)
 *
 * Penggunaan:
 *   node scripts/sanity-sync.mjs --mock
 *   node scripts/sanity-sync.mjs --project-id=<id> --dataset=production --out=public/content/projection.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const isMock = args.includes('--mock')
const outArg = args.find((a) => a.startsWith('--out='))
const outFile = outArg ? path.resolve(ROOT_DIR, outArg.slice('--out='.length)) : null

const GROQ_QUERY = `*[_type == "karantinaContent" && !(_id in path("drafts.**")) && coalesce(status, "PUBLISHED") == "PUBLISHED" && (!defined(expireAt) || expireAt > now())] | order(coalesce(sortOrder, 50) asc, coalesce(publishAt, _updatedAt) desc) {
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

function extractNestedAssetUrl(field) {
  if (!field || typeof field !== 'object') return null
  if (typeof field.url === 'string' && field.url.trim()) return field.url.trim()
  if (field.asset && typeof field.asset === 'object' && typeof field.asset.url === 'string') {
    return field.asset.url.trim()
  }
  return null
}

function transformSanityPayload(rawResponse) {
  const rawList = Array.isArray(rawResponse?.result) ? rawResponse.result : []
  const items = []

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue
    const id = String(item.id ?? item._id ?? '').trim()
    // Proteksi UAT-11 / FR-012: blokir dokumen drafts.* dan non-PUBLISHED
    if (!id || id.startsWith('drafts.')) continue

    const status = String(item.status ?? 'PUBLISHED').trim().toUpperCase()
    if (status !== 'PUBLISHED') continue

    const slug =
      typeof item.slug === 'string'
        ? item.slug.trim()
        : typeof item.slug?.current === 'string'
          ? item.slug.current.trim()
          : ''
    const title = String(item.title ?? '').trim()
    const summary = String(item.summary ?? '').trim()

    if (!slug || !title) continue

    const mediaAsset = extractNestedAssetUrl(item.mediaImage)
    const videoAsset = extractNestedAssetUrl(item.videoFile)
    const docAsset = extractNestedAssetUrl(item.documentFile)

    items.push({
      id,
      slug,
      title,
      summary,
      body: typeof item.body === 'string' && item.body.trim() ? item.body : summary,
      category: String(item.category ?? 'announcement').trim().toLowerCase(),
      siteScope: String(item.siteScope ?? 'GLOBAL').trim().toUpperCase(),
      contentType: String(item.contentType ?? item.category ?? 'article').trim().toLowerCase(),
      status: 'PUBLISHED',
      mediaUrl:
        typeof item.mediaUrl === 'string' && item.mediaUrl.trim()
          ? item.mediaUrl.trim()
          : mediaAsset
            ? `${mediaAsset}?auto=format&fit=max&w=1200&q=80`
            : null,
      videoUrl:
        typeof item.videoUrl === 'string' && item.videoUrl.trim()
          ? item.videoUrl.trim()
          : videoAsset,
      documentUrl:
        typeof item.documentUrl === 'string' && item.documentUrl.trim()
          ? item.documentUrl.trim()
          : docAsset,
      publishAt: item.publishAt ?? item._createdAt ?? null,
      expireAt: item.expireAt ?? null,
      updatedAt: item.updatedAt ?? item._updatedAt ?? new Date().toISOString(),
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 50,
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    items,
  }
}

async function run() {
  let rawPayload
  if (isMock) {
    const mockPath = path.resolve(__dirname, 'mock-sanity-response.json')
    rawPayload = JSON.parse(fs.readFileSync(mockPath, 'utf8'))
    console.log('[Sanity Sync] Menjalankan mode simulasi (--mock) dari scripts/mock-sanity-response.json...')
  } else {
    const projectId = process.env.VITE_SANITY_PROJECT_ID || ''
    const dataset = process.env.VITE_SANITY_DATASET || 'production'
    const apiVersion = (process.env.VITE_SANITY_API_VERSION || '2025-02-01').replace(/^v/i, '')

    if (!projectId) {
      console.error('Error: VITE_SANITY_PROJECT_ID belum diatur. Gunakan flag --mock untuk pengujian simulasi.')
      process.exit(1)
    }

    const url = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(GROQ_QUERY)}`
    console.log(`[Sanity Sync] Mengambil konten publik dari Sanity Edge CDN (${projectId}/${dataset})...`)
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} dari Sanity API`)
    }
    rawPayload = await res.json()
  }

  const projection = transformSanityPayload(rawPayload)

  // Verifikasi Otomatis Keamanan Draft (UAT-11)
  const leakedDraft = projection.items.find(
    (item) => item.id.startsWith('drafts.') || item.status !== 'PUBLISHED',
  )
  if (leakedDraft) {
    console.error('[FATAL] Kebocoran dokumen DRAFT terdeteksi:', leakedDraft.id)
    process.exit(1)
  }

  console.log(`[Sanity Sync] Berhasil memproses ${projection.items.length} konten PUBLISHED (seluruh item DRAFT/VALIDATION berhasil diblokir).`)
  for (const item of projection.items) {
    console.log(
      `  - [${item.siteScope}] ${item.slug} | Foto: ${item.mediaUrl ? 'Ya' : 'Tidak'} | Video: ${item.videoUrl ? 'Ya' : 'Tidak'} | PDF: ${item.documentUrl ? 'Ya' : 'Tidak'}`,
    )
  }

  if (outFile) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, JSON.stringify(projection, null, 2), 'utf8')
    console.log(`[Sanity Sync] File proyeksi disimpan ke: ${outFile}`)
  }
}

run().catch((err) => {
  console.error('[Sanity Sync] Gagal:', err.message)
  process.exit(1)
})

