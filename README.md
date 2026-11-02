# Portal Gate — BKHIT Sulawesi Utara

**Geo-Aware Digital Gateway untuk Akses Layanan dan Informasi Karantina**  
Implementasi deterministik berdasarkan [PRD Portal Gate BKHIT Sulawesi Utara v2.0](./PRD_Portal_Gate_BKHIT_Sulut_v2_Deterministik.md).

---

## 1. Gambaran Cepat (Maintainability — `NFR-07`)

Portal Gate adalah satu *codebase* landing page ringan berbasis **React 19 + TypeScript + Vite + Tailwind CSS 4 + Motion** yang berfungsi sebagai pintu akses digital dari jaringan titik layanan kepulauan (**Siau**, **Tahuna**, **Melonguane**) maupun akses langsung (**Sulawesi Utara**) menuju:

1. **PTK Online / Core Karantina** (`https://ptk.karantinaindonesia.go.id/`)
2. **Quarantine Decision Intelligence (QDI)**
3. **Informasi & Sosialisasi PPID/Humas** (melalui *Published Projection* JSON)
4. **Kanal WhatsApp Resmi BKHIT Sulawesi Utara**

### Peta Konfigurasi & Kontrak Penting

| Kebutuhan | Lokasi Berkas | Dokumentasi |
|---|---|---|
| Konfigurasi Wilayah (`sulut`, `siau`, `tahuna`, `melonguane`) | [`src/config/sites.ts`](./src/config/sites.ts) | [`docs/config-register.md`](./docs/config-register.md) |
| Konfigurasi URL Layanan (`ptk`, `qdi`, `whatsapp`) | [`src/config/services.ts`](./src/config/services.ts) | [`docs/config-register.md`](./docs/config-register.md) |
| Mesin Resolusi Lokasi (Site Context Engine) | [`src/context/site-context.tsx`](./src/context/site-context.tsx) | [`docs/router-captive.md`](./docs/router-captive.md) |
| Kontrak & Filter Konten Publik | [`src/content/contract.ts`](./src/content/contract.ts), [`src/content/selectors.ts`](./src/content/selectors.ts) | [`docs/content-contract.md`](./docs/content-contract.md) |
| Klien & Endpoint Analytics Ringan | [`src/analytics/track.ts`](./src/analytics/track.ts), [`api/events/index.mjs`](./api/events/index.mjs) | [`docs/event-contract.md`](./docs/event-contract.md) |
| Checklist GO/NO-GO Hosting | [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) | [`docs/hosting-gate.md`](./docs/hosting-gate.md) |
| Register UAT & SOP Humas | [`tests/e2e/`](./tests/e2e) | [`docs/uat-register.md`](./docs/uat-register.md), [`docs/sop-humas.md`](./docs/sop-humas.md) |

---

## 2. Perintah Pengembangan & Verifikasi (`PRD §17`)

```bash
# Jalankan server pengembangan lokal
npm run dev

# Pemeriksaan tipe TypeScript
npm run typecheck

# Pemeriksaan kualitas kode (ESLint)
npm run lint

# Build bundel produksi
npm run build

# Pemindaian keamanan secret pada kode & bundel (UAT-20)
npm run check:secrets

# Pengujian E2E Playwright pada critical flow (UAT-02..UAT-19)
npm run test:e2e
```

