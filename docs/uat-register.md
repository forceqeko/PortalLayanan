# Register UAT — Portal Gate BKHIT Sulawesi Utara (PRD §24 & §25)

## 1. Daftar Uji Penerimaan (UAT-01 s.d. UAT-24)

| ID | Test | Kriteria PASS | Verifikasi Otomatis / Lapangan | Status |
|---|---|---|---|---|
| UAT-01 | Production URL | HTTPS dapat diakses | Lapangan / DNS | PENDING |
| UAT-02 | Siau captive redirect | Masuk Portal dengan `site=siau` | `site-context.spec.ts` + Lapangan | PASS (Simulasi) |
| UAT-03 | Tahuna captive redirect | Masuk Portal dengan `site=tahuna` | `site-context.spec.ts` + Lapangan | PASS (Simulasi) |
| UAT-04 | Melonguane captive redirect | Masuk Portal dengan `site=melonguane` | `site-context.spec.ts` + Lapangan | PASS (Simulasi) |
| UAT-05 | Direct access | Tanpa `site` tampil Sulawesi Utara | `site-context.spec.ts` | PASS |
| UAT-06 | Geo visual | Tiap site menampilkan context regional sesuai | `site-context.spec.ts` | PASS |
| UAT-07 | Manual switch | Lokasi dapat diganti tanpa error | `site-context.spec.ts` | PASS |
| UAT-08 | PTK | Official target URL (`https://ptk.karantinaindonesia.go.id/`) terbuka | `services.spec.ts` | PASS |
| UAT-09 | QDI | Target QDI terbuka | `services.spec.ts` | PASS |
| UAT-10 | Humas publish | Konten dapat dipublish tanpa edit source | SOP Humas + Uji Tenant | PENDING |
| UAT-11 | Draft protection | Draft tidak terlihat publik | `content.spec.ts` | PASS |
| UAT-12 | Content site scope | GLOBAL/lokal tampil sesuai context | `content.spec.ts` | PASS |
| UAT-13 | WA entry | Kanal WhatsApp resmi terbuka | `services.spec.ts` | PASS |
| UAT-14 | Analytics | Event minimum tercatat | `analytics.spec.ts` | PASS |
| UAT-15 | No PII | Tidak ada PII baseline pada event | `analytics.spec.ts` | PASS |
| UAT-16 | Responsive | Fungsi utama lulus mobile & desktop | `responsive-a11y.spec.ts` | PASS |
| UAT-17 | Reduced motion | Accessibility setting dihormati | `responsive-a11y.spec.ts` | PASS |
| UAT-18 | Content failure | CTA utama tetap berfungsi saat konten gagal | `resilience.spec.ts` | PASS |
| UAT-19 | Invalid site | Fallback ke Sulawesi Utara | `site-context.spec.ts` | PASS |
| UAT-20 | Secret scan | Tidak ada secret pada client bundle/repo public | `scripts/secret-scan.mjs` | PASS |
| UAT-21 | Institutional control | Recovery/admin access institusional tersedia | Pemeriksaan Institusi | PENDING |
| UAT-22 | Three-site E2E | Uji nyata dilakukan dari tiga titik | Uji Lapangan Siau/Tahuna/Melonguane | PENDING |
| UAT-23 | Evidence | Tiap test memiliki bukti dan status | Lembar Bukti §2 di bawah | PENDING |
| UAT-24 | Closure | Tidak ada temuan kritis/material terbuka | Berita Acara Closure | PENDING |

---

## 2. Template Lembar Bukti UAT per Test Case (§25)

Salin tabel berikut untuk setiap pencatatan bukti uji lapangan:

| Field | Isi |
|---|---|
| **Test ID** | UAT-xx |
| **Date/Time** | YYYY-MM-DD HH:mm WITA |
| **Site** | Siau / Tahuna / Melonguane / Remote |
| **Tester** | Nama & Jabatan Penguji |
| **Preconditions** | Kondisi awal sebelum pengujian |
| **Action** | Langkah pengujian yang dilakukan |
| **Expected** | Hasil yang diharapkan sesuai PRD |
| **Actual** | Hasil aktual yang ditemukan |
| **Status** | PASS / FAIL |
| **Evidence** | Tautan screenshot / log / video |
| **Finding ID** | Diisi bila status FAIL |
| **Corrective Action** | Tindakan perbaikan bila ada temuan |
| **Retest** | Hasil pengujian ulang |
| **Closure** | Closed / Open |

