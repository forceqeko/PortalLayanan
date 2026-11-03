/**
 * Skema Sanity Studio: Konten Informasi, Edukasi & Galeri Karantina BKHIT Sulawesi Utara
 * Mendukung pengelolaan Teks, Foto (Auto-WebP), Video (.mp4), dan Dokumen (.pdf) dalam 1 Form Terpadu.
 */

export const karantinaContentSchema = {
  name: 'karantinaContent',
  title: 'Konten Informasi & Sosialisasi BKHIT',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Judul Informasi / Pengumuman',
      type: 'string',
      description: 'Judul utama yang tampil di kartu berita dan halaman rincian.',
      validation: (Rule: { required: () => { min: (n: number) => { max: (n: number) => unknown } } }) =>
        Rule.required().min(5).max(160),
    },
    {
      name: 'slug',
      title: 'Slug URL (Klik Generate)',
      type: 'slug',
      description: 'Klik tombol Generate untuk membuat alamat URL otomatis dari judul.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'siteScope',
      title: 'Cakupan Wilayah Layanan (Site Scope)',
      type: 'string',
      description: 'Pilih GLOBAL jika informasi berlaku untuk seluruh Sulawesi Utara, atau pilih pulau spesifik.',
      initialValue: 'GLOBAL',
      options: {
        list: [
          { title: 'Sulawesi Utara (GLOBAL - Tampil di Semua Titik)', value: 'GLOBAL' },
          { title: 'Pelabuhan Siau (Kep. Sitaro)', value: 'SIAU' },
          { title: 'Pelabuhan Tahuna (Kep. Sangihe)', value: 'TAHUNA' },
          { title: 'Pelabuhan Melonguane (Kep. Talaud)', value: 'MELONGUANE' },
        ],
        layout: 'radio',
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Kategori Konten',
      type: 'string',
      initialValue: 'announcement',
      options: {
        list: [
          { title: 'Pengumuman Resmi (Announcement)', value: 'announcement' },
          { title: 'Artikel & Berita Kegiatan (Article)', value: 'article' },
          { title: 'Panduan Layanan (Service)', value: 'service' },
          { title: 'Tanya Jawab / Edukasi (FAQ)', value: 'faq' },
          { title: 'Dokumen & Regulasi (Document)', value: 'document' },
        ],
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Ringkasan Singkat',
      type: 'text',
      rows: 3,
      description: 'Ringkasan 1-2 kalimat yang muncul pada kartu halaman depan Informasi.',
      validation: (Rule: { required: () => { max: (n: number) => unknown } }) =>
        Rule.required().max(320),
    },
    {
      name: 'body',
      title: 'Isi Lengkap Berita / Keterangan Dokumentasi',
      type: 'text',
      rows: 10,
      description: 'Pisahkan antar paragraf dengan baris kosong (Enter 2x).',
    },
    {
      name: 'mediaImage',
      title: 'Upload Foto Dokumentasi / Thumbnail Video',
      type: 'image',
      description: 'Unggah foto kegiatan (.jpg, .png, .webp). Otomatis dikompres oleh CDN Sanity agar hemat kuota.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'videoFile',
      title: 'Upload Video Edukasi / Dokumentasi (.mp4 / .webm) - Opsional',
      type: 'file',
      description: 'Unggah file video langsung di sini. Jika diisi, artikel akan menampilkan Pemutar Video HTML5.',
      options: {
        accept: 'video/mp4,video/webm',
      },
    },
    {
      name: 'documentFile',
      title: 'Upload Lampiran Dokumen Resmi (.pdf) - Opsional',
      type: 'file',
      description: 'Unggah surat edaran, brosur sosialisasi, atau pengumuman resmi dalam bentuk PDF.',
      options: {
        accept: 'application/pdf',
      },
    },
    {
      name: 'sortOrder',
      title: 'Urutan Prioritas Tampil (Angka Kecil Tampil Lebih Atas)',
      type: 'number',
      initialValue: 50,
      description: 'Isi angka kecil (misal 1 atau 10) untuk menyematkan berita di urutan paling atas.',
    },
    {
      name: 'publishAt',
      title: 'Tanggal Publikasi',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'expireAt',
      title: 'Tanggal Kedaluwarsa (Opsional)',
      type: 'datetime',
      description: 'Kosongkan jika informasi berlaku seterusnya. Jika diisi, berita otomatis disembunyikan setelah tanggal ini.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'siteScope',
      media: 'mediaImage',
    },
  },
}

export const schemaTypes = [karantinaContentSchema]

