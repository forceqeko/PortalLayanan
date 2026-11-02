/**
 * Lightweight Auditable Analytics Endpoint (PRD §14 & §15)
 * - Accepts only the 6 baseline event names
 * - Enforces site allowlist (sulut, siau, tahuna, melonguane)
 * - Strips any non-schema or PII fields (§14.4, UAT-15)
 */

const ALLOWED_EVENTS = new Set([
  'portal_view',
  'ptk_redirect',
  'qdi_redirect',
  'content_view',
  'whatsapp_click',
  'site_switch',
])

const ALLOWED_SITES = new Set(['sulut', 'siau', 'tahuna', 'melonguane'])
const ALLOWED_SOURCES = new Set(['captive_portal', 'direct', 'referral'])
const ALLOWED_DEVICES = new Set(['mobile', 'tablet', 'desktop'])

export function sanitizeEventPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Invalid JSON payload' }
  }

  const event_name = String(raw.event_name || '').trim()
  if (!ALLOWED_EVENTS.has(event_name)) {
    return { valid: false, error: 'Unsupported event_name' }
  }

  const rawSite = String(raw.site_context || 'sulut').trim().toLowerCase()
  const site_context = ALLOWED_SITES.has(rawSite) ? rawSite : 'sulut'

  const rawSource = String(raw.entry_source || 'direct').trim().toLowerCase()
  const entry_source = ALLOWED_SOURCES.has(rawSource) ? rawSource : 'direct'

  const rawDevice = String(raw.device_class || 'desktop').trim().toLowerCase()
  const device_class = ALLOWED_DEVICES.has(rawDevice) ? rawDevice : 'desktop'

  const session_id = String(raw.session_id || 'anonymous')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 64)

  const target = String(raw.target || '')
    .replace(/[^a-zA-Z0-9_/-]/g, '')
    .slice(0, 120)

  const content_id = raw.content_id
    ? String(raw.content_id)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 64)
    : undefined

  const release_version = String(raw.release_version || '2.0.0')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 32)

  // Strictly return ONLY the 9 allowed non-PII fields (§14.2 & §14.4)
  const sanitized = {
    event_name,
    timestamp: new Date().toISOString(),
    session_id,
    site_context,
    entry_source,
    target,
    ...(content_id ? { content_id } : {}),
    device_class,
    release_version,
  }

  return { valid: true, event: sanitized }
}

export default async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
    return
  }

  const result = sanitizeEventPayload(req.body)
  if (!result.valid) {
    context.res = {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: false, error: result.error },
    }
    return
  }

  // Append-only structured log for Azure Monitor / Table Storage binding
  context.log.info('PORTAL_EVENT', JSON.stringify(result.event))

  context.res = {
    status: 202,
    headers: { 'Content-Type': 'application/json' },
    body: { ok: true },
  }
}

