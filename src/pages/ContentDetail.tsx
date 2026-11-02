import { Link, useParams } from 'react-router-dom'
import { usePublishedContent } from '../content/useContent'
import { isPubliclyVisible } from '../content/selectors'
import { useSiteContext } from '../context/site-context'
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

export function ContentDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { site } = useSiteContext()
  const { data, isLoading, isError } = usePublishedContent()

  const item = (data?.items ?? []).find(
    (entry) => entry.slug === slug && isPubliclyVisible(entry),
  )

  const ptkUrl = getSafeServiceUrl('ptk', site)
  const waUrl = getSafeServiceUrl('whatsapp', site)

  return (
    <div
      data-testid="content-detail-page"
      className="min-h-dvh bg-[#f8fafc] font-sans text-slate-900"
    >
      {/* Top Navbar in Clean Light Theme */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to={`/?site=${site}`}
            data-testid="back-to-landing"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 active:scale-95 shadow-xs"
          >
            <span>←</span>
            <span>Kembali ke Gerbang Utama</span>
          </Link>

          <Link
            to={`/informasi?site=${site}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800 transition hover:bg-sky-100 active:scale-95 shadow-xs"
          >
            <span>Semua Dokumentasi</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
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
            className="rounded-3xl border border-amber-300 bg-amber-50 p-8 sm:p-12 text-center shadow-sm"
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
                className="inline-flex min-h-[44px] items-center rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-sky-700"
              >
                Buka PTK Online →
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 shadow-xs"
              >
                Tanya Karantina (WhatsApp)
              </a>
            </div>
          </div>
        )}

        {!isLoading && !isError && item && (
          <article
            data-testid="content-detail-article"
            className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 md:p-10 shadow-xl"
          >
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-sky-50 px-2.5 py-1 font-bold uppercase text-sky-800 ring-1 ring-sky-200">
                {item.category}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                Cakupan: {item.siteScope === 'GLOBAL' ? 'Sulawesi Utara' : item.siteScope}
              </span>
              <span className="font-mono text-slate-500">
                {formatIndonesianDate(item.updatedAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-slate-900 tracking-tight">
              {item.title}
            </h1>

            {/* Summary Callout Box */}
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 sm:p-5 text-xs sm:text-sm font-semibold leading-relaxed text-sky-950">
              {item.summary}
            </div>

            {/* MULTIMEDIA DISPLAY: Video Player or Photo Showcase */}
            {item.videoUrl && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
                <video
                  controls
                  preload="metadata"
                  poster={resolvePublicAsset(item.mediaUrl || 'hero/sulut.jpg')}
                  className="w-full aspect-video object-cover"
                >
                  <source src={item.videoUrl} type="video/mp4" />
                  Peramban Anda tidak mendukung pemutar video HTML5.
                </video>
                <div className="p-3 bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-2 border-t border-slate-200">
                  <span>🎬 Video Dokumentasi & Edukasi Karantina</span>
                </div>
              </div>
            )}

            {item.mediaUrl && !item.videoUrl && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={resolvePublicAsset(item.mediaUrl)}
                  alt={item.title}
                  className="w-full max-h-[460px] object-cover"
                />
                <div className="p-2.5 bg-slate-100 text-[11px] text-slate-700 flex items-center justify-between border-t border-slate-200">
                  <span>📸 Dokumentasi Kegiatan Balai Karantina Sulawesi Utara</span>
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

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95 shadow-xs"
              >
                <span>Konsultasi Petugas Terkait Informasi Ini (WhatsApp)</span>
              </a>

              <Link
                to={`/informasi?site=${site}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-sky-700 active:scale-95 shadow-md"
              >
                <span>Lihat Dokumentasi Lainnya</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
