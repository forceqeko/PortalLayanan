import { ENV } from '../config/env'
import type { SiteKey } from '../config/sites'

// Event payload excludes PII and dispatches via non-blocking beacon (ARCH-07).
export const ALLOWED_EVENTS = [
  'portal_view',
  'ptk_redirect',
  'qdi_redirect',
  'content_view',
  'whatsapp_click',
  'site_switch',
] as const

export type AnalyticsEventName = (typeof ALLOWED_EVENTS)[number]
export type EntrySource = 'captive_portal' | 'direct' | 'referral'
export type DeviceClass = 'mobile' | 'tablet' | 'desktop'

export type AnalyticsEventPayload = {
  event_name: AnalyticsEventName
  timestamp: string
  session_id: string
  site_context: SiteKey
  entry_source: EntrySource
  target: string
  content_id?: string
  device_class: DeviceClass
  release_version: string
}

const SESSION_KEY = 'bkhit_portal_session_id'
const RECENT_EVENTS_KEY = 'bkhit_portal_recent_events'

declare global {
  interface Window {
    __PORTAL_EVENTS__?: AnalyticsEventPayload[]
  }
}

function generatePseudonymousSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    // Fallback for older browsers without crypto.randomUUID.
  }
  return `sess_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`
}

export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing
    }
    const created = generatePseudonymousSessionId()
    sessionStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return generatePseudonymousSessionId()
  }
}

export function getDeviceClass(): DeviceClass {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function trackEvent(params: {
  event_name: AnalyticsEventName
  site_context: SiteKey
  entry_source: EntrySource
  target: string
  content_id?: string
}): AnalyticsEventPayload {
  const payload: AnalyticsEventPayload = {
    event_name: params.event_name,
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    site_context: params.site_context,
    entry_source: params.entry_source,
    target: params.target,
    ...(params.content_id ? { content_id: params.content_id } : {}),
    device_class: getDeviceClass(),
    release_version: ENV.RELEASE_VERSION,
  }

  try {
    if (typeof window !== 'undefined') {
      window.__PORTAL_EVENTS__ = window.__PORTAL_EVENTS__ || []
      window.__PORTAL_EVENTS__.push(payload)
      const prevRaw = sessionStorage.getItem(RECENT_EVENTS_KEY)
      const prev: AnalyticsEventPayload[] = prevRaw ? JSON.parse(prevRaw) : []
      const next = [...prev.slice(-49), payload]
      sessionStorage.setItem(RECENT_EVENTS_KEY, JSON.stringify(next))
    }
  } catch {
    // Ignore storage quota errors so navigation is never blocked.
  }

  try {
    const body = JSON.stringify(payload)
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function'
    ) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(ENV.EVENT_ENDPOINT, blob)
    } else if (typeof fetch === 'function') {
      void fetch(ENV.EVENT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // Analytics failure must never block user navigation (§22).
  }

  return payload
}
