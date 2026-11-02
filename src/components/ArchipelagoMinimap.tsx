import { useMemo } from 'react'
import { motion } from 'motion/react'
import { SITE_CONFIGS, type SiteKey, SITE_LIST } from '../config/sites'

interface ArchipelagoMinimapProps {
  activeSite: SiteKey
  onSelectSite: (site: SiteKey) => void
  compact?: boolean
}

export function ArchipelagoMinimap({
  activeSite,
  onSelectSite,
  compact = false,
}: ArchipelagoMinimapProps) {
  const currentConfig = useMemo(() => SITE_CONFIGS[activeSite], [activeSite])
  const { lat, lng } = currentConfig.metadata.coordinates

  // Standard Google Maps official embed URL (Zero API Key / Zero Secrets required)
  const gmapsEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=15&output=embed`
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div
      data-testid="archipelago-minimap"
      className={`relative flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-xl ${
        compact ? 'max-w-xs' : 'w-full'
      }`}
    >
      {/* Header bar: Title & Google Maps Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-sky-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <span className="text-xs font-extrabold tracking-wide uppercase text-slate-800">
            Peta Lokasi Kantor Karantina
          </span>
        </div>

        <div
          data-testid="gmaps-badge"
          className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-800 ring-1 ring-slate-200"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Google Maps
        </div>
      </div>

      {/* Island / Service Point Selector Tabs */}
      <div
        role="tablist"
        aria-label="Pilih lokasi pos karantina pada peta"
        className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4"
      >
        {SITE_LIST.map((siteItem) => {
          const isSelected = siteItem.key === activeSite
          return (
            <button
              key={siteItem.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectSite(siteItem.key)}
              className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold transition active:scale-95 ${
                isSelected
                  ? 'border border-sky-500 bg-sky-50 text-[#0c356a] shadow-xs ring-1 ring-sky-400/40'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSelected ? 'bg-sky-600 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="truncate">{siteItem.shortLabel}</span>
            </button>
          )
        })}
      </div>

      {/* Google Maps Official Interactive Map Viewport */}
      <div className="relative mt-2.5 h-[230px] sm:h-[280px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
        <iframe
          key={`gmaps-${activeSite}`}
          src={gmapsEmbedUrl}
          title={`Peta Lokasi ${currentConfig.metadata.officeName}`}
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Coordinates Tag Badge */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800 shadow ring-1 ring-slate-200">
          📍 {currentConfig.metadata.coordinatesLabel}
        </div>
      </div>

      {/* Active Service Point Details Card */}
      <motion.div
        key={activeSite}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50/90 p-3 text-xs text-slate-700"
      >
        <div className="font-extrabold text-slate-900 text-[13px]">
          {currentConfig.metadata.officeName}
        </div>
        <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
          {currentConfig.metadata.address}
        </p>

        {/* Coverage Ports */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
            Wilayah Kerja:
          </span>
          {currentConfig.metadata.coveragePorts.map((port) => (
            <span
              key={port}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 shadow-xs"
            >
              {port}
            </span>
          ))}
        </div>

        {/* Jam Layanan & Hotline Telepon */}
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 text-[11px]">
          <div className="rounded-lg bg-white p-2 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Jam Layanan
            </span>
            <span className="text-slate-800 font-medium">
              {currentConfig.metadata.operationalHours}
            </span>
          </div>
          <div className="rounded-lg bg-white p-2 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Hotline Layanan
            </span>
            <a
              href={`tel:${currentConfig.metadata.contactPhone.replace(/[^0-9+]/g, '')}`}
              className="text-sky-700 font-mono font-bold underline hover:text-sky-900"
            >
              {currentConfig.metadata.contactPhone}
            </a>
          </div>
        </div>

        {/* Action Button: Direct Google Maps Navigation */}
        <div className="mt-3">
          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="minimap-google-maps-btn"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-extrabold text-white shadow transition hover:bg-sky-700 active:scale-95 text-center"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span>Buka Rute di Google Maps</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
