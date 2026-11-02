# Lightweight Analytics & Event Contract (PRD §14)

## 1. Event Baseline (§14.1)

Portal Gate mencatat tepat 6 event dasar:

1. `portal_view` — saat halaman Portal dibuka.
2. `ptk_redirect` — saat pengguna menekan CTA menuju PTK Online.
3. `qdi_redirect` — saat pengguna menekan CTA menuju QDI.
4. `content_view` — saat pengguna membuka/membaca konten publik.
5. `whatsapp_click` — saat pengguna menekan CTA "Tanya Karantina".
6. `site_switch` — saat pengguna mengganti konteks lokasi wilayah.

## 2. Skema Event (§14.2)

```json
{
  "event_name": "ptk_redirect",
  "timestamp": "2026-10-21T12:00:00.000Z",
  "session_id": "a1b2c3d4-e5f6-4789-8012-3456789abcde",
  "site_context": "tahuna",
  "entry_source": "captive_portal",
  "target": "ptk",
  "device_class": "mobile",
  "release_version": "2.0.0-baseline"
}
```

Untuk event `content_view`, disertakan field opsional `content_id`.

## 3. Larangan Pencatatan PII (§14.4, UAT-15)

Event client (`src/analytics/track.ts`) dan endpoint (`api/events/index.mjs`) **tidak pernah** mencatat atau menyimpan:
- Nama, NIK, nomor telepon, atau alamat email;
- MAC address perangkat;
- Titik koordinat GPS presisi (`latitude` / `longitude`);
- Isi percakapan WhatsApp;
- Kredensial atau data transaksi PTK Online.

## 4. Format Rekapitulasi (§14.5)

| Periode | Site | Portal Visit | PTK Redirect | QDI Redirect | Content Interaction | WhatsApp Click |
|---|---|---:|---:|---:|---:|---:|
| YYYY-MM | `siau` | 0 | 0 | 0 | 0 | 0 |
| YYYY-MM | `tahuna` | 0 | 0 | 0 | 0 | 0 |
| YYYY-MM | `melonguane` | 0 | 0 | 0 | 0 | 0 |
| YYYY-MM | `sulut` | 0 | 0 | 0 | 0 | 0 |

