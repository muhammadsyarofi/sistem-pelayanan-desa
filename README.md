# 🌾 SimpelDesa — Pemerintah Desa Luwung, Kec. Mundu, Kab. Cirebon

> **"Lapor, layani, selesai. Bersama membangun Desa Luwung."**

Platform Pengaduan Masyarakat, Pelayanan Administrasi Surat Terpadu, Papan Pengumuman Digital, dan Portal Sejarah Resmi **Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon, Provinsi Jawa Barat 45173**.

---

## 🏛️ Identitas Terverifikasi Desa Luwung
- **Nama Desa:** Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon, Jawa Barat
- **Kepala Desa / Kuwu:** Bapak **Muhammad Syarofi Kunaedi**
- **WhatsApp Resmi Kantor Desa:** `088707868654` (`+62 887-0786-8654`)
- **Kode Wilayah Kemendagri:** `32.09.12.2004`
- **Kode Pos & Ketinggian:** `45173` • `± 9 mdpl`
- **Google Plus Code & Koordinat:** `6HGV+VJ8` (`-6.77284, 108.59408`)
- **Situs & Tokoh Sejarah:** Kisah pembukaan kawasan oleh **Ki Sutajiwa** serta **Kompleks Makam Pangeran Raja Muhammad (Pangeran Luwung)** di **Blok Kramat**.

---

## 🚀 Cara Menjalankan Aplikasi

Satu basis kode ini mendukung tiga bentuk: **Web Responsif (Mobile-First)**, **Mobile (PWA + Android Capacitor)**, dan **Desktop (Tauri)**.

### 1. Menjalankan Langsung di Localhost (`http://127.0.0.1:8000`) — Paling Cepat
Buka terminal VS Code / PowerShell dan jalankan:
```powershell
cd "C:\Users\lenovo\.gemini\antigravity\scratch\simpeldesa-luwung"
python -m http.server 8000 --bind 127.0.0.1
```
Lalu buka **`http://127.0.0.1:8000`** di browser Anda.

### 2. Menjalankan Mode Full-Stack (Next.js + Prisma ORM + PostgreSQL)
1. Salin berkas variabel lingkungan:
   ```bash
   cp .env.example .env
   ```
2. Instal dependensi dan sinkronisasi skema database Prisma:
   ```bash
   npm install
   npx prisma db push
   npx tsx prisma/seed.ts
   npm run dev
   ```

---

## 🔐 Akun Demo Pengujian (Wajib Ganti Sandi Sebelum Produksi!)

> ⚠️ **Catatan Keamanan:** Akun demo di bawah ini hanya untuk pengujian fitur dan **tidak menggunakan NIK nyata**. Wajib ganti kata sandi sebelum digunakan secara resmi di lingkungan produksi. Di halaman **Masuk**, tersedia pula tombol **1-Klik Masuk Akun Demo**.

| Peran Pengguna | Email Login | Kata Sandi Demo | Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@luwung.desa.id` | `AdminLuwung2026!` | Kelola seluruh pengaduan, terbitkan surat PDF, siarkan pengumuman & kartu WA/IG, edit sejarah & placeholder desa, kelola petugas, log audit |
| **Petugas Desa** | `petugas@luwung.desa.id` | `PetugasLuwung2026!` | Verifikasi & tindak lanjut pengaduan, disposisi lapangan, verifikasi permohonan surat |
| **Warga (User)** | `warga@luwung.desa.id` | `WargaLuwung2026!` | Buat pengaduan (Stepper 6 langkah + pin peta), pantau tiket, beri rating bintang, ajukan & unduh surat PDF |

---

## 📱 Cara Membangun Aplikasi Android (APK / AAB via Capacitor)

1. Pastikan Android Studio dan JDK sudah terpasang.
2. Jalankan perintah berikut di terminal proyek:
   ```bash
   npm install
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
3. Di Android Studio, pilih menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

---

## 🖥️ Cara Membangun Aplikasi Desktop (Windows / macOS / Linux via Tauri)

1. Pastikan Rust (`rustup`) telah terpasang di komputer Anda.
2. Untuk menjalankan mode pengembangan desktop:
   ```bash
   npm run desktop:dev
   ```
3. Untuk membangun installer desktop (`.msi` / `.exe` di Windows, `.dmg` di macOS, `.AppImage` di Linux):
   ```bash
   npm run desktop:build
   ```
   Hasil build berada di `src-tauri/target/release/bundle/`.

---

## 🎨 Cara Mengubah Warna (Token Desain) & Isi Konten Desa

1. **Mengubah Palet Warna ("Pagi Hari di Sawah"):**
   - Buka berkas [`styles/main.css`](styles/main.css) pada bagian `:root` dan `[data-theme="dark"]`.
   - Seluruh token warna (`--green-50: #F0FDF4`, `--green-700: #15803D`, `--accent-lime: #A3E635`, `--accent-gold: #F5B731`, `--brand-navy: #0B2A5B`) dapat disesuaikan di satu tempat.
2. **Mengubah Identitas, Placeholder `[ISI]`, & Sejarah Desa:**
   - Masuk sebagai **Super Admin** → buka menu **Dashboard Admin** → tab **🏛️ Konten Desa & Sejarah**.
   - Anda dapat langsung mengubah `[NAMA KEPALA DESA]`, `[NO. WHATSAPP KANTOR DESA]`, `[ALAMAT LENGKAP KANTOR DESA]`, `[JAM LAYANAN]`, `[EMAIL]`, `[AKUN MEDIA SOSIAL]`, serta mengedit seluruh bagian **Linimasa Sejarah Desa Luwung** secara langsung dari antarmuka web.
   - Untuk mengubah nilai bawaan awal, edit berkas [`js/data.js`](js/data.js) dan [`prisma/seed.ts`](prisma/seed.ts).
