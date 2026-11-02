// Only public VITE_* variables belong here; secrets stay on the server (ARCH-08).

const rawBase = import.meta.env.BASE_URL || '/'
export const BASE_PATH = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export function resolvePublicAsset(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '')
  return `${BASE_PATH}${clean}`
}

export const ENV = {
  CONTENT_PROJECTION_URL:
    import.meta.env.VITE_CONTENT_PROJECTION_URL ||
    resolvePublicAsset('content/sample.json'),
  EVENT_ENDPOINT: import.meta.env.VITE_EVENT_ENDPOINT || '/api/events',
  RELEASE_VERSION: import.meta.env.VITE_RELEASE_VERSION || '2.0.0-baseline',
  PTK_URL:
    import.meta.env.VITE_PTK_URL || 'https://ptk.karantinaindonesia.go.id/',
  QDI_URL:
    import.meta.env.VITE_QDI_URL ||
    'https://qdi.karantinaindonesia.go.id/',
  QDI_DEEPLINK_ENABLED:
    import.meta.env.VITE_QDI_DEEPLINK_ENABLED === 'true',
  INFO_URL:
    import.meta.env.VITE_INFO_URL ||
    'https://karantinaindonesia.go.id/',
  WA_URL:
    import.meta.env.VITE_WA_URL ||
    'https://wa.me/6282190899090?text=Halo%20BKHIT%20Sulawesi%20Utara%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20karantina.',
} as const
