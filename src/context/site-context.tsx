/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  ALLOWED_SITES,
  SITE_CONFIGS,
  type SiteConfig,
  type SiteKey,
} from '../config/sites'
import { trackEvent, type EntrySource } from '../analytics/track'

const REMEMBERED_SITE_KEY = 'bkhit_portal_remembered_site'

export function isValidSiteKey(val: string | null | undefined): val is SiteKey {
  if (!val) return false
  const normalized = val.trim().toLowerCase()
  return (ALLOWED_SITES as readonly string[]).includes(normalized)
}

export type SiteResolutionResult = {
  site: SiteKey
  source: 'url' | 'remembered' | 'geolocation' | 'default'
  entrySource: EntrySource
  invalidSiteParam: string | null
}

// Priority order: URL ?site= allowlist -> remembered localStorage -> voluntary geolocation -> 'sulut' (§8).
export function resolveInitialSite(search: string, referrer: string): SiteResolutionResult {
  const params = new URLSearchParams(search)
  const rawSiteParam = params.get('site')

  if (rawSiteParam !== null) {
    const normalized = rawSiteParam.trim().toLowerCase()
    if (isValidSiteKey(normalized)) {
      try {
        localStorage.setItem(REMEMBERED_SITE_KEY, normalized)
      } catch {
        // Ignore storage write failure in private browsing.
      }
      return {
        site: normalized,
        source: 'url',
        entrySource: 'captive_portal',
        invalidSiteParam: null,
      }
    } else {
      return {
        site: 'sulut',
        source: 'default',
        entrySource: detectNonCaptiveEntrySource(referrer),
        invalidSiteParam: rawSiteParam.slice(0, 32),
      }
    }
  }

  try {
    const remembered = localStorage.getItem(REMEMBERED_SITE_KEY)
    if (isValidSiteKey(remembered)) {
      return {
        site: remembered,
        source: 'remembered',
        entrySource: detectNonCaptiveEntrySource(referrer),
        invalidSiteParam: null,
      }
    }
  } catch {
    // Ignore storage read failure.
  }

  return {
    site: 'sulut',
    source: 'default',
    entrySource: detectNonCaptiveEntrySource(referrer),
    invalidSiteParam: null,
  }
}

function detectNonCaptiveEntrySource(referrer: string): EntrySource {
  if (!referrer) return 'direct'
  try {
    const refUrl = new URL(referrer)
    if (typeof window !== 'undefined' && refUrl.host === window.location.host) {
      return 'direct'
    }
    return 'referral'
  } catch {
    return 'direct'
  }
}

// Coordinates are mapped in memory and never persisted or transmitted (ARCH-04).
export function mapCoordinatesToNearestSite(lat: number, lng: number): SiteKey {
  let nearest: SiteKey = 'sulut'
  let minDistanceSq = Number.POSITIVE_INFINITY

  for (const key of ALLOWED_SITES) {
    const coords = SITE_CONFIGS[key].metadata.coordinates
    const dLat = lat - coords.lat
    const dLng = lng - coords.lng
    const distSq = dLat * dLat + dLng * dLng
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq
      nearest = key
    }
  }

  return nearest
}

type SiteContextValue = {
  site: SiteKey
  siteConfig: SiteConfig
  source: 'url' | 'remembered' | 'geolocation' | 'default' | 'manual'
  entrySource: EntrySource
  invalidSiteParam: string | null
  geoStatus: 'idle' | 'locating' | 'resolved' | 'denied' | 'unsupported'
  switchSite: (nextSite: SiteKey) => void
  requestVoluntaryGeolocation: () => void
  dismissInvalidNotice: () => void
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(
    () =>
      resolveInitialSite(
        typeof window !== 'undefined' ? window.location.search : '',
        typeof document !== 'undefined' ? document.referrer : '',
      ),
    [],
  )

  const [site, setSite] = useState<SiteKey>(initial.site)
  const [source, setSource] = useState<
    'url' | 'remembered' | 'geolocation' | 'default' | 'manual'
  >(initial.source)
  const [invalidSiteParam, setInvalidSiteParam] = useState<string | null>(
    initial.invalidSiteParam,
  )
  const [geoStatus, setGeoStatus] = useState<
    'idle' | 'locating' | 'resolved' | 'denied' | 'unsupported'
  >('idle')

  const hasLoggedPortalView = useRef(false)

  useEffect(() => {
    if (!hasLoggedPortalView.current) {
      hasLoggedPortalView.current = true
      trackEvent({
        event_name: 'portal_view',
        site_context: site,
        entry_source: initial.entrySource,
        target: site,
      })
    }
  }, [site, initial.entrySource])

  const switchSite = (nextSite: SiteKey) => {
    if (!isValidSiteKey(nextSite)) return
    setSite(nextSite)
    setSource('manual')
    setInvalidSiteParam(null)
    try {
      localStorage.setItem(REMEMBERED_SITE_KEY, nextSite)
      const url = new URL(window.location.href)
      url.searchParams.set('site', nextSite)
      window.history.replaceState({}, '', url.toString())
    } catch {
      // Ignore history update error.
    }
    trackEvent({
      event_name: 'site_switch',
      site_context: nextSite,
      entry_source: initial.entrySource,
      target: nextSite,
    })
  }

  const requestVoluntaryGeolocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unsupported')
      return
    }
    setGeoStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = mapCoordinatesToNearestSite(
          pos.coords.latitude,
          pos.coords.longitude,
        )
        setGeoStatus('resolved')
        setSite(nearest)
        setSource('geolocation')
        setInvalidSiteParam(null)
        try {
          localStorage.setItem(REMEMBERED_SITE_KEY, nearest)
        } catch {
          // Ignore storage error.
        }
        trackEvent({
          event_name: 'site_switch',
          site_context: nearest,
          entry_source: initial.entrySource,
          target: nearest,
        })
      },
      () => {
        setGeoStatus('denied')
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
    )
  }

  const dismissInvalidNotice = () => setInvalidSiteParam(null)

  const value: SiteContextValue = {
    site,
    siteConfig: SITE_CONFIGS[site],
    source,
    entrySource: initial.entrySource,
    invalidSiteParam,
    geoStatus,
    switchSite,
    requestVoluntaryGeolocation,
    dismissInvalidNotice,
  }

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSiteContext(): SiteContextValue {
  const ctx = useContext(SiteContext)
  if (!ctx) {
    throw new Error('useSiteContext must be used within SiteProvider')
  }
  return ctx
}
