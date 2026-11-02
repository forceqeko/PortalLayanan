# Content Architecture & Publication Contract (PRD §10, §11, §12, §21)

## 1. Prinsip Arsitektur Konten (`ARCH-05`)

- **SharePoint Online / M365** adalah *Single Source of Truth* (SSOT) editorial untuk PPID/Humas.
- **Published Projection (JSON)** adalah data publik yang telah disanitasi dan hanya memuat item berstatus `PUBLISHED`.
- **Portal Gate** hanya membaca *Published Projection* dan **tidak pernah** mengakses SharePoint secara langsung dari browser publik.

## 2. Struktur Kolom SharePoint List (§12 Content Data Model)

| Field | Tipe | Nilai / Fungsi |
|---|---|---|
| `id` | String | Identifier unik konten |
| `slug` | String | Identifier URL / logical key (contoh: `panduan-permohonan-ptk-online`) |
| `title` | String | Judul konten |
| `summary` | Text | Ringkasan singkat untuk kartu di beranda |
| `body` | Multiline Text | Isi lengkap informasi / panduan |
| `category` | Choice | `service` / `announcement` / `article` / `faq` / `document` |
| `site_scope` | Choice | `GLOBAL` / `SIAU` / `TAHUNA` / `MELONGUANE` |
| `content_type` | Choice | `article` / `announcement` / `faq` / `service` / `document` / `media` |
| `source` | String | Sumber substansi (internal) |
| `owner` | Person/String | Pemilik substansi (internal) |
| `validator` | Person/String | Validator teknis KH/KI/KT bila diperlukan (internal) |
| `status` | Choice | `DRAFT` / `VALIDATION` / `APPROVED` / `PUBLISHED` / `ARCHIVED` |
| `media_url` | URL | Referensi media publik (Blob/Object storage) bila ada |
| `publish_at` | DateTime | Waktu mulai publikasi |
| `expire_at` | DateTime | Waktu kedaluwarsa (opsional) |
| `updated_at` | DateTime | Waktu pembaruan terakhir |
| `sort_order` | Number | Urutan prioritas tampilan (angka kecil tampil lebih dulu) |

## 3. Workflow Publikasi (§11 & §15.1)

1. `Draft` → dibuat oleh PPID/Humas di SharePoint List.
2. `Validation` → ditinjau substansi teknis (KH/KI/KT) bila diperlukan.
3. `Approved` → disetujui untuk tayang.
4. `Published` → proses otomatis (**Logic Apps** sebagai *preferred*, atau **Azure Function + Microsoft Graph** sebagai *fallback*) mengekstrak item dengan `status == 'PUBLISHED'`, membuang metadata internal (`owner`, `validator`, `source`), lalu menulis berkas JSON *Published Projection*.

## 4. Skema JSON Published Projection (§21)

```json
{
  "generatedAt": "2026-10-20T12:00:00Z",
  "items": [
    {
      "id": "cnt-001",
      "slug": "persyaratan-layanan",
      "title": "Persyaratan Layanan",
      "summary": "Ringkasan publik...",
      "body": "Isi lengkap publik...",
      "category": "service",
      "siteScope": "GLOBAL",
      "contentType": "service",
      "status": "PUBLISHED",
      "mediaUrl": null,
      "publishAt": "2026-10-01T00:00:00Z",
      "expireAt": null,
      "updatedAt": "2026-10-20T10:00:00Z",
      "sortOrder": 1
    }
  ]
}
```

