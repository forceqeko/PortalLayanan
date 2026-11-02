/**
 * Generator Data Uji Analitik (PRD §14.1, §14.2 & §14.4)
 * Menghasilkan berkas log event realistis tanpa PII (Zero PII)
 * untuk pengujian agregasi metrik pemanfaatan portal.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SITES = ['sulut', 'siau', 'tahuna', 'melonguane']
const ENTRY_SOURCES = ['captive_portal', 'direct', 'referral']
const DEVICE_CLASSES = ['mobile', 'tablet', 'desktop']

const EVENTS_DISTRIBUTION = [
  { name: 'portal_view', weight: 45 },
  { name: 'ptk_redirect', weight: 22, target: 'ptk' },
  { name: 'qdi_redirect', weight: 10, target: 'qdi' },
  { name: 'content_view', weight: 12, target: 'content' },
  { name: 'whatsapp_click', weight: 8, target: 'whatsapp' },
  { name: 'site_switch', weight: 3, target: 'switch' },
]

const SAMPLE_CONTENT_SLUGS = [
  'panduan-permohonan-ptk-online',
  'jadwal-layanan-pelabuhan-ulow-ondong-siau',
  'pelayanan-sertifikasi-komoditas-pelabuhan-tahuna',
  'pengawasan-karantina-talaud-melonguane',
  'alur-karantina-ikan-sulut',
]

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

function getWeightedEvent() {
  const totalWeight = EVENTS_DISTRIBUTION.reduce((acc, curr) => acc + curr.weight, 0)
  let randomWeight = Math.random() * totalWeight

  for (const item of EVENTS_DISTRIBUTION) {
    if (randomWeight < item.weight) {
      return item
    }
    randomWeight -= item.weight
  }
  return EVENTS_DISTRIBUTION[0]
}

export function generateSampleLog(eventCount = 420) {
  const records = []
  const baseTime = new Date('2026-11-01T06:00:00.000Z').getTime()
  const durationMs = 2 * 24 * 60 * 60 * 1000 // 2 hari rentang simulasi

  for (let i = 0; i < eventCount; i++) {
    const eventDef = getWeightedEvent()
    const site = randomElement(SITES)
    const timestamp = new Date(baseTime + Math.random() * durationMs).toISOString()
    const sessionId = generateSessionId()
    const source = site === 'sulut' ? randomElement(['direct', 'referral']) : 'captive_portal'
    const device = randomElement(DEVICE_CLASSES)

    let target = eventDef.target || ''
    let contentId = undefined

    if (eventDef.name === 'content_view') {
      contentId = randomElement(SAMPLE_CONTENT_SLUGS)
      target = `content/${contentId}`
    } else if (eventDef.name === 'site_switch') {
      const targetSite = randomElement(SITES.filter((s) => s !== site))
      target = targetSite
    }

    const event = {
      event_name: eventDef.name,
      timestamp,
      session_id: sessionId,
      site_context: site,
      entry_source: source,
      target,
      ...(contentId ? { content_id: contentId } : {}),
      device_class: device,
      release_version: '2.0.0-baseline',
    }

    records.push(JSON.stringify(event))
  }

  // Sort chronological
  records.sort((a, b) => {
    const tA = JSON.parse(a).timestamp
    const tB = JSON.parse(b).timestamp
    return tA.localeCompare(tB)
  })

  return records.join('\n')
}

// Execution
const outputDir = join(process.cwd(), 'logs')
mkdirSync(outputDir, { recursive: true })

const outputPath = join(outputDir, 'events-sample.jsonl')
const sampleContent = generateSampleLog(500)
writeFileSync(outputPath, sampleContent, 'utf-8')

console.log(`[SAMPLE_EVENTS] Berhasil membuat 500 event sampel tanpa PII di: ${outputPath}`)

