import { ENV } from './env'
import type { SiteKey } from './sites'

export type ServiceKey = 'ptk' | 'qdi' | 'info' | 'whatsapp'

export type ServiceTarget = {
  key: ServiceKey
  code: string
  label: string
  subtitle: string
  shortDescription: string
  actionLabel: string
  url: string
  enabled: boolean
  verificationNote: string
}

export const SERVICE_TARGETS: Record<ServiceKey, ServiceTarget> = {
  ptk: {
    key: 'ptk',
    code: '01',
    label: 'Akses Layanan Karantina',
    subtitle: 'PTK Online Barantin',
    shortDescription:
      'Permohonan, persyaratan, prosedur, dan layanan terkait.',
    actionLabel: 'Buka PTK Online',
    url: ENV.PTK_URL,
    enabled: true,
    verificationNote: 'LOCKED: https://ptk.karantinaindonesia.go.id/',
  },
  qdi: {
    key: 'qdi',
    code: '02',
    label: 'Decision Intelligence (QDI)',
    subtitle: 'Quarantine Decision Intelligence (QDI)',
    shortDescription:
      'Data, analitik, dan dukungan pengambilan keputusan.',
    actionLabel: 'Buka Platform QDI',
    url: ENV.QDI_URL,
    enabled: true,
    verificationNote: 'LOCKED: https://qdi.minaesa.id/',
  },
  info: {
    key: 'info',
    code: '03',
    label: 'Informasi & Sosialisasi',
    subtitle: 'Portal PPID & Kehumasan',
    shortDescription:
      'Berita, pengumuman, dan edukasi karantina.',
    actionLabel: 'Buka Portal Informasi',
    url: ENV.INFO_URL,
    enabled: true,
    verificationNote: 'VERIFY: Sesuaikan URL kanal informasi PPID/Humas',
  },
  whatsapp: {
    key: 'whatsapp',
    code: '04',
    label: 'Tanya Karantina (WhatsApp)',
    subtitle: 'Layanan Bantuan WhatsApp Resmi',
    shortDescription:
      'Konsultasi cepat dengan tim kami.',
    actionLabel: 'Hubungi via WhatsApp',
    url: ENV.WA_URL,
    enabled: true,
    verificationNote: 'LOCKED: WA Center Karantina Sulawesi Utara (0821-9089-9090)',
  },
}

export function getSafeServiceUrl(key: ServiceKey, site: SiteKey): string {
  const service = SERVICE_TARGETS[key]
  if (!service || !service.enabled) {
    return '#'
  }

  if (key === 'qdi' && ENV.QDI_DEEPLINK_ENABLED) {
    try {
      const parsed = new URL(service.url)
      parsed.searchParams.set('region', 'sulut')
      parsed.searchParams.set('site', site)
      return parsed.toString()
    } catch {
      return service.url
    }
  }

  if (key === 'whatsapp') {
    try {
      const parsed = new URL(service.url)
      const siteGreetings: Record<SiteKey, string> = {
        sulut:
          'Halo BKHIT Sulawesi Utara, saya ingin berkonsultasi mengenai layanan karantina.',
        siau:
          'Halo BKHIT Sulawesi Utara (Pos Pelayanan Siau), saya ingin berkonsultasi mengenai pemeriksaan karantina di wilayah Kepulauan Sitaro.',
        tahuna:
          'Halo BKHIT Sulawesi Utara (Pos Pelayanan Tahuna), saya ingin berkonsultasi mengenai sertifikasi komoditas karantina di Kepulauan Sangihe.',
        melonguane:
          'Halo BKHIT Sulawesi Utara (Pos Pelayanan Melonguane), saya ingin berkonsultasi mengenai pengawasan karantina di Kepulauan Talaud.',
      }
      parsed.searchParams.set(
        'text',
        siteGreetings[site] || siteGreetings.sulut,
      )
      return parsed.toString()
    } catch {
      return service.url
    }
  }

  return service.url
}
