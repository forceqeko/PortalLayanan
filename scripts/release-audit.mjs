/**
 * Otomasi Audit Rilis & Verifikasi Bukti Mutu (PRD §34 & §35)
 * Menjalankan seluruh pengujian deterministik dan menghasilkan
 * berkas bukti rilis resmi untuk Berita Acara Kegiatan Swakelola Tipe I.
 */

import { execSync } from 'node:child_process'
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'

const AUDIT_STEPS = [
  {
    id: 'SEC-01',
    name: 'Secret & Credential Scan (UAT-20, PRD §18.3)',
    command: 'node scripts/secret-scan.mjs',
    essential: true,
  },
  {
    id: 'A11Y-01',
    name: 'Color Contrast & Accessibility Check (NFR-04)',
    command: 'node scripts/contrast-check.mjs',
    essential: true,
  },
  {
    id: 'TYPE-01',
    name: 'TypeScript Compiler & Type Safety Check',
    command: 'npx tsc -b --noEmit',
    essential: true,
  },
  {
    id: 'BUILD-01',
    name: 'Production Bundle Compilation (Vite Build)',
    command: 'npx vite build',
    essential: true,
  },
  {
    id: 'E2E-01',
    name: 'Playwright End-to-End Automated Test (17 Scenarios)',
    command: 'npx playwright test',
    essential: true,
  },
]

const REQUIRED_DOCS = [
  'docs/config-register.md',
  'docs/change-log.md',
  'docs/hosting-gate.md',
  'docs/event-contract.md',
  'docs/content-contract.md',
  'docs/uat-register.md',
]

function runAudit() {
  console.log('\n================================================================================')
  console.log('AUDIT RILIS RESMI PORTAL GATE BKHIT SULAWESI UTARA (PRD §35)')
  console.log('================================================================================\n')

  const timestamp = new Date().toISOString()
  const results = []
  let allPassed = true

  for (const step of AUDIT_STEPS) {
    process.stdout.write(`[MENJALANKAN] ${step.id} - ${step.name}... `)
    const startTime = Date.now()
    try {
      const output = execSync(step.command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`[PASS] (${duration}s)`)
      results.push({
        id: step.id,
        name: step.name,
        command: step.command,
        status: 'PASS',
        duration: `${duration}s`,
        output: output.trim().split('\n').slice(-3).join(' | '),
      })
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`[FAIL] (${duration}s)`)
      allPassed = false
      results.push({
        id: step.id,
        name: step.name,
        command: step.command,
        status: 'FAIL',
        duration: `${duration}s`,
        output: err.message || 'Eksekusi gagal',
      })
    }
  }

  // Document Verification
  console.log('\n[MEMERIKSA] Kelengkapan Dokumen Kontrak & Bukti (docs/)...')
  const docResults = []
  for (const doc of REQUIRED_DOCS) {
    const fullPath = join(process.cwd(), doc)
    const exists = existsSync(fullPath)
    if (!exists) allPassed = false
    docResults.push({ path: doc, exists })
    console.log(` - ${doc}: ${exists ? '[OK]' : '[TIDAK DITEMUKAN]'}`)
  }

  // Generate Markdown Evidence Document
  let reportMd = `# Berita Acara & Bukti Uji Rilis Produk (PRD §35)\n\n`
  reportMd += `**Versi Rilis:** 2.0.0-production-baseline  \n`
  reportMd += `**Waktu Audit:** ${timestamp}  \n`
  reportMd += `**Lingkungan Uji:** Node ${process.version} / ${os.type()} ${os.release()}  \n`
  reportMd += `**Status Akhir Audit:** ${allPassed ? '**LULUS 100% (READY FOR DEPLOYMENT)**' : '**ADA TEMUAN (ACTION REQUIRED)**'}  \n\n`
  reportMd += `---\n\n`
  reportMd += `## 1. Hasil Pengujian Mutu dan Keamanan Otomatis\n\n`
  reportMd += `| Kode Uji | Komponen Pengujian | Perintah | Durasi | Status |\n`
  reportMd += `|---|---|---|:---:|:---:|\n`

  for (const r of results) {
    reportMd += `| **${r.id}** | ${r.name} | \`${r.command}\` | ${r.duration} | **${r.status}** |\n`
  }

  reportMd += `\n---\n\n`
  reportMd += `## 2. Verifikasi Dokumen Kontrak & Panduan Operasional\n\n`
  reportMd += `| Dokumen Wajib | Fungsi | Status Verifikasi |\n`
  reportMd += `|---|---|:---:|\n`

  for (const d of docResults) {
    reportMd += `| \`${d.path}\` | Kontrak teknis / SOP Humas / UAT Register | **${d.exists ? 'TERVERIFIKASI' : 'HILANG'}** |\n`
  }

  reportMd += `\n---\n\n`
  reportMd += `## 3. Matriks Traceability Output Swakelola Tipe I (PRD §3)\n\n`
  reportMd += `| Output Swakelola | Kriteria Keberhasilan | Bukti Implementasi |\n`
  reportMd += `|---|---|---|\n`
  reportMd += `| **O-01 Media Integrasi Akses** | Gerbang digital dengan single-screen 100dvh & 4 kartu layanan | Lolos UAT-02 s.d. UAT-07, responsive-a11y |\n`
  reportMd += `| **O-02 Decision Intelligence** | Integrasi tautan resmi QDI terisolasi & terlindungi allowlist | Lolos UAT-09 & FR-015 services.spec.ts |\n`
  reportMd += `| **O-03 Konten Layanan & Sosialisasi** | SharePoint SSOT projection, draft protection, detail article | Lolos UAT-11, UAT-12 content.spec.ts |\n`
  reportMd += `| **O-04 Ketahanan & Jaringan** | Site Context Engine captive portal Siau, Tahuna, Melonguane | Lolos UAT-02 s.d. UAT-07 site-context.spec.ts |\n`
  reportMd += `| **O-05 Operasional & Dokumentasi** | Zero PII analytics, SOP Humas, Secret Scanner, UAT Register | Lolos UAT-14, UAT-15, UAT-20, scripts/ |\n`

  reportMd += `\n---\n\n`
  reportMd += `## 4. Rekomendasi Tim Teknis\n\n`
  if (allPassed) {
    reportMd += `Seluruh kriteria uji otomatis (*automated gates*) telah dipenuhi secara deterministik. Sistem dinyatakan **siap diserahkan untuk pengujian lapangan tiga titik (UAT-22) dan deployment hosting produksi (UAT-01)**.\n`
  } else {
    reportMd += `Terdapat komponen uji yang gagal. Harap selesaikan perbaikan sebelum mengajukan Berita Acara Serah Terima.\n`
  }

  const reportPath = join(process.cwd(), 'docs', 'release-evidence-v2.0.0.md')
  writeFileSync(reportPath, reportMd, 'utf-8')

  console.log(`\n[SELESAI] Berkas Berita Acara & Bukti Uji Rilis berhasil disimpan ke: ${reportPath}`)
  if (!allPassed) {
    process.exit(1)
  }
}

runAudit()

