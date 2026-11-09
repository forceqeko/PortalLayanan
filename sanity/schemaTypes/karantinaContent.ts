/**
 * Skema Sanity Studio: Konten Informasi, Edukasi & Galeri Karantina BKHIT Sulawesi Utara
 * Konten bersifat universal (tanpa pembagian jenis kategori maupun titik wilayah).
 * Mendukung pengelolaan Teks, Foto (Auto-WebP), Video (.mp4), dan Dokumen (.pdf) dalam 1 Form Terpadu.
 */

export const karantinaContentSchema = {
  name: 'karantinaContent',
  title: 'Konten Informasi & Sosialisasi BKHIT',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Judul Informasi',
      type: 'string',
      description: 'Judul utama yang tampil di kartu informasi dan halaman rincian.',
      validation: (Rule: {
        required: () => { min: (n: number) => { max: (n: number) => unknown } }
      }) => Rule.required().min(5).max(160),
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
      name: 'summary',
      title: 'Ringkasan Singkat',
      type: 'text',
      rows: 3,
      description: 'Ringkasan 1-2 kalimat yang muncul pada kartu halaman Informasi.',
      validation: (Rule: { required: () => { max: (n: number) => unknown } }) =>
        Rule.required().max(320),
    },
    {
      name: 'body',
      title: 'Isi Lengkap Informasi / Keterangan Dokumentasi',
      type: 'text',
      rows: 10,
      description: 'Pisahkan antar paragraf dengan baris kosong (Enter 2x).',
    },
    {
      name: 'mediaImage',
      title: 'Upload Foto Dokumentasi / Thumbnail Video',
      type: 'image',
      description:
        'Unggah foto kegiatan (.jpg, .png, .webp). Otomatis dikompres oleh CDN Sanity agar hemat kuota.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'videoFile',
      title: 'Upload Video Edukasi / Dokumentasi (.mp4 / .webm) - Opsional',
      type: 'file',
      description:
        'Unggah file video langsung di sini. Jika diisi, halaman rincian akan menampilkan Pemutar Video HTML5.',
      options: {
        accept: 'video/mp4,video/webm',
      },
    },
    {
      name: 'documentFile',
      title: 'Upload Lampiran Dokumen Resmi (.pdf) - Opsional',
      type: 'file',
      description:
        'Unggah surat edaran, brosur sosialisasi, atau dokumen resmi dalam bentuk PDF.',
      options: {
        accept: 'application/pdf',
      },
    },
    {
      name: 'sortOrder',
      title: 'Urutan Prioritas Tampil (Angka Kecil Tampil Lebih Atas)',
      type: 'number',
      initialValue: 50,
      description:
        'Isi angka kecil (misal 1 atau 10) untuk menempatkan informasi di urutan paling atas.',
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
      description:
        'Kosongkan jika informasi berlaku seterusnya. Jika diisi, informasi otomatis disembunyikan setelah tanggal ini.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'summary',
      media: 'mediaImage',
    },
  },
}

export const schemaTypes = [karantinaContentSchema]
