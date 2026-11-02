import { resolvePublicAsset } from './env'

export const ALLOWED_SITES = ['sulut', 'siau', 'tahuna', 'melonguane'] as const
export type SiteKey = (typeof ALLOWED_SITES)[number]

export type SiteThemeToken = {
  gradientClass: string
  codePrefix: string
}

export type ServicePointMetadata = {
  officeName: string
  regionName: string
  dropdownLabel: string
  address: string
  coveragePorts: string[]
  operationalHours: string
  contactPhone: string
  coordinatesLabel: string
  coordinates: {
    lat: number
    lng: number
  }
}

export type SiteConfig = {
  key: SiteKey
  label: string
  shortLabel: string
  heroAsset: string
  heroCaption: string
  subtitle: string
  tagline: string
  servicePointLabel: string
  localAnnouncement?: string
  metadata: ServicePointMetadata
  theme: SiteThemeToken
}

export const SITE_CONFIGS: Record<SiteKey, SiteConfig> = {
  sulut: {
    key: 'sulut',
    label: 'Sulawesi Utara',
    shortLabel: 'Sulawesi Utara',
    heroAsset: resolvePublicAsset('hero/sulut.jpg'),
    heroCaption: 'Perairan Teluk Manado dan Pulau Bunaken, Sulawesi Utara.',
    tagline: 'Portal Gerbang Akses Layanan Karantina, Informasi, dan Decision Intelligence',
    subtitle:
      'Data, layanan, dan informasi karantina untuk melindungi sumber daya hayati Sulawesi Utara.',
    servicePointLabel: 'Balai Karantina Hewan, Ikan, dan Tumbuhan Sulawesi Utara',
    localAnnouncement:
      'Pelayanan pemeriksaan dokumen dan fisik karantina beroperasi pada pelabuhan, bandara, dan pos kepulauan di Siau, Tahuna, serta Melonguane.',
    metadata: {
      officeName: 'Kantor Induk BKHIT Sulawesi Utara',
      regionName: 'Kota Manado, Sulawesi Utara',
      dropdownLabel: 'Sulawesi Utara',
      address: 'Jl. A.A. Maramis No. 283, Mapanget, Kota Manado, Sulawesi Utara',
      coveragePorts: [
        'Bandara Sam Ratulangi',
        'Pelabuhan Bitung',
        'Pelabuhan Manado',
      ],
      operationalHours: 'Senin s.d. Jumat 07.30 s.d. 16.00 WITA',
      contactPhone: '+62 821-9089-9090',
      coordinatesLabel: '01°32\'06" LU, 124°54\'43" BT',
      coordinates: { lat: 1.535, lng: 124.912 },
    },
    theme: {
      gradientClass: 'hero-gradient-sulut',
      codePrefix: 'SULUT-00',
    },
  },
  siau: {
    key: 'siau',
    label: 'Siau, Kepulauan Sitaro',
    shortLabel: 'Siau',
    heroAsset: resolvePublicAsset('hero/siau.jpg'),
    heroCaption: 'Pesisir Pulau Siau dan Gunung Karangetang di Kepulauan Sitaro.',
    tagline: 'Portal Gerbang Akses Layanan Karantina, Informasi, dan Decision Intelligence',
    subtitle:
      'Data, layanan, dan informasi karantina untuk melindungi sumber daya hayati di Kepulauan Sitaro (Siau).',
    servicePointLabel: 'Pos Pelayanan Karantina Siau (Kepulauan Sitaro)',
    localAnnouncement:
      'Pastikan pengajuan PTK Online dilakukan sebelum keberangkatan kapal dari Pelabuhan Ulu Siau dan Pelabuhan Ondong.',
    metadata: {
      officeName: 'Pos Pelayanan Karantina Siau',
      regionName: 'Kepulauan Sitaro, Sulawesi Utara',
      dropdownLabel: 'Kepulauan Sitaro, Sulawesi Utara',
      address: 'Kawasan Pelabuhan Ulu Siau, Kab. Kepulauan Sitaro',
      coveragePorts: ['Pelabuhan Ulu Siau', 'Pelabuhan Ondong', 'Pelabuhan Tagulandang'],
      operationalHours: 'Mengikuti jadwal operasional sandar kapal',
      contactPhone: '+62 821-9089-9090',
      coordinatesLabel: '02°43\'41" LU, 125°24\'29" BT',
      coordinates: { lat: 2.728, lng: 125.408 },
    },
    theme: {
      gradientClass: 'hero-gradient-siau',
      codePrefix: 'SITARO-01',
    },
  },
  tahuna: {
    key: 'tahuna',
    label: 'Tahuna, Kepulauan Sangihe',
    shortLabel: 'Tahuna',
    heroAsset: resolvePublicAsset('hero/tahuna.jpg'),
    heroCaption: 'Teluk Tahuna dan perbukitan Pulau Sangihe.',
    tagline: 'Portal Gerbang Akses Layanan Karantina, Informasi, dan Decision Intelligence',
    subtitle:
      'Data, layanan, dan informasi karantina untuk melindungi sumber daya hayati di Kepulauan Sangihe (Tahuna).',
    servicePointLabel: 'Pos Pelayanan Karantina Tahuna (Kepulauan Sangihe)',
    localAnnouncement:
      'Melayani sertifikasi komoditas perikanan, pertanian, dan peternakan di Pelabuhan Nusantara Tahuna dan Bandara Naha.',
    metadata: {
      officeName: 'Pos Pelayanan Karantina Tahuna',
      regionName: 'Kepulauan Sangihe, Sulawesi Utara',
      dropdownLabel: 'Kepulauan Sangihe, Sulawesi Utara',
      address: 'Kawasan Pelabuhan Nusantara Tahuna, Kab. Kepulauan Sangihe',
      coveragePorts: ['Pelabuhan Nusantara Tahuna', 'Pelabuhan Petta', 'Bandara Naha'],
      operationalHours: 'Mengikuti jadwal keberangkatan kapal dan penerbangan',
      contactPhone: '+62 821-9089-9090',
      coordinatesLabel: '03°36\'43" LU, 125°29\'31" BT',
      coordinates: { lat: 3.612, lng: 125.492 },
    },
    theme: {
      gradientClass: 'hero-gradient-tahuna',
      codePrefix: 'SANGIHE-02',
    },
  },
  melonguane: {
    key: 'melonguane',
    label: 'Melonguane, Kepulauan Talaud',
    shortLabel: 'Melonguane',
    heroAsset: resolvePublicAsset('hero/melonguane.jpg'),
    heroCaption: 'Perairan pesisir Melonguane di Kepulauan Talaud.',
    tagline: 'Portal Gerbang Akses Layanan Karantina, Informasi, dan Decision Intelligence',
    subtitle:
      'Data, layanan, dan informasi karantina untuk melindungi sumber daya hayati di perbatasan Kepulauan Talaud (Melonguane).',
    servicePointLabel: 'Pos Pelayanan Karantina Melonguane (Kepulauan Talaud)',
    localAnnouncement:
      'Pengawasan lalu lintas media pembawa antar-area dan perbatasan di Pelabuhan serta Bandara Melonguane.',
    metadata: {
      officeName: 'Pos Pelayanan Karantina Melonguane',
      regionName: 'Kepulauan Talaud, Sulawesi Utara',
      dropdownLabel: 'Kepulauan Talaud, Sulawesi Utara',
      address: 'Kawasan Pelabuhan Melonguane, Kab. Kepulauan Talaud',
      coveragePorts: ['Pelabuhan Melonguane', 'Bandara Melonguane', 'Pelabuhan Lirung'],
      operationalHours: 'Mengikuti jadwal operasional pelabuhan dan bandara',
      contactPhone: '+62 821-9089-9090',
      coordinatesLabel: '04°00\'07" LU, 126°40\'34" BT',
      coordinates: { lat: 4.002, lng: 126.676 },
    },
    theme: {
      gradientClass: 'hero-gradient-melonguane',
      codePrefix: 'TALAUD-03',
    },
  },
}

export const SITE_LIST: SiteConfig[] = ALLOWED_SITES.map((k) => SITE_CONFIGS[k])
export const ISLAND_SITES: SiteConfig[] = [
  SITE_CONFIGS.siau,
  SITE_CONFIGS.tahuna,
  SITE_CONFIGS.melonguane,
]
