import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { SiteKey } from '../config/sites'
import { SITE_CONFIGS } from '../config/sites'
import type { PublishedContentItem } from '../content/contract'
import { selectContentForSite } from '../content/selectors'
import { trackEvent, type EntrySource } from '../analytics/track'

interface ContentCenterModalProps {
  isOpen: boolean
  onClose: () => void
  site: SiteKey
  entrySource?: EntrySource
  items: PublishedContentItem[]
  isLoading?: boolean
  isError?: boolean
  onRefetch?: () => void
  initialSelectedItem?: PublishedContentItem | null
  infoUrl?: string
}

type FilterCategory = 'all' | 'service' | 'announcement' | 'education'

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

export function ContentCenterModal({
  isOpen,
  onClose,
  site,
  entrySource = 'direct',
  items,
  isLoading = false,
  isError = false,
  onRefetch,
  initialSelectedItem = null,
  infoUrl = 'https://karantinaindonesia.go.id/',
}: ContentCenterModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
  const [readingItem, setReadingItem] = useState<PublishedContentItem | null>(
    initialSelectedItem,
  )
  const [copied, setCopied] = useState(false)

  const siteConfig = useMemo(() => SITE_CONFIGS[site], [site])

  // Select site-scoped published items (prioritizes local island, falls back to GLOBAL)
  const siteScopedItems = useMemo(
    () => selectContentForSite(items, site),
    [items, site],
  )

  // Filter items by category tab
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return siteScopedItems

    return siteScopedItems.filter((item) => {
      if (selectedCategory === 'service') {
        return item.category === 'service' || item.contentType === 'service'
      }
      if (selectedCategory === 'announcement') {
        return (
          item.category === 'announcement' ||
          item.contentType === 'announcement'
        )
      }
      if (selectedCategory === 'education') {
        return (
          item.category === 'faq' ||
          item.category === 'article' ||
          item.category === 'document' ||
          item.contentType === 'faq' ||
          item.contentType === 'article' ||
          item.contentType === 'document'
        )
      }
      return true
    })
  }, [siteScopedItems, selectedCategory])

  // Sync initialSelectedItem when changed
  useEffect(() => {
    if (initialSelectedItem) {
      setReadingItem(initialSelectedItem)
    }
  }, [initialSelectedItem])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (readingItem) {
          setReadingItem(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, readingItem, onClose])

  if (!isOpen) return null

  const handleReadArticle = (item: PublishedContentItem) => {
    setReadingItem(item)
    trackEvent({
      event_name: 'content_view',
      site_context: site,
      entry_source: entrySource,
      target: item.slug,
      content_id: item.id,
    })
  }

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/?site=${site}&konten=${slug}`
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-content-center-title"
      data-testid="content-center-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-xs"
    >
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-sky-300/40 bg-[#071e32] text-white shadow-2xl">
        {/* Header Dialog */}
        <div className="flex items-start justify-between gap-3 border-b border-white/15 p-4 sm:p-6 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-400 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950 uppercase tracking-wider">
                PPID & Kehumasan
              </span>
              <span className="text-xs font-semibold text-cyan-200">
                {siteConfig.label}
              </span>
            </div>
            <h2
              id="modal-content-center-title"
              className="mt-1.5 text-lg font-extrabold tracking-tight text-white sm:text-2xl"
            >
              Pusat Informasi & Sosialisasi Karantina
            </h2>
            <p className="mt-0.5 text-xs text-cyan-100/80">
              Pengumuman resmi, panduan permohonan layanan, dan edukasi karantina
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="close-content-center-modal"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 active:scale-95 focus-visible:outline-none"
            aria-label="Tutup pusat informasi"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Container with Smooth Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {readingItem ? (
              /* IN-PLACE ARTICLE READER */
              <motion.article
                key={readingItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                data-testid="content-detail-article"
                className="space-y-4"
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setReadingItem(null)
                    if (initialSelectedItem) {
                      onClose()
                    }
                  }}
                  data-testid="back-to-landing"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
                >
                  <span>←</span>
                  <span>
                    {initialSelectedItem
                      ? 'Tutup Ringkasan (Esc)'
                      : 'Kembali ke Daftar Informasi'}
                  </span>
                </button>

                {/* Article Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-sky-950 px-2 py-0.5 font-bold uppercase text-sky-200 ring-1 ring-sky-400/30">
                    {readingItem.category.toUpperCase()}
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 font-medium text-white/90">
                    Cakupan: {readingItem.siteScope}
                  </span>
                  <span className="font-mono text-cyan-200/80">
                    {formatIndonesianDate(readingItem.updatedAt)}
                  </span>
                </div>

                {/* Article Title */}
                <h3
                  data-testid="reader-article-title"
                  className="text-lg font-extrabold leading-snug text-white sm:text-2xl"
                >
                  {readingItem.title}
                </h3>

                {/* Summary Box */}
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-950/40 p-4 text-xs sm:text-sm font-medium leading-relaxed text-cyan-100">
                  {readingItem.summary}
                </div>

                {/* Full Body Text */}
                {readingItem.body && (
                  <div
                    data-testid="reader-article-body"
                    className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-100 whitespace-pre-line"
                  >
                    {readingItem.body}
                  </div>
                )}

                {/* Reader Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(readingItem.slug)}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
                  >
                    <span>{copied ? '✓ Tautan Tersalin' : 'Salin Tautan'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingItem(null)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-xs font-bold text-white transition hover:border-sky-300 active:scale-95"
                  >
                    Tutup Pembaca
                  </button>
                </div>
              </motion.article>
            ) : (
              /* CONTENT LIST VIEW WITH CATEGORY TABS */
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Category Filter Tabs */}
                <div
                  role="tablist"
                  aria-label="Filter kategori konten"
                  className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap"
                >
                  {[
                    { key: 'all', label: 'Semua Rilis' },
                    { key: 'service', label: 'Panduan Layanan' },
                    { key: 'announcement', label: 'Pengumuman Pos' },
                    { key: 'education', label: 'Edukasi & Regulasi' },
                  ].map((tab) => {
                    const active = selectedCategory === tab.key
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        data-testid={`filter-tab-${tab.key}`}
                        onClick={() => setSelectedCategory(tab.key as FilterCategory)}
                        className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                          active
                            ? 'bg-cyan-400 text-slate-950 shadow-md ring-2 ring-cyan-300'
                            : 'border border-white/15 bg-white/5 text-white/90 hover:bg-white/15 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div
                    role="status"
                    data-testid="content-center-loading"
                    className="flex flex-col items-center justify-center py-12 text-center text-sm font-semibold text-cyan-200"
                  >
                    <span className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-2" />
                    <span>Memuat informasi resmi karantina...</span>
                  </div>
                )}

                {/* Error State */}
                {!isLoading && isError && (
                  <div
                    role="alert"
                    data-testid="content-center-error"
                    className="rounded-2xl border border-amber-400/40 bg-[#2b1718] p-5 text-center text-xs text-white"
                  >
                    <p className="font-bold text-amber-200">
                      Gagal memuat feed informasi karantina.
                    </p>
                    <p className="mt-1 text-white/80">
                      Layanan PTK Online dan WhatsApp tetap dapat diakses normal.
                    </p>
                    {onRefetch && (
                      <button
                        type="button"
                        onClick={onRefetch}
                        className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-400 px-4 py-2 font-extrabold text-slate-950"
                      >
                        Muat Ulang
                      </button>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredItems.length === 0 && (
                  <div
                    data-testid="content-center-empty"
                    className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-xs text-slate-300"
                  >
                    <p className="font-bold text-white text-sm">
                      Belum ada rilis untuk kategori ini.
                    </p>
                    <p className="mt-1">
                      Silakan pilih kategori lain atau periksa kembali rilis umum.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-cyan-300/50 bg-cyan-950 px-4 py-2 font-bold text-cyan-200 hover:bg-cyan-900"
                    >
                      Lihat Semua Informasi
                    </button>
                  </div>
                )}

                {/* Ready Items Grid */}
                {!isLoading && !isError && filteredItems.length > 0 && (
                  <div
                    data-testid="content-center-items-list"
                    className="space-y-3"
                  >
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        data-testid={`content-item-${item.slug}`}
                        data-scope={item.siteScope}
                        className="group flex flex-col justify-between gap-3 rounded-2xl border border-white/15 bg-[#051728]/80 p-4 transition hover:border-cyan-300 hover:bg-[#072138] sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="rounded-md bg-cyan-950 px-2 py-0.5 font-bold uppercase text-cyan-300 ring-1 ring-cyan-400/25">
                              {item.category}
                            </span>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 font-semibold text-slate-200">
                              {item.siteScope === 'GLOBAL' ? 'Sulawesi Utara' : item.siteScope}
                            </span>
                            <span className="font-mono text-cyan-200/70">
                              {formatIndonesianDate(item.updatedAt)}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold leading-snug text-white group-hover:text-cyan-200 transition">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-200/90 leading-relaxed line-clamp-2">
                            {item.summary}
                          </p>
                        </div>

                        <div className="shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleReadArticle(item)}
                            data-testid={`read-article-btn-${item.slug}`}
                            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-extrabold text-slate-950 shadow transition hover:bg-cyan-300 active:scale-95"
                          >
                            <span>Baca Lengkap</span>
                            <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/15 bg-[#051728]/95 p-4 sm:p-5">
          <a
            href={infoUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="external-ppid-portal-link"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/60 px-4 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-900 active:scale-95 text-center"
          >
            <span>Kunjungi Portal Resmi PPID Barantin</span>
            <span aria-hidden="true">↗</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/30 px-5 py-2 text-xs font-bold text-white transition hover:border-cyan-300 active:scale-95"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  )
}
