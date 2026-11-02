import { Link } from 'react-router-dom'
import { resolvePublicAsset } from '../config/env'
import { getSafeServiceUrl } from '../config/services'
import { useSiteContext } from '../context/site-context'

export function QdiDevelopmentPage() {
  const { site, siteConfig } = useSiteContext()

  const ptkUrl = getSafeServiceUrl('ptk', site)
  const waUrl = getSafeServiceUrl('whatsapp', site)

  return (
    <div
      data-testid="qdi-development-page"
      className="min-h-dvh bg-[#f8fafc] font-sans text-slate-900"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to={`/?site=${site}`}
            className="group flex items-center gap-3"
            aria-label="Kembali ke Gerbang Layanan"
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
              <div className="text-[11px] font-bold text-indigo-700">
                Decision Intelligence Platform
              </div>
            </div>
          </Link>

          <Link
            to={`/?site=${site}`}
            data-testid="back-to-landing"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 active:scale-95 shadow-xs"
          >
            <span>←</span>
            <span>Kembali ke Gerbang</span>
          </Link>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 sm:p-14 shadow-xl text-center">
          {/* Subtle Background Glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Icon Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 shadow-md">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 animate-pulse"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>

          {/* Status Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span>Sedang Dalam Tahap Pengembangan</span>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="mt-5 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Quarantine Decision Intelligence (QDI)
          </h1>
          <p className="mt-2 text-sm sm:text-base font-bold text-indigo-700">
            Platform Analitik Data & Dukungan Keputusan Karantina
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sistem analitik cerdas berbasis data terpadu untuk wilayah kepulauan Sulawesi Utara ({siteConfig.label}) saat ini sedang dalam proses sinkronisasi basis data dan finalisasi integrasi oleh tim teknologi informasi BKHIT.
          </p>

          {/* Feature Highlights Grid */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="text-lg">📊</div>
              <h2 className="mt-2 text-xs font-black text-slate-900">
                Pemetaan Komoditas
              </h2>
              <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                Visualisasi volume lalu lintas hewan, ikan, dan tumbuhan di seluruh pelabuhan kepulauan.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="text-lg">⚡</div>
              <h2 className="mt-2 text-xs font-black text-slate-900">
                Analitik Risiko Cepat
              </h2>
              <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                Deteksi dini potensi ancaman HPHK, HPIK, dan OPTK pada jalur transportasi laut dan udara.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="text-lg">🛡️</div>
              <h2 className="mt-2 text-xs font-black text-slate-900">
                Dukungan Keputusan
              </h2>
              <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                Rekomendasi tindakan karantina berbasis data historis dan kebijakan pimpinan secara akurat.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-slate-100">
            <Link
              to={`/?site=${site}`}
              className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-extrabold text-white shadow hover:bg-slate-800 transition active:scale-95"
            >
              <span>← Kembali ke Gerbang Utama</span>
            </Link>

            <a
              href={ptkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-5 py-2.5 text-xs font-extrabold text-sky-800 shadow-xs hover:bg-sky-100 transition active:scale-95"
            >
              <span>Buka PTK Online</span>
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-2.5 text-xs font-extrabold text-emerald-800 shadow-xs hover:bg-emerald-100 transition active:scale-95"
            >
              <span>Konsultasi WhatsApp</span>
              <span aria-hidden="true">💬</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
