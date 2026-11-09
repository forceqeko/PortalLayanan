import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ENV, resolvePublicAsset } from '../config/env'
import { getSafeServiceUrl, SERVICE_TARGETS } from '../config/services'
import { ISLAND_SITES, SITE_LIST, type SiteKey } from '../config/sites'
import { useSiteContext } from '../context/site-context'
import { trackEvent } from '../analytics/track'
import { ArchipelagoMinimap } from '../components/ArchipelagoMinimap'

export function LandingPage() {
  const {
    site,
    siteConfig,
    entrySource,
    invalidSiteParam,
    switchSite,
    dismissInvalidNotice,
  } = useSiteContext()

  const [failedHeroAsset, setFailedHeroAsset] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )
  const [minimapModalOpen, setMinimapModalOpen] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setMinimapModalOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const heroFailed = failedHeroAsset === siteConfig.heroAsset
  const ptkUrl = getSafeServiceUrl('ptk', site)
  const qdiUrl = getSafeServiceUrl('qdi', site)
  const waUrl = getSafeServiceUrl('whatsapp', site)

  return (
    <div
      data-testid="hero-section"
      data-site={site}
      className={`relative flex min-h-dvh w-full flex-col justify-between font-sans lg:h-dvh lg:overflow-hidden ${siteConfig.theme.gradientClass}`}
    >
      {/* Full-Screen Archipelago Background Photograph (Toned down with brightness filter for optimal text legibility) */}
      <AnimatePresence mode="wait">
        {!heroFailed && (
          <motion.img
            key={siteConfig.heroAsset}
            src={siteConfig.heroAsset}
            alt={`Lanskap wilayah layanan karantina ${siteConfig.label}`}
            onError={() => setFailedHeroAsset(siteConfig.heroAsset)}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            fetchPriority="high"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
      </AnimatePresence>

      {/* Pure Left-to-Right Horizontal Scrim: dark on the left for maximum text contrast, 100% transparent on the right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--scrim-directional)' }}
      />

      {/* TOP HEADER BAR: Left Brand Identity | Right White Pill Location Dropdown */}
      <header className="relative z-30 w-full">
        {isOffline && (
          <div
            role="status"
            data-testid="offline-banner"
            className="border-b border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-950"
          >
            <div className="mx-auto max-w-7xl">
              Mode Koneksi Terbatas (Offline): Pastikan koneksi internet aktif saat membuka PTK Online atau QDI.
            </div>
          </div>
        )}

        {invalidSiteParam && (
          <div
            role="alert"
            data-testid="invalid-site-banner"
            className="border-b border-amber-300 bg-amber-50 px-4 py-1.5 text-xs text-amber-950"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
              <p>
                Parameter lokasi{' '}
                <code className="rounded bg-amber-200/60 px-1.5 py-0.5 font-mono font-bold text-amber-900">
                  {invalidSiteParam}
                </code>{' '}
                tidak terdaftar. Menampilkan konteks default{' '}
                <strong>Sulawesi Utara</strong>.
              </p>
              <button
                type="button"
                onClick={dismissInvalidNotice}
                aria-label="Tutup pemberitahuan lokasi"
                className="min-h-[44px] rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 pt-4 pb-2 sm:gap-4 sm:px-8 sm:pt-7">
          {/* Top-Left Brand Identity (Click to return to Sulawesi Utara context) */}
          <button
            type="button"
            data-testid="site-switch-sulut"
            onClick={() => switchSite('sulut')}
            className="group flex min-h-[44px] items-center gap-2.5 sm:gap-3.5 text-left focus-visible:outline-none"
          >
            {!logoError ? (
              <img
                src={resolvePublicAsset('assets/logo-bkhit.png')}
                alt="Lambang Resmi Badan Karantina Indonesia"
                width={44}
                height={44}
                onError={() => setLogoError(true)}
                className="h-10 w-10 shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-sky-300/60 shadow-xs transition group-hover:ring-sky-400 sm:h-11 sm:w-11"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-300 bg-sky-950 text-xs font-bold text-sky-200 sm:h-11 sm:w-11"
              >
                BKHIT
              </div>
            )}
            <div className="min-w-0">
              <span className="gateway-subtitle block text-xs font-bold tracking-wider text-white uppercase leading-tight sm:text-sm">
                BALAI KARANTINA
              </span>
              <span className="gateway-subtitle block text-sm font-black tracking-widest text-white uppercase leading-tight sm:text-base">
                SULAWESI UTARA
              </span>
              <p className="gateway-subtitle mt-0.5 hidden text-[11px] font-normal text-white/90 sm:block">
                {siteConfig.tagline}
              </p>
            </div>
          </button>

          {/* Top-Right Location Selector Pill */}
          <div className="flex items-center shrink-0" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                aria-label="Pilih wilayah layanan karantina"
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 sm:gap-2.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-xl ring-1 ring-slate-900/10 transition hover:bg-slate-50 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-[#0c356a]"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
                <span
                  data-testid="active-site-label"
                  className="hidden sm:inline"
                >
                  {siteConfig.label}
                </span>
                <span className="sm:hidden">{siteConfig.shortLabel}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 text-slate-500 transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <span data-testid="hero-region-badge" className="sr-only">
                {siteConfig.servicePointLabel}
              </span>

              {dropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Daftar wilayah layanan"
                  className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-2xl"
                >
                  {SITE_LIST.map((item) => {
                    const active = item.key === site
                    return (
                      <button
                        key={item.key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          switchSite(item.key as SiteKey)
                          setDropdownOpen(false)
                        }}
                        className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-xs font-semibold transition ${
                          active
                            ? 'bg-[#0c356a] text-white'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{item.shortLabel}</div>
                          <div
                            className={`text-[11px] ${
                              active ? 'text-sky-100' : 'text-slate-500'
                            }`}
                          >
                            {item.metadata.dropdownLabel}
                          </div>
                        </div>
                        {active && (
                          <span aria-hidden="true" className="text-sm font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CENTER STAGE: Hero Headline + 4 Horizontal Service Cards */}
      <main className="relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-3 sm:px-8 lg:py-0">
        {/* Hero Headline Block (Pure crisp white text over scenic directional marine scrim) */}
        <motion.div
          key={site}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <h1 className="gateway-h1 font-extrabold text-white">
            Gerbang Akses Layanan dan Informasi Karantina
          </h1>
          <p
            data-testid="hero-subtitle"
            className="gateway-subtitle mt-2 max-w-xl text-xs sm:text-sm leading-relaxed font-semibold text-white/95"
          >
            {siteConfig.subtitle}
          </p>
        </motion.div>

        {/* 4 Service Cards Row (Frosted Glassmorphism Jewel-Tone Cards matching reference mockup) */}
        <div
          data-testid="primary-actions-section"
          className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-7 lg:grid-cols-4 lg:gap-4"
        >
          {/* CARD 1: Akses Layanan Karantina (PTK Online) - Ocean Blue Frosted Glass */}
          <a
            href={ptkUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="cta-hero-ptk"
            onClick={() =>
              trackEvent({
                event_name: 'ptk_redirect',
                site_context: site,
                entry_source: entrySource,
                target: 'ptk',
              })
            }
            className="glass-card-ptk group flex min-h-[82px] items-center justify-between gap-3.5 rounded-3xl p-4 text-white transition duration-200 hover:-translate-y-1.5 lg:min-h-[196px] lg:flex-col lg:items-stretch lg:justify-between lg:p-5"
          >
            <div className="flex items-center gap-3.5 lg:w-full lg:justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400 text-white shadow-md ring-1 ring-white/30">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>

              <div className="lg:hidden">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  {SERVICE_TARGETS.ptk.label}
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-white/90">
                  {SERVICE_TARGETS.ptk.shortDescription}
                </p>
              </div>

              <span
                data-testid="card-cta-ptk"
                aria-hidden="true"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition group-hover:scale-105 group-hover:bg-slate-50 lg:inline-flex"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <div className="hidden lg:mt-4 lg:block">
              <h2 className="text-lg leading-snug font-extrabold tracking-tight text-white">
                {SERVICE_TARGETS.ptk.label}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/90">
                {SERVICE_TARGETS.ptk.shortDescription}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md lg:hidden"
            >
              →
            </span>
          </a>

          {/* CARD 2: Decision Intelligence (QDI) - Indigo Frosted Glass */}
          <a
            href={qdiUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="cta-hero-qdi"
            onClick={() =>
              trackEvent({
                event_name: 'qdi_redirect',
                site_context: site,
                entry_source: entrySource,
                target: 'qdi',
              })
            }
            className="glass-card-qdi group flex min-h-[82px] items-center justify-between gap-3.5 rounded-3xl p-4 text-white transition duration-200 hover:-translate-y-1.5 lg:min-h-[196px] lg:flex-col lg:items-stretch lg:justify-between lg:p-5"
          >
            <div className="flex items-center gap-3.5 lg:w-full lg:justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-400 text-white shadow-md ring-1 ring-white/30">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>

              <div className="lg:hidden">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  {SERVICE_TARGETS.qdi.label}
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-white/90">
                  {SERVICE_TARGETS.qdi.shortDescription}
                </p>
              </div>

              <span
                data-testid="card-cta-qdi"
                aria-hidden="true"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition group-hover:scale-105 group-hover:bg-slate-50 lg:inline-flex"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <div className="hidden lg:mt-4 lg:block">
              <h2 className="text-lg leading-snug font-extrabold tracking-tight text-white">
                {SERVICE_TARGETS.qdi.label}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/90">
                {SERVICE_TARGETS.qdi.shortDescription}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md lg:hidden"
            >
              →
            </span>
          </a>

          {/* CARD 3: Informasi & Sosialisasi - Teal Frosted Glass */}
          <Link
            to={`/informasi?site=${site}`}
            data-testid="cta-hero-info"
            onClick={() =>
              trackEvent({
                event_name: 'content_view',
                site_context: site,
                entry_source: entrySource,
                target: 'information_page',
              })
            }
            className="glass-card-info group flex min-h-[82px] items-center justify-between gap-3.5 rounded-3xl p-4 text-white transition duration-200 hover:-translate-y-1.5 lg:min-h-[196px] lg:flex-col lg:items-stretch lg:justify-between lg:p-5"
          >
            <div className="flex items-center gap-3.5 lg:w-full lg:justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-400 text-white shadow-md ring-1 ring-white/30">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="m3 11 18-5v12L3 14v-3z" />
                  <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
              </div>

              <div className="lg:hidden">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  {SERVICE_TARGETS.info.label}
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-white/90">
                  {SERVICE_TARGETS.info.shortDescription}
                </p>
              </div>

              <span
                data-testid="card-cta-info"
                aria-hidden="true"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition group-hover:scale-105 group-hover:bg-slate-50 lg:inline-flex"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <div className="hidden lg:mt-4 lg:block">
              <h2 className="text-lg leading-snug font-extrabold tracking-tight text-white">
                {SERVICE_TARGETS.info.label}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/90">
                {SERVICE_TARGETS.info.shortDescription}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md lg:hidden"
            >
              →
            </span>
          </Link>

          {/* CARD 4: Tanya Karantina (WhatsApp) - Emerald Frosted Glass */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="cta-hero-wa"
            onClick={() =>
              trackEvent({
                event_name: 'whatsapp_click',
                site_context: site,
                entry_source: entrySource,
                target: 'whatsapp',
              })
            }
            className="glass-card-wa group flex min-h-[82px] items-center justify-between gap-3.5 rounded-3xl p-4 text-white transition duration-200 hover:-translate-y-1.5 lg:min-h-[196px] lg:flex-col lg:items-stretch lg:justify-between lg:p-5"
          >
            <div className="flex items-center gap-3.5 lg:w-full lg:justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md ring-1 ring-white/30">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>

              <div className="lg:hidden">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  {SERVICE_TARGETS.whatsapp.label}
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-white/90">
                  {SERVICE_TARGETS.whatsapp.shortDescription}
                </p>
              </div>

              <span
                data-testid="card-cta-wa"
                aria-hidden="true"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition group-hover:scale-105 group-hover:bg-slate-50 lg:inline-flex"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <div className="hidden lg:mt-4 lg:block">
              <h2 className="text-lg leading-snug font-extrabold tracking-tight text-white">
                {SERVICE_TARGETS.whatsapp.label}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/90">
                {SERVICE_TARGETS.whatsapp.shortDescription}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-md lg:hidden"
            >
              →
            </span>
          </a>
        </div>
      </main>

      {/* BOTTOM BAR: Left "Pilih Wilayah Layanan" (3 Island Photo Thumbnails) | Right Motto & Compact Bulletin */}
      <footer
        data-testid="footer-resmi"
        className="relative z-20 mx-auto w-full max-w-7xl px-5 pb-5 pt-2 sm:px-8 sm:pb-6"
      >
        <div
          data-testid="titik-layanan-section"
          className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          {/* Left: Pilih Wilayah Layanan + 3 Island Thumbnail Cards (Siau, Tahuna, Melonguane) */}
          <div className="w-full max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
                <span className="gateway-subtitle text-xs sm:text-sm font-extrabold text-white">
                  Pilih Wilayah Layanan
                </span>
                <span className="gateway-subtitle hidden text-xs font-normal text-white/80 sm:inline">
                  (Akses informasi dan layanan sesuai wilayah Anda)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMinimapModalOpen(true)}
                data-testid="toggle-minimap-modal-btn"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-900/80 active:scale-95 focus-visible:outline-none"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <span>Peta Pos Layanan</span>
              </button>
            </div>

            <div
              role="group"
              aria-label="Pilih Wilayah Layanan Kepulauan"
              className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-3.5"
            >
              {ISLAND_SITES.map((item) => {
                const active = item.key === site
                return (
                  <button
                    key={item.key}
                    type="button"
                    data-testid={`site-switch-${item.key}`}
                    aria-pressed={active}
                    onClick={() => switchSite(item.key as SiteKey)}
                    className={`group flex min-h-[50px] sm:min-h-[56px] items-center justify-between gap-1.5 rounded-2xl border p-2 pr-2.5 text-left backdrop-blur-md transition sm:p-2 sm:pr-3 active:scale-95 ${
                      active
                        ? 'border-sky-400 bg-slate-900/70 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] ring-2 ring-sky-400/50'
                        : 'border-white/20 bg-slate-900/50 text-white hover:border-white/40 hover:bg-slate-900/70 shadow-sm'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        src={item.heroAsset}
                        alt=""
                        aria-hidden="true"
                        className="hidden h-10 w-13 shrink-0 rounded-lg object-cover sm:block"
                      />
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-bold tracking-tight text-white sm:text-sm">
                          {item.shortLabel}
                        </span>
                        {active && (
                          <span className="hidden text-[10px] font-bold text-sky-400 sm:inline">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        active
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                      }`}
                    >
                      →
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <span data-testid="release-version" className="sr-only">
            Rilis: {ENV.RELEASE_VERSION}
          </span>
        </div>
      </footer>

      {/* Modal Peta Wilayah & Pos Layanan Karantina (Google Maps) */}
      {minimapModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-minimap-title"
          data-testid="minimap-modal-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 text-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2
                  id="modal-minimap-title"
                  className="text-base font-extrabold text-slate-900 sm:text-lg"
                >
                  Peta Titik Layanan Karantina
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  Gugusan Kepulauan Sulawesi Utara, Siau, Tahuna, dan Melonguane
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMinimapModalOpen(false)}
                data-testid="close-minimap-modal"
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-95"
                aria-label="Tutup peta titik layanan"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <ArchipelagoMinimap
                activeSite={site}
                onSelectSite={(newSite) => switchSite(newSite)}
              />
            </div>

            <div className="mt-4 flex justify-end border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setMinimapModalOpen(false)}
                className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-100 active:scale-95"
              >
                Tutup Peta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
