import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Clock,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { SITE_CONFIGS, type SiteKey, ALLOWED_SITES } from '../config/sites'
import { usePublishedContent } from '../content/useContent'
import { selectContentForSite } from '../content/selectors'
import type { PublishedContentItem } from '../content/contract'
import { getSafeServiceUrl } from '../config/services'
import { resolvePublicAsset } from '../config/env'

type FilterTabId = 'all' | 'announcement' | 'service' | 'article' | 'faq' | 'video'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Pengumuman',
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

export function InformationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawSite = searchParams.get('site') || 'sulut'
  const site: SiteKey = (ALLOWED_SITES as readonly string[]).includes(rawSite)
    ? (rawSite as SiteKey)
    : 'sulut'

  const [activeTab, setActiveTab] = useState<FilterTabId>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const siteConfig = useMemo(() => SITE_CONFIGS[site], [site])
  const { data, isLoading, isError, refetch } = usePublishedContent()

  const waUrl = getSafeServiceUrl('whatsapp', site)
  const ptkUrl = getSafeServiceUrl('ptk', site)

  const handleSiteChange = (nextSite: SiteKey) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('site', nextSite)
    setSearchParams(nextParams)
  }

  // Filter items scoped to this island, with fallback to global
  const siteScopedItems = useMemo(() => {
    const allItems = data?.items ?? []
    return selectContentForSite(allItems, site)
  }, [data, site])

  // Filter counts per category tab
  const tabCounts = useMemo(() => {
    return {
      all: siteScopedItems.length,
      announcement: siteScopedItems.filter((i) => i.category === 'announcement')
        .length,
      service: siteScopedItems.filter((i) => i.category === 'service').length,
      article: siteScopedItems.filter((i) => i.category === 'article').length,
      faq: siteScopedItems.filter((i) => i.category === 'faq').length,
      video: siteScopedItems.filter((i) => Boolean(i.videoUrl)).length,
    }
  }, [siteScopedItems])

  // Items filtered by active category tab and search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return siteScopedItems.filter((item) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'video'
            ? Boolean(item.videoUrl)
            : item.category === activeTab

      if (!matchesTab) return false
      if (!q) return true

      const tokens = q.split(/\s+/).filter(Boolean)
      const haystack =
        `${item.title} ${item.slug} ${item.slug.replace(/-/g, ' ')} ${item.summary} ${item.body || ''} ${item.category} ${item.siteScope}`.toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
  }, [siteScopedItems, activeTab, searchQuery])

  const filterTabs: { id: FilterTabId; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Informasi', count: tabCounts.all },
    { id: 'announcement', label: 'Pengumuman', count: tabCounts.announcement },
    { id: 'service', label: 'Panduan Layanan', count: tabCounts.service },
    { id: 'article', label: 'Kegiatan & Artikel', count: tabCounts.article },
    { id: 'faq', label: 'Tanya Jawab', count: tabCounts.faq },
    { id: 'video', label: 'Galeri Video', count: tabCounts.video },
  ]

  const isFilteringActive = activeTab !== 'all' || searchQuery.trim().length > 0

  return (
    <div
      data-testid="information-page"
      className="min-h-dvh bg-[#f8fafc] font-sans text-slate-900"
    >
      {/* 1. Sticky Editorial Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={`/?site=${site}`}
            className="group flex items-center gap-3"
            aria-label="Kembali ke Beranda Gate"
          >
            <img
              src={resolvePublicAsset('assets/logo-bkhit.png')}
              alt="Logo BKHIT"
              className="h-9 w-9 shrink-0 rounded-full bg-white p-0.5 ring-1 ring-slate-200 object-contain sm:h-10 sm:w-10"
            />
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wider text-slate-900 uppercase leading-tight">
                BALAI KARANTINA SULAWESI UTARA
              </div>
              <div className="text-[11px] font-bold text-sky-700">
                Pusat Informasi, Edukasi & Sosialisasi Publik
              </div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* In-Page Quick Location Switcher */}
            <div
              role="group"
              aria-label="Pilih Wilayah Layanan"
              className="hidden md:inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1"
            >
              {ALLOWED_SITES.map((siteKey) => {
                const active = siteKey === site
                const cfg = SITE_CONFIGS[siteKey]
                return (
                  <button
                    key={siteKey}
                    type="button"
                    data-testid={`info-site-switch-${siteKey}`}
                    onClick={() => handleSiteChange(siteKey)}
                    className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cfg.shortLabel}
                  </button>
                )
              })}
            </div>

            <Link
              to={`/?site=${site}`}
              data-testid="back-to-landing"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
            >
              <span aria-hidden="true">←</span>
              <span>Kembali ke Gerbang Layanan</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Modern Editorial Masthead & Live Filter Bar */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Editorial Meta Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-sky-800 font-bold ring-1 ring-sky-200">
                <MapPin className="h-3.5 w-3.5 text-sky-700" />
                <span>Wilayah Aktif: {siteConfig.label}</span>
              </span>
              <span className="text-slate-300" aria-hidden="true">
                |
              </span>
              <span>{siteConfig.metadata.regionName}</span>
            </div>

            {/* Mobile Location Selector */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-1">
              {ALLOWED_SITES.map((siteKey) => {
                const active = siteKey === site
                return (
                  <button
                    key={siteKey}
                    type="button"
                    onClick={() => handleSiteChange(siteKey)}
                    className={`min-h-[36px] rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {SITE_CONFIGS[siteKey].shortLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Masthead Title & Search Input Grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Pusat Informasi, Edukasi & Galeri Karantina
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
                Akses pengumuman resmi pelabuhan, panduan sertifikasi PTK Online, serta dokumentasi pengawasan karantina hewan, ikan, dan tumbuhan di wilayah kepulauan Sulawesi Utara.
              </p>
            </div>

            {/* Live Instant Search Box */}
            <div className="lg:col-span-5">
              <label htmlFor="info-search" className="sr-only">
                Cari informasi atau pengumuman karantina
              </label>
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="info-search"
                  type="search"
                  data-testid="info-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pengumuman, jadwal pelabuhan, atau panduan..."
                  className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-slate-50/80 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    data-testid="info-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Category Pill Tabs */}
          <div
            role="tablist"
            aria-label="Filter Kategori Informasi"
            className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
          >
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`info-filter-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-sky-900/60 text-sky-100'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content Stage: Single Unified Card Hierarchy */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Loading State */}
        {isLoading && (
          <div
            role="status"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-8 w-8 rounded-full border-3 border-sky-600 border-t-transparent animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Memuat dokumentasi dan informasi karantina...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div
            role="alert"
            data-testid="content-error-state"
            className="rounded-3xl border border-amber-300 bg-amber-50 p-6 sm:p-10 text-center shadow-sm"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-lg">
              !
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Gagal Memuat Daftar Informasi Terbaru
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Terjadi kendala jaringan saat mengambil pembaruan berita. Layanan utama PTK Online dan konsultasi WhatsApp tetap beroperasi penuh.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void refetch()}
                className="min-h-[44px] rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-extrabold text-white shadow hover:bg-amber-700 transition"
              >
                Muat Ulang Halaman
              </button>

              <a
                href={ptkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-xs"
              >
                Buka PTK Online
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                Hubungi WhatsApp BKHIT
              </a>
            </div>
          </div>
        )}

        {/* Empty State when dataset has zero items */}
        {!isLoading && !isError && siteScopedItems.length === 0 && (
          <div
            data-testid="information-empty-state"
            className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs"
          >
            <p className="text-lg font-bold text-slate-900">
              Belum Ada Dokumentasi Publik
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Dokumentasi informasi dan rilis karantina wilayah sedang dipersiapkan.
            </p>
          </div>
        )}

        {/* UNIFIED NEWS & DOCUMENTATION CARDS GRID (Equal Hierarchy for All Items) */}
        {!isLoading && !isError && siteScopedItems.length > 0 && (
          <section aria-label="Daftar Rilis dan Dokumentasi">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900">
                  {activeTab === 'all'
                    ? 'Daftar Rilis & Informasi Karantina'
                    : `Kategori: ${
                        filterTabs.find((t) => t.id === activeTab)?.label
                      }`}{' '}
                  ({filteredItems.length})
                </h2>
                {searchQuery.trim() && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    Menampilkan hasil pencarian untuk kata kunci{' '}
                    <span className="font-bold text-slate-900">
                      &ldquo;{searchQuery.trim()}&rdquo;
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isFilteringActive && (
                  <button
                    type="button"
                    data-testid="info-reset-filter"
                    onClick={() => {
                      setActiveTab('all')
                      setSearchQuery('')
                    }}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Filter</span>
                  </button>
                )}
                <span className="text-xs text-sky-800 font-bold">
                  Pos Layanan: {siteConfig.label}
                </span>
              </div>
            </div>

            {/* Zero Filter Match State */}
            {filteredItems.length === 0 ? (
              <div
                data-testid="information-no-filter-match"
                className="rounded-3xl border border-slate-200 bg-white p-10 text-center"
              >
                <p className="text-base font-extrabold text-slate-900">
                  Tidak Ditemukan Informasi yang Sesuai Filter
                </p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Coba gunakan kata kunci lain atau kembalikan tab kategori ke Semua Informasi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all')
                    setSearchQuery('')
                  }}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-sky-800 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Tampilkan Semua Informasi ({siteScopedItems.length})</span>
                </button>
              </div>
            ) : (
              <div
                data-testid="information-cards-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    data-testid={`info-card-${item.slug}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-md"
                  >
                    {/* Card Thumbnail Image & SVG Media Badges */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                      <img
                        src={resolvePublicAsset(
                          item.mediaUrl || 'hero/sulut.jpg',
                        )}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                      {/* Top Left Media Type Badge (SVG, Zero Emoji) */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur-md">
                          {item.videoUrl ? (
                            <>
                              <Film className="h-3 w-3 text-sky-400" />
                              <span>Video</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-3 w-3 text-sky-400" />
                              <span>Foto</span>
                            </>
                          )}
                        </span>

                        {item.documentUrl && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-sky-700/95 px-2 py-1 text-[10px] font-extrabold uppercase text-white ring-1 ring-white/20">
                            <FileText className="h-3 w-3" />
                            <span>PDF</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Left Scope Badge */}
                      <div className="absolute bottom-2.5 left-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-900 ring-1 ring-slate-200">
                        {item.siteScope === 'GLOBAL' ? 'SULUT' : item.siteScope}
                      </div>

                      {/* Bottom Right Reading Time Badge */}
                      <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-100">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{estimateReadingMinutes(item)} mnt baca</span>
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="font-extrabold uppercase tracking-wider text-sky-700">
                            {formatCategoryLabel(item.category)}
                          </span>
                          <span className="font-mono">
                            {formatIndonesianDate(item.updatedAt)}
                          </span>
                        </div>

                        <Link
                          to={`/konten/${item.slug}?site=${site}`}
                          className="block mt-2"
                        >
                          <h3 className="text-sm sm:text-base font-extrabold leading-snug text-slate-900 group-hover:text-sky-700 transition">
                            {item.title}
                          </h3>
                        </Link>

                        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to={`/konten/${item.slug}?site=${site}`}
                          data-testid={`read-more-${item.slug}`}
                          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-extrabold text-sky-700 transition hover:text-sky-900 group-hover:translate-x-1"
                        >
                          <span>Baca & Lihat Dokumentasi</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Bottom Banner Actions: Access PTK Online & WhatsApp Consultation */}
        <section className="mt-14 rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-slate-50 p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block rounded-lg bg-sky-700 px-3 py-1 text-xs font-black text-white uppercase">
                Akses Layanan Cepat
              </span>
              <h3 className="mt-2.5 text-lg sm:text-2xl font-black text-slate-900">
                Siap Mengajukan Permohonan Tindakan Karantina?
              </h3>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gunakan sistem resmi PTK Online untuk mengurus sertifikasi komoditas sebelum keberangkatan kapal atau pesawat di pelabuhan dan bandara.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={ptkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-sky-800 active:scale-95"
              >
                <span>Buka PTK Online</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95"
              >
                <MessageCircle className="h-4 w-4 text-emerald-700" />
                <span>Konsultasi WA Center</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer in Light Editorial */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-100 px-4 py-6 text-center text-xs text-slate-600">
        <p>
          Balai Karantina Hewan, Ikan, dan Tumbuhan Sulawesi Utara (Badan Karantina Indonesia)
        </p>
        <p className="mt-1 text-[11px] text-slate-500 font-serif italic">
          Laut Sehat, Sulawesi Utara Lebih Kuat
        </p>
      </footer>
    </div>
  )
}
