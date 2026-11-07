import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Share2,
} from 'lucide-react'
import { ALLOWED_SITES, SITE_CONFIGS, type SiteKey } from '../config/sites'
import { usePublishedContent } from '../content/useContent'
import { isPubliclyVisible, selectContentForSite } from '../content/selectors'
import type { PublishedContentItem } from '../content/contract'
import { getSafeServiceUrl } from '../config/services'
import { resolvePublicAsset } from '../config/env'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Pengumuman Resmi',
  service: 'Panduan Layanan',
  article: 'Kegiatan & Artikel',
  faq: 'Tanya Jawab',
  document: 'Dokumen Resmi',
  media: 'Dokumentasi Visual',
}

function formatCategoryLabel(rawCategory: string): string {
  const key = rawCategory.trim().toLowerCase()
  return CATEGORY_LABELS[key] || rawCategory.toUpperCase()
}

function formatIndonesianDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

function estimateReadingMinutes(item: PublishedContentItem): number {
  const text = `${item.title} ${item.summary} ${item.body || ''}`.trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 160))
}

export function ContentDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const rawSite = searchParams.get('site') || 'sulut'
  const site: SiteKey = (ALLOWED_SITES as readonly string[]).includes(rawSite)
    ? (rawSite as SiteKey)
    : 'sulut'

  const [copied, setCopied] = useState(false)

  const siteConfig = SITE_CONFIGS[site]
  const { data, isLoading, isError } = usePublishedContent()

  const item: PublishedContentItem | undefined = useMemo(() => {
    if (!data?.items || !slug) return undefined
    return data.items.find(
      (entry) => entry.slug === slug && isPubliclyVisible(entry),
    )
  }, [data, slug])

  const relatedItems = useMemo(() => {
    if (!data?.items || !item) return []
    return selectContentForSite(data.items, site)
      .filter((candidate) => candidate.id !== item.id)
      .slice(0, 3)
  }, [data, item, site])

  const ptkUrl = getSafeServiceUrl('ptk', site)
  const waUrl = getSafeServiceUrl('whatsapp', site)

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://bkhit-sulut.karantinaindonesia.go.id/konten/${slug ?? ''}?site=${site}`

  const whatsappShareHref = item
    ? `https://wa.me/?text=${encodeURIComponent(
        `${item.title} - BKHIT Sulawesi Utara\n${shareUrl}`,
      )}`
    : waUrl

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#f8fafc] font-sans text-slate-900">
      {/* Top Navbar in Clean Light Editorial Theme */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={`/?site=${site}`}
            data-testid="back-to-landing"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            <span aria-hidden="true">←</span>
            <span>Kembali ke Gerbang Utama</span>
          </Link>

          <Link
            to={`/informasi?site=${site}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800 transition hover:bg-sky-100 active:scale-95"
          >
            <span>Semua Informasi ({siteConfig.shortLabel})</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {/* Main Editorial Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        {isLoading && (
          <div
            role="status"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-8 w-8 rounded-full border-3 border-sky-600 border-t-transparent animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Memuat rincian informasi dan dokumentasi...
            </p>
          </div>
        )}

        {!isLoading && (isError || !item) && (
          <div
            role="alert"
            data-testid="content-detail-not-found"
            className="rounded-3xl border border-amber-300 bg-amber-50 p-8 sm:p-12 text-center shadow-xs"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-xl">
              !
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Dokumen Tidak Ditemukan atau Belum Dipublikasikan
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 max-w-lg mx-auto">
              Informasi yang Anda tuju mungkin masih dalam tahap draf internal atau telah kedaluwarsa. Layanan operasional karantina tetap berjalan normal.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={ptkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-sky-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-sky-800"
              >
                Buka PTK Online →
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                Tanya via WhatsApp
              </a>
              <Link
                to={`/informasi?site=${site}`}
                className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Lihat Daftar Informasi
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !isError && item && (
          <>
            <article
              data-testid="content-detail-article"
              className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 md:p-10 shadow-sm"
            >
              {/* Top Metadata & Share Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-sky-50 px-2.5 py-1 font-bold uppercase text-sky-800 ring-1 ring-sky-200">
                    {formatCategoryLabel(item.category)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      Cakupan:{' '}
                      {item.siteScope === 'GLOBAL'
                        ? 'Sulawesi Utara'
                        : item.siteScope}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatIndonesianDate(item.updatedAt)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{estimateReadingMinutes(item)} mnt baca</span>
                  </span>
                </div>

                {/* Quick Share Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={whatsappShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="share-whatsapp-btn"
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Bagikan WA</span>
                  </a>

                  <button
                    type="button"
                    data-testid="copy-link-btn"
                    onClick={() => void handleCopyLink()}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Salin Tautan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Headline Title */}
              <h1 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-slate-900 tracking-tight">
                {item.title}
              </h1>

              {/* Editorial Summary Callout Box */}
              <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5 text-xs sm:text-sm font-semibold leading-relaxed text-sky-950">
                {item.summary}
              </div>

              {/* MULTIMEDIA DISPLAY: Video Player or Photo Showcase (SVG Icons, Zero Emoji) */}
              {item.videoUrl && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
                  <video
                    controls
                    preload="metadata"
                    poster={resolvePublicAsset(
                      item.mediaUrl || 'hero/sulut.jpg',
                    )}
                    className="w-full aspect-video object-cover"
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                    Peramban Anda tidak mendukung pemutar video HTML5.
                  </video>
                  <div className="p-3 bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-2 border-t border-slate-200">
                    <Film className="h-4 w-4 text-sky-700 shrink-0" />
                    <span>Video Dokumentasi & Edukasi Karantina</span>
                  </div>
                </div>
              )}

              {item.mediaUrl && !item.videoUrl && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
                  <img
                    src={resolvePublicAsset(item.mediaUrl)}
                    alt={item.title}
                    className="w-full max-h-[480px] object-cover"
                  />
                  <div className="p-3 bg-slate-100 text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <ImageIcon className="h-3.5 w-3.5 text-sky-700" />
                      <span>
                        Dokumentasi Kegiatan Balai Karantina Sulawesi Utara
                      </span>
                    </span>
                    <span className="text-sky-800 font-mono text-[10px] uppercase font-bold">
                      Wilayah: {item.siteScope}
                    </span>
                  </div>
                </div>
              )}

              {/* Body Content */}
              <div className="mt-6 space-y-4 text-xs sm:text-sm md:text-base leading-relaxed text-slate-800 whitespace-pre-line border-t border-slate-100 pt-6">
                {(item.body || item.summary)
                  .split('\n\n')
                  .map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>

              {/* Official PDF Document Attachment (Sanity CMS / Projection) */}
              {item.documentUrl && (
                <div
                  data-testid="content-detail-document"
                  className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white font-black text-xs shadow-xs">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        Lampiran Dokumen Resmi Karantina (PDF)
                      </div>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600">
                        Unduh atau baca dokumen lengkap dalam format PDF resmi BKHIT Sulawesi Utara.
                      </p>
                    </div>
                  </div>
                  <a
                    href={resolvePublicAsset(item.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-sky-800 active:scale-95"
                  >
                    <span>Buka Dokumen PDF</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-700" />
                  <span>Konsultasi Petugas Terkait Informasi Ini (WhatsApp)</span>
                </a>

                <Link
                  to={`/informasi?site=${site}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-sky-800 active:scale-95"
                >
                  <span>Lihat Dokumentasi Lainnya</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            {/* Related Articles Section */}
            {relatedItems.length > 0 && (
              <section
                data-testid="related-articles-section"
                aria-label="Informasi dan Dokumentasi Terkait"
                className="mt-10"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Informasi & Dokumentasi Terkait Lainnya
                  </h2>
                  <Link
                    to={`/informasi?site=${site}`}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedItems.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/konten/${rel.slug}?site=${site}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="font-extrabold uppercase text-sky-700">
                            {formatCategoryLabel(rel.category)}
                          </span>
                          <span>{estimateReadingMinutes(rel)} mnt baca</span>
                        </div>
                        <h3 className="mt-1.5 text-sm font-extrabold text-slate-900 group-hover:text-sky-700 transition line-clamp-2">
                          {rel.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                          {rel.summary}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
                        <span>Baca Selengkapnya</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
