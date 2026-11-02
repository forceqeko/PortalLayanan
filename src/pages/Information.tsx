import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SITE_CONFIGS, type SiteKey, ALLOWED_SITES } from '../config/sites'
import { usePublishedContent } from '../content/useContent'
import { selectContentForSite } from '../content/selectors'
import type { PublishedContentItem } from '../content/contract'
import { getSafeServiceUrl } from '../config/services'
import { resolvePublicAsset } from '../config/env'

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

export function InformationPage() {
  const [searchParams] = useSearchParams()
  const rawSite = searchParams.get('site') || 'sulut'
  const site: SiteKey = (ALLOWED_SITES as readonly string[]).includes(rawSite)
    ? (rawSite as SiteKey)
    : 'sulut'

  const siteConfig = useMemo(() => SITE_CONFIGS[site], [site])
  const { data, isLoading, isError, refetch } = usePublishedContent()

  const waUrl = getSafeServiceUrl('whatsapp', site)
  const ptkUrl = getSafeServiceUrl('ptk', site)

  // Filter items scoped to this island, with fallback to global
  const siteScopedItems = useMemo(() => {
    const allItems = data?.items ?? []
    return selectContentForSite(allItems, site)
  }, [data, site])

  // Featured item: preferably one with video, or the first item
  const featuredItem: PublishedContentItem | undefined = useMemo(() => {
    return siteScopedItems.find((item) => Boolean(item.videoUrl)) || siteScopedItems[0]
  }, [siteScopedItems])

  return (
    <div
      data-testid="information-page"
      className="min-h-dvh bg-[#f8fafc] font-sans text-slate-900"
    >
      {/* Top Navbar in Clean Light Theme */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={`/?site=${site}`}
            className="group flex items-center gap-3"
            aria-label="Kembali ke Beranda Gate"
          >
            <img
              src={resolvePublicAsset('assets/logo-bkhit.png')}
              alt="Logo BKHIT"
              className="h-9 w-9 shrink-0 rounded-full bg-white p-0.5 ring-1 ring-slate-200 object-contain shadow-xs sm:h-10 sm:w-10"
            />
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wider text-slate-900 uppercase leading-tight">
                BALAI KARANTINA SULAWESI UTARA
              </div>
              <div className="text-[11px] font-bold text-sky-700">
                Pusat Informasi & Sosialisasi
              </div>
            </div>
          </Link>

          <Link
            to={`/?site=${site}`}
            data-testid="back-to-landing"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 active:scale-95 shadow-xs"
          >
            <span>←</span>
            <span>Kembali ke Gerbang Layanan</span>
          </Link>
        </div>
      </header>

      {/* Hero Visual Banner in Clean Editorial Light Theme */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-sky-50/70 via-white to-slate-50 py-10 sm:py-14">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute inset-0 bg-radial from-sky-400/10 via-transparent to-transparent opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Pusat Informasi, Edukasi & Galeri Karantina
          </h1>
          <p className="mt-2.5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-600">
            Akses dokumentasi visual kegiatan pelabuhan, video panduan permohonan karantina, dan rilis pengumuman resmi untuk masyarakat kepulauan Sulawesi Utara.
          </p>
        </div>
      </section>

      {/* Main Content Stage */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
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
            className="rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center text-amber-950 shadow-sm"
          >
            <h2 className="text-lg font-bold text-amber-900">
              Gagal Memuat Informasi Karantina
            </h2>
            <p className="mt-1 text-xs text-amber-800">
              Terjadi kendala jaringan saat menghubungi server informasi. Layanan PTK Online dan WhatsApp tetap aktif normal.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-amber-600 px-5 py-2 text-xs font-extrabold text-white shadow hover:bg-amber-700"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* FEATURED MULTIMEDIA HERO CARD */}
        {!isLoading && !isError && featuredItem && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Media Player Box (16:9 Aspect Video / Photo Showcase) */}
              <div className="lg:col-span-7 relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[360px]">
                {featuredItem.videoUrl ? (
                  <video
                    controls
                    preload="metadata"
                    poster={resolvePublicAsset(featuredItem.mediaUrl || 'hero/sulut.jpg')}
                    className="h-full w-full object-cover"
                  >
                    <source src={featuredItem.videoUrl} type="video/mp4" />
                    Peramban Anda tidak mendukung pemutar video HTML5.
                  </video>
                ) : (
                  <img
                    src={resolvePublicAsset(featuredItem.mediaUrl || 'hero/sulut.jpg')}
                    alt={featuredItem.title}
                    className="h-full w-full object-cover"
                  />
                )}

                {/* Floating Media Badge */}
                <div className="pointer-events-none absolute top-3 left-3 rounded-lg bg-slate-900/80 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-md">
                  {featuredItem.videoUrl ? '🎬 Video Unggulan' : '📸 Foto Unggulan'}
                </div>
              </div>

              {/* Text & Action Box */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-sky-50 px-2.5 py-0.5 font-bold uppercase text-sky-800 ring-1 ring-sky-200">
                      {featuredItem.category}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                      {featuredItem.siteScope === 'GLOBAL' ? 'Sulawesi Utara' : featuredItem.siteScope}
                    </span>
                    <span className="font-mono text-slate-500">
                      {formatIndonesianDate(featuredItem.updatedAt)}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {featuredItem.title}
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {featuredItem.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-2.5">
                  <Link
                    to={`/konten/${featuredItem.slug}?site=${site}`}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-sky-700 active:scale-95 text-center shadow-md"
                  >
                    <span>Buka Rincian & Dokumentasi</span>
                    <span aria-hidden="true">→</span>
                  </Link>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 shadow-xs"
                  >
                    Tanya Petugas
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && siteScopedItems.length === 0 && (
          <div
            data-testid="information-empty-state"
            className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"
          >
            <p className="text-lg font-bold text-slate-900">
              Belum Ada Dokumentasi Publik
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Dokumentasi informasi dan rilis karantina wilayah sedang dipersiapkan.
            </p>
          </div>
        )}

        {/* GRID OF MEDIA & ARTICLES CARDS in Clean White */}
        {!isLoading && !isError && siteScopedItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Daftar Rilis & Informasi ({siteScopedItems.length})
              </h3>
              <span className="text-xs text-sky-800 font-semibold">
                Pos Layanan: {siteConfig.label}
              </span>
            </div>

            <div
              data-testid="information-cards-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {siteScopedItems.map((item) => (
                <article
                  key={item.id}
                  data-testid={`info-card-${item.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl"
                >
                  {/* Card Thumbnail Image / Video Badge */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      src={resolvePublicAsset(item.mediaUrl || 'hero/sulut.jpg')}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                    {/* Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow ring-1 ring-white/15 backdrop-blur-md">
                      {item.videoUrl ? '🎬 Video' : '📸 Foto'}
                    </div>

                    <div className="absolute bottom-2 left-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800 shadow ring-1 ring-slate-200">
                      {item.siteScope === 'GLOBAL' ? 'SULUT' : item.siteScope}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="font-bold uppercase tracking-wider text-sky-700">
                          {item.category}
                        </span>
                        <span className="font-mono">
                          {formatIndonesianDate(item.updatedAt)}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm sm:text-base font-extrabold leading-snug text-slate-900 group-hover:text-sky-700 transition">
                        {item.title}
                      </h4>

                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
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
          </div>
        )}

        {/* Bottom Banner Actions: Access PTK Online & WhatsApp Consultation */}
        <section className="mt-14 rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-black text-white uppercase shadow-xs">
                Akses Layanan Cepat
              </span>
              <h3 className="mt-2 text-lg sm:text-2xl font-black text-slate-900">
                Siap Mengajukan Permohonan Karantina?
              </h3>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                Manfaatkan sistem resmi PTK Online untuk mengurus sertifikasi sebelum keberangkatan kapal atau pesawat di pelabuhan dan bandara.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={ptkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-sky-700 active:scale-95"
              >
                <span>Buka PTK Online</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95 shadow-xs"
              >
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
