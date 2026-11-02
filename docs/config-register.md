# Configuration Register — Portal Gate BKHIT Sulawesi Utara

Dokumen ini mencatat seluruh parameter konfigurasi Portal Gate sesuai PRD §20, §34, dan §35.

## 1. Service Target Register (`src/config/services.ts`)

| Key | Label | Nilai Saat Ini | Status | Catatan |
|---|---|---|---|---|
| `ptk` | Akses Layanan Karantina (PTK Online) | `https://ptk.karantinaindonesia.go.id/` | **LOCKED** | URL resmi PTK Online Badan Karantina Indonesia |
| `qdi` | Decision Intelligence (QDI) | `https://qdi.karantinaindonesia.go.id/` | **VERIFY** | Sesuaikan `VITE_QDI_URL` dengan URL production QDI sebelum UAT |
| `whatsapp` | Tanya Karantina (WhatsApp Resmi) | `https://wa.me/6282190899090?...` | **LOCKED** | WA Center Karantina Sulawesi Utara (0821-9089-9090) |

## 2. Site Context Register (`src/config/sites.ts`)

| Site Key | Query Parameter | Display Label | Hero Asset |
|---|---|---|---|
| `sulut` | `?site=sulut` (default) | Sulawesi Utara | `/hero/sulut.svg` |
| `siau` | `?site=siau` | Siau — Kepulauan Sitaro | `/hero/siau.svg` |
| `tahuna` | `?site=tahuna` | Tahuna — Kepulauan Sangihe | `/hero/tahuna.svg` |
| `melonguane` | `?site=melonguane` | Melonguane — Kepulauan Talaud | `/hero/melonguane.svg` |

## 3. Environment Variables (`src/config/env.ts`)

Seluruh variabel `VITE_*` bersifat publik/non-rahasia (**dilarang menyimpan secret di frontend** — PRD §18.3):

| Variabel | Default | Fungsi |
|---|---|---|
| `VITE_BASE_PATH` | `/` | Base path aplikasi (root domain atau subpath GitHub Pages) |
| `VITE_CONTENT_PROJECTION_URL` | `/content/sample.json` | Endpoint JSON *Published Projection* dari SharePoint |
| `VITE_EVENT_ENDPOINT` | `/api/events` | Endpoint penerima event analytics ringan |
| `VITE_RELEASE_VERSION` | `2.0.0-baseline` | Identitas versi rilis untuk auditability |
| `VITE_PTK_URL` | `https://ptk.karantinaindonesia.go.id/` | URL resmi PTK Online |
| `VITE_QDI_URL` | `https://qdi.karantinaindonesia.go.id/` | URL resmi QDI |
| `VITE_QDI_DEEPLINK_ENABLED` | `false` | Aktifkan (`true`) hanya bila QDI mendukung deep-link region |
| `VITE_WA_URL` | `https://wa.me/6282190899090...` | Link kanal WhatsApp resmi (WA Center BKHIT Sulut) |

## 4. Phase 5 Measurement & Control Scripts (`package.json`)

| Script Command | File Lokasi | Fungsi Sesuai PRD |
|---|---|---|
| `npm run analytics:sample` | `scripts/generate-sample-events.mjs` | Menghasilkan berkas event log simulasi tanpa PII (PRD §14.2 & §14.4) |
| `npm run analytics:aggregate` | `scripts/aggregate-analytics.mjs` | Menyusun tabel rekapitulasi analitik resmi per periode & wilayah (PRD §14.5) |
| `npm run check:secrets` | `scripts/secret-scan.mjs` | Memindai source & build dari kebocoran kredensial (UAT-20, PRD §18.3) |
| `npm run check:contrast` | `scripts/contrast-check.mjs` | Memverifikasi kepatuhan rasio kontras warna WCAG (NFR-04) |
| `npm run audit:release` | `scripts/release-audit.mjs` | Menjalankan audit rilis penuh dan menerbitkan bukti rilis (PRD §35) |

