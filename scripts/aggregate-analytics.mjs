/**
 * Aggregator Laporan Analitik Resmi (PRD §14.5 & §19)
 * Membaca event log terstruktur (JSONL) dan menyusun tabel rekapitulasi
 * pemanfaatan portal per wilayah layanan dan per periode.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SITES_ORDER = ['siau', 'tahuna', 'melonguane', 'sulut']

const SITE_LABELS = {
  siau: 'Siau (Sitaro)',
  tahuna: 'Tahuna (Sangihe)',
  melonguane: 'Melonguane (Talaud)',
  sulut: 'Sulawesi Utara (Umum)',
}

export function parseAndAggregateLogs(jsonlContent) {
  const lines = jsonlContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  // Map key: `${period}_${site}`
  const metrics = new Map()

  for (const line of lines) {
    try {
      const event = JSON.parse(line)
      if (!event.event_name || !event.timestamp) continue

      const date = new Date(event.timestamp)
      if (isNaN(date.getTime())) continue

      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const period = `${year}-${month}`

      const site = String(event.site_context || 'sulut').toLowerCase()

      const key = `${period}_${site}`
      if (!metrics.has(key)) {
        metrics.set(key, {
          period,
          site,
          portalVisit: 0,
          ptkRedirect: 0,
          qdiRedirect: 0,
          contentInteraction: 0,
          whatsAppClick: 0,
          siteSwitch: 0,
          totalInteractions: 0,
        })
      }

      const row = metrics.get(key)
      row.totalInteractions++

      switch (event.event_name) {
        case 'portal_view':
          row.portalVisit++
          break
        case 'ptk_redirect':
          row.ptkRedirect++
          break
        case 'qdi_redirect':
          row.qdiRedirect++
          break
        case 'content_view':
          row.contentInteraction++
          break
        case 'whatsapp_click':
          row.whatsAppClick++
          break
        case 'site_switch':
          row.siteSwitch++
          break
      }
    } catch {
      // Ignore unparseable lines gracefully
    }
  }

  // Convert to array and sort by Period (descending), then site order
  const results = Array.from(metrics.values())
  results.sort((a, b) => {
    if (a.period !== b.period) return b.period.localeCompare(a.period)
    const idxA = SITES_ORDER.indexOf(a.site)
    const idxB = SITES_ORDER.indexOf(b.site)
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB)
  })

  return results
}

export function formatMarkdownTable(results) {
  if (results.length === 0) {
    return 'Belum ada data event analitik untuk direkapitulasi.'
  }

  let md = '| Periode | Wilayah Layanan (Site) | Portal Visit | PTK Redirect | QDI Redirect | Content Interaction | WhatsApp Click | Total Interaksi |\n'
  md += '|---|---|---:|---:|---:|---:|---:|---:|\n'

  let sumVisit = 0
  let sumPtk = 0
  let sumQdi = 0
  let sumContent = 0
  let sumWa = 0
  let sumTotal = 0

  for (const r of results) {
    const siteLabel = SITE_LABELS[r.site] || r.site
    md += `| ${r.period} | \`${r.site}\` (${siteLabel}) | ${r.portalVisit.toLocaleString()} | ${r.ptkRedirect.toLocaleString()} | ${r.qdiRedirect.toLocaleString()} | ${r.contentInteraction.toLocaleString()} | ${r.whatsAppClick.toLocaleString()} | ${r.totalInteractions.toLocaleString()} |\n`

    sumVisit += r.portalVisit
    sumPtk += r.ptkRedirect
    sumQdi += r.qdiRedirect
    sumContent += r.contentInteraction
    sumWa += r.whatsAppClick
    sumTotal += r.totalInteractions
  }

  md += `| **TOTAL** | **Semua Wilayah** | **${sumVisit.toLocaleString()}** | **${sumPtk.toLocaleString()}** | **${sumQdi.toLocaleString()}** | **${sumContent.toLocaleString()}** | **${sumWa.toLocaleString()}** | **${sumTotal.toLocaleString()}** |\n`

  return md
}

export function formatCsv(results) {
  let csv = 'Periode,Site,Site_Label,Portal_Visit,PTK_Redirect,QDI_Redirect,Content_Interaction,WhatsApp_Click,Total_Interactions\n'
  for (const r of results) {
    const label = `"${SITE_LABELS[r.site] || r.site}"`
    csv += `${r.period},${r.site},${label},${r.portalVisit},${r.ptkRedirect},${r.qdiRedirect},${r.contentInteraction},${r.whatsAppClick},${r.totalInteractions}\n`
  }
  return csv
}

// CLI Execution Support
function main() {
  const args = process.argv.slice(2)
  let inputPath = join(process.cwd(), 'logs', 'events-sample.jsonl')

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputPath = resolve(args[i + 1])
      i++
    }
  }

  if (!existsSync(inputPath)) {
    console.error(`[ERROR] File log tidak ditemukan di: ${inputPath}`)
    console.log('Jalankan: npm run analytics:sample terlebih dahulu untuk membuat log simulasi.')
    process.exit(1)
  }

  const rawContent = readFileSync(inputPath, 'utf-8')
  const results = parseAndAggregateLogs(rawContent)

  const mdTable = formatMarkdownTable(results)
  const csvContent = formatCsv(results)

  // Save CSV to reports/ directory
  const reportsDir = join(process.cwd(), 'reports')
  mkdirSync(reportsDir, { recursive: true })

  const dateTag = new Date().toISOString().slice(0, 7) // YYYY-MM
  const csvPath = join(reportsDir, `analytics-rekap-${dateTag}.csv`)
  writeFileSync(csvPath, csvContent, 'utf-8')

  console.log('\n================================================================================')
  console.log('REKAPITULASI PEMANFAATAN DIGITAL PORTAL GATE BKHIT SULUT (PRD §14.5)')
  console.log('================================================================================\n')
  console.log(mdTable)
  console.log(`\n[EXPORT] Berkas CSV berhasil disimpan ke: ${csvPath}`)
}

if (process.argv[1] && process.argv[1].endsWith('aggregate-analytics.mjs')) {
  main()
}

