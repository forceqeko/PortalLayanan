# Panduan Integrasi Router / Captive Portal (PRD §23, ARCH-03)

## 1. URL Redirect per Titik Layanan (§23.1)

Konfigurasikan *landing page / post-auth redirect URL* pada router/Access Point di masing-masing titik layanan sebagai berikut:

| Titik Layanan | Target Redirect URL |
|---|---|
| **Siau (Sitaro)** | `https://<portal-domain>/?site=siau` |
| **Tahuna (Sangihe)** | `https://<portal-domain>/?site=tahuna` |
| **Melonguane (Talaud)** | `https://<portal-domain>/?site=melonguane` |

## 2. Aturan Keamanan & Privasi (§23.2)

1. Router **hanya** mengirimkan parameter konteks lokasi (`?site=siau`, `?site=tahuna`, atau `?site=melonguane`).
2. **Dilarang** menyertakan identitas pribadi, MAC address (`$(mac)`), IP lokal, nomor telepon, username, atau token di dalam URL redirect.
3. Apabila parameter `site` tidak ada atau berisi nilai di luar allowlist (`siau`, `tahuna`, `melonguane`, `sulut`), Portal otomatis melakukan fallback ke konteks `sulut`.

