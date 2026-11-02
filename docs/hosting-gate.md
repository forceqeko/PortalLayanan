# Checklist GO / NO-GO GitHub Pages (PRD §16.4)

GitHub Pages adalah *preferred host* (`ARCH-08`). Apabila terdapat gate material di bawah ini yang tidak terpenuhi, deployment dialihkan ke fallback **Azure Static Web Apps (SWA)** tanpa mengubah arsitektur codebase.

| Gate | Syarat | Status | Bukti / Catatan |
|---|---|---|---|
| **GH-01** | Custom domain / HTTPS berfungsi | [ ] VERIFY | Cek sertifikat TLS pada domain produksi |
| **GH-02** | Captive redirect berfungsi | [ ] VERIFY | Uji dari router Siau, Tahuna, Melonguane |
| **GH-03** | `site` context berfungsi | [x] PASS | Teruji otomatis pada `tests/e2e/site-context.spec.ts` |
| **GH-04** | React/Vite production build stabil | [x] PASS | `npm run build` + `404.html` SPA fallback |
| **GH-05** | Published content dapat dibaca | [x] PASS | Teruji otomatis pada `tests/e2e/content.spec.ts` |
| **GH-06** | Analytics endpoint dapat menerima event | [x] PASS | Endpoint aktif di `api/events/index.mjs` & tervalidasi agregator |
| **GH-07** | Tidak ada secret di frontend | [x] PASS | Teruji otomatis oleh `npm run check:secrets` |
| **GH-08** | Mobile performance layak | [x] PASS | Asset SVG ringan (<5 KB), tanpa video berat/WebGL |
| **GH-09** | UAT tiga titik lulus | [ ] VERIFY | Dilaksanakan pada titik layanan Siau, Tahuna, Melonguane |

