# Panduan Setup Sanity.io Headless CMS (Phase 4B - Tanpa Biaya)

Dokumen ini menjelaskan cara menghubungkan halaman **Pusat Informasi & Sosialisasi** pada Portal Gate BKHIT Sulawesi Utara ke **Sanity.io Headless CMS (Free Tier)** untuk mengelola **Teks Berita, Foto, Video (`.mp4`), dan Dokumen (`.pdf`)** dalam satu dashboard terpadu.

---

## 1. Keunggulan & Jaminan Keamanan

1. **Biaya Rp 0 (Paket Gratis Selamanya)**:
   - Kapasitas penyimpanan aset gratis hingga **10 GB** (cukup untuk ratusan video edukasi `.mp4` dan ribuan foto).
   - Bandwidth Global Edge CDN gratis **10 GB / bulan** dengan kecepatan respon < 80ms.
   - Mendukung hingga **20 akun pengguna admin**.
2. **Satu Form Terpadu**:
   - Staf Humas/PPID cukup mengisi 1 form untuk Judul, Ringkasan, Isi, Wilayah (`GLOBAL`, `SIAU`, `TAHUNA`, `MELONGUANE`), Upload Foto, Upload Video `.mp4`, dan Upload PDF.
3. **100% Aman untuk GitHub Publik**:
   - Aplikasi frontend hanya menggunakan `VITE_SANITY_PROJECT_ID` dan `VITE_SANITY_DATASET` (bersifat *Public Read-Only*).
   - Tidak ada *API Token* atau kredensial tulis di dalam kode repositori.
   - Dokumen yang belum diklik **Publish** (`drafts.*`) dikunci otomatis oleh server Sanity dan disaring berlapis oleh [`src/content/sanityAdapter.ts`](file:///d:/Project/PortalLayanan/src/content/sanityAdapter.ts).

---

## 2. Langkah Cepat Membuat Proyek Sanity (5 Menit)

### Langkah A: Buat Akun & Proyek Gratis di Sanity.io
1. Buka [https://www.sanity.io/](https://www.sanity.io/) dan daftar menggunakan akun Google atau GitHub.
2. Buat proyek baru (*Create New Project*), beri nama misalnya `BKHIT Sulawesi Utara`, dan pilih dataset `production`.
3. Salin **Project ID** Anda (contoh: `a1b2c3d4`) dari halaman dashboard proyek Sanity.

### Langkah B: Izinkan Domain Vercel pada Pengaturan CORS Sanity
1. Di dashboard Sanity (`sanity.io/manage`), buka menu **API** -> **CORS origins**.
2. Klik **Add CORS origin**:
   - Masukkan URL domain Vercel Anda (misal `https://portal-layanan-bkhit.vercel.app`) dan `http://localhost:5173`.
   - Biarkan opsi *Allow credentials* **tidak dicentang** (karena akses publik bersifat *Read-Only*).

### Langkah C: Pasang Skema Form Konten BKHIT
Saat Anda menginisialisasi Sanity Studio (`npm create sanity@latest`), salin file skema yang sudah disediakan di repositori ini:
- [`sanity/schemaTypes/karantinaContent.ts`](file:///d:/Project/PortalLayanan/sanity/schemaTypes/karantinaContent.ts)

Masukkan `karantinaContentSchema` ke dalam daftar `schema.types` di `sanity.config.ts` Anda, lalu jalankan `npx sanity deploy` untuk mempublikasikan Dashboard Admin Studio Anda secara gratis di `https://bkhit-sulut.sanity.studio`.

### Langkah D: Aktifkan di Vercel
1. Buka dashboard **Vercel** proyek Portal Layanan Anda.
2. Masuk ke **Settings** -> **Environment Variables**.
3. Tambahkan variabel berikut:
   - `VITE_SANITY_PROJECT_ID` = *(Project ID Sanity Anda)*
   - `VITE_SANITY_DATASET` = `production`
4. Lakukan **Redeploy** satu kali. Setelah itu, setiap kali admin mengklik **Publish** di Sanity Studio, berita, foto, video, dan PDF akan langsung tampil di halaman `/informasi` tanpa perlu deploy ulang!

---

## 3. Pengujian & Backup via CLI

Repositori ini dilengkapi perintah CLI untuk menguji transformasi maupun mengunduh salinan cadangan (*backup*) konten ke file lokal:

```bash
# 1. Uji simulasi adapter Sanity secara offline (memastikan draf diblokir 100%)
npm run sync:sanity:mock

# 2. Tarik dan simpan backup konten live dari Sanity ke file JSON lokal
VITE_SANITY_PROJECT_ID=id_proyek_anda npm run sync:sanity -- --out=public/content/projection.json
```

