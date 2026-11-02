# SOP Pengelolaan & Publikasi Konten PPID/Humas (PRD §10, §11, §26 #6 & #14)

SOP ini menjadi panduan bagi personel **PPID / Kehumasan BKHIT Sulawesi Utara** untuk menambah, memperbarui, dan mempublikasikan konten pada Portal Gate **tanpa mengubah source code atau melakukan build ulang**.

## 1. Alur Kerja Publikasi

1. **Buka SharePoint Online** pada situs resmi BKHIT Sulawesi Utara, lalu pilih daftar (*List*) **Konten Portal Gate**.
2. **Tambah atau Perbarui Item** dengan mengisi kolom berikut:
   - `title`: Judul pengumuman/panduan yang jelas dan ringkas.
   - `slug`: Kata kunci URL huruf kecil dengan tanda hubung (contoh: `jadwal-layanan-siau`).
   - `summary`: Ringkasan 1–2 kalimat yang akan tampil pada kartu halaman depan.
   - `body`: Isi lengkap informasi atau panduan.
   - `site_scope`: Pilih `GLOBAL` untuk seluruh Sulawesi Utara, atau pilih `SIAU`, `TAHUNA`, atau `MELONGUANE` untuk pengumuman spesifik lokasi.
   - `content_type`: Pilih `announcement`, `article`, `service`, `faq`, atau `document`.
   - `status`: Pilih `DRAFT` saat masih menyusun draf.
3. **Validasi Substansi (Bila Diperlukan)**:
   - Jika konten memuat persyaratan teknis Karantina Hewan (KH), Karantina Ikan (KI), atau Karantina Tumbuhan (KT), ubah `status` menjadi `VALIDATION` untuk ditinjau pejabat fungsional/validator terkait.
   - Setelah disetujui, ubah `status` menjadi `APPROVED`.
4. **Publikasi ke Portal**:
   - Ubah `status` menjadi `PUBLISHED` dan pastikan `publish_at` sudah terisi.
   - Workflow publikasi akan mengekspor item berstatus `PUBLISHED` ke berkas *Published Projection* JSON publik.
5. **Pengarsipan**:
   - Untuk menurunkan konten dari Portal tanpa menghapus riwayatnya, ubah `status` menjadi `ARCHIVED` atau isi tanggal `expire_at`.

## 2. Prinsip Keamanan Konten

- Konten dengan status `DRAFT`, `VALIDATION`, `APPROVED`, atau `ARCHIVED` **tidak akan ditampilkan** di Portal publik (`FR-012`).
- Jangan pernah memasukkan data pribadi pemohon, kredensial internal, atau tautan tidak resmi ke dalam isi konten publik.

