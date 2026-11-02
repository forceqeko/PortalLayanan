# DESIGN.md: Portal Gate BKHIT Sulawesi Utara

## 1. Identity & Character (Owner Visual Reference Override — R-37)
- **Product**: Portal Gate BKHIT Sulawesi Utara (Badan Karantina Indonesia).
- **Architecture**: **Single-Screen Full-Viewport Gateway (`100dvh`, Zero Vertical Website Scrolling)**, mengacu langsung pada gambar referensi desain yang diberikan oleh pemilik produk.
- **Visual Language**: *Sunlit Archipelago Glass Gateway*. Menampilkan fotografi lanskap kepulauan Sulawesi Utara (`Sulut`, `Siau`, `Tahuna`, `Melonguane`) yang cerah dan hidup di latar belakang, dipadukan dengan:
  1. **Header Kiri-Kanan**: Identitas `BALAI KARANTINA SULAWESI UTARA` di kiri atas dan *dropdown* lokasi berbentuk kapsul putih bersih di kanan atas (`Kepulauan Sangihe, Sulawesi Utara` / `Tahuna`).
  2. **Judul Utama di Kiri**: Tipografi putih tegas `Gerbang Akses Layanan dan Informasi Karantina` di atas lapisan *scrim* lembut di sisi kiri layar.
  3. **4 Kartu Layanan Horizontal (Desktop 4 Kolom / Mobile Baris Kompak)**:
     - **Akses Layanan Karantina** (Ocean Blue) -> Redirect ke PTK Online
     - **Decision Intelligence (QDI)** (Deep Indigo) -> Redirect ke QDI
     - **Informasi & Sosialisasi** (Coastal Teal) -> Redirect / Drawer Informasi PPID
     - **Tanya Karantina (WhatsApp)** (Emerald Green) -> Redirect ke WhatsApp Resmi
  4. **Pemilih Wilayah Bergambar di Bawah (`Pilih Wilayah Layanan`)**: 3 kartu pemilih wilayah (`Siau`, `Tahuna`, `Melonguane`) lengkap dengan foto *thumbnail* masing-masing pulau serta semboyan *Laut Sehat, Sulawesi Utara Lebih Kuat* di kanan bawah.

## 2. Liveliness Dials & R-37 Note
- **Design Read**: Reading this as: single-viewport regional gateway for BKHIT Sulawesi Utara, following the owner's visual reference layout, dial `ENERGY 3 / RHYTHM 2 / MOTION 2`.
- **Catatan R-37 (Owner Visual Direction)**: Pemilik produk secara eksplisit meminta tata letak mencontoh referensi visual yang diunggah (4 kartu warna berbeda dengan efek *frosted glass*, ikon lingkaran di kiri atas kartu, tombol panah bulat di kanan atas kartu, dan 3 kapsul *thumbnail* pulau di bawah). Berdasarkan aturan `R-37`, arahan gaya eksplisit pemilik produk dicatat sebagai *owner override* resmi, dengan tetap menjaga rasio kontras teks putih di dalam kartu dan di atas foto memenuhi standar WCAG AA (`>= 4.5:1`).
