import { PrismaClient, RoleName, ComplaintStatus, ComplaintPriority, AnnouncementCategory, AnnouncementStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mask 16-digit NIK so personal data is protected in UI (e.g., 320912********01)
 */
export function maskNik(nik: string): string {
  const clean = nik.replace(/\D/g, '');
  if (clean.length !== 16) return '320912********00';
  return `${clean.slice(0, 6)}********${clean.slice(14, 16)}`;
}

async function main() {
  console.log('🌱 Seeding database SimpelDesa — Desa Luwung, Kec. Mundu, Kab. Cirebon...');

  // 1. Roles
  const roleSuperAdmin = await prisma.role.upsert({
    where: { name: RoleName.SUPER_ADMIN },
    update: {},
    create: { name: RoleName.SUPER_ADMIN, description: 'Mengelola seluruh sistem, konten desa, dan akun petugas' },
  });

  const rolePetugas = await prisma.role.upsert({
    where: { name: RoleName.PETUGAS },
    update: {},
    create: { name: RoleName.PETUGAS, description: 'Menangani pengaduan warga dan permohonan layanan administrasi' },
  });

  const roleWarga = await prisma.role.upsert({
    where: { name: RoleName.WARGA },
    update: {},
    create: { name: RoleName.WARGA, description: 'Warga Desa Luwung terdaftar yang dapat melapor dan mengajukan surat' },
  });

  // 2. Demo Users (Tidak memakai NIK nyata, wajib ganti sandi sebelum produksi)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@luwung.desa.id' },
    update: {},
    create: {
      fullName: 'Super Admin Desa Luwung (DEMO)',
      nikHash: 'hash_demo_superadmin_0001',
      nikMasked: '320912********01',
      nikEncrypted: 'enc_3209120000000001',
      phone: '088707868654',
      email: 'admin@luwung.desa.id',
      rtRwDusun: 'Kantor Kuwu Desa Luwung',
      passwordHash: '$2b$10$DemoHashReplaceBeforeProductionAdmin123',
      roleId: roleSuperAdmin.id,
      isVerified: true,
      isActive: true,
    },
  });

  const petugas = await prisma.user.upsert({
    where: { email: 'petugas@luwung.desa.id' },
    update: {},
    create: {
      fullName: 'Kaur Pelayanan Desa Luwung (DEMO)',
      nikHash: 'hash_demo_petugas_0002',
      nikMasked: '320912********02',
      nikEncrypted: 'enc_3209120000000002',
      phone: '088707868654',
      email: 'petugas@luwung.desa.id',
      rtRwDusun: 'Kantor Kuwu Desa Luwung',
      passwordHash: '$2b$10$DemoHashReplaceBeforeProductionPetugas123',
      roleId: rolePetugas.id,
      isVerified: true,
      isActive: true,
    },
  });

  const wargaDemo = await prisma.user.upsert({
    where: { email: 'warga.demo@luwung.desa.id' },
    update: {},
    create: {
      fullName: 'Ahmad Fauzi (Akun Warga Contoh)',
      nikHash: 'hash_demo_warga_0003',
      nikMasked: '320912********03',
      nikEncrypted: 'enc_3209120000000003',
      phone: '081200001234',
      email: 'warga.demo@luwung.desa.id',
      rtRwDusun: 'RT 002 / RW 001 - Blok Kramat',
      passwordHash: '$2b$10$DemoHashReplaceBeforeProductionWarga123',
      roleId: roleWarga.id,
      isVerified: true,
      isActive: true,
    },
  });

  // 3. Site Settings & Verified Data Desa Luwung
  const settings = [
    { key: 'NAMA_DESA', value: 'Desa Luwung', label: 'Nama Desa', isPlaceholder: false },
    { key: 'TAGLINE_DESA', value: 'Lapor, layani, selesai. Bersama membangun Desa Luwung.', label: 'Tagline Platform', isPlaceholder: false },
    { key: 'KODE_KEMENDAGRI', value: '32.09.12.2004', label: 'Kode Wilayah Kemendagri', isPlaceholder: false },
    { key: 'KODE_POS', value: '45173', label: 'Kode Pos', isPlaceholder: false },
    { key: 'KETINGGIAN', value: '± 9 mdpl', label: 'Ketinggian Wilayah', isPlaceholder: false },
    { key: 'PLUS_CODE', value: '6HGV+VJ8', label: 'Google Plus Code', isPlaceholder: false },
    { key: 'KOORDINAT_LAT', value: '-6.77284', label: 'Koordinat Lintang (Latitude)', isPlaceholder: false },
    { key: 'KOORDINAT_LNG', value: '108.59408', label: 'Koordinat Bujur (Longitude)', isPlaceholder: false },
    { key: 'NAMA_KEPALA_DESA', value: 'Muhammad Syarofi Kunaedi', label: 'Nama Kepala Desa / Kuwu', isPlaceholder: false },
    { key: 'NO_WHATSAPP_KANTOR_DESA', value: '088707868654', label: 'Nomor WhatsApp Resmi Kantor Desa', isPlaceholder: false },
    { key: 'ALAMAT_LENGKAP_KANTOR_DESA', value: 'Desa Luwung, Kec. Mundu, Kabupaten Cirebon, Jawa Barat 45173', label: 'Alamat Lengkap Kantor Desa', isPlaceholder: false },
    { key: 'JAM_LAYANAN', value: 'Senin – Jumat: 08.00 – 15.00 WIB (Sabtu–Minggu Libur, Layanan Darurat 24 Jam via WA)', label: 'Jam Layanan Kantor Desa', isPlaceholder: true },
    { key: 'EMAIL_DESA', value: '[EMAIL KANTOR DESA - Contoh: pemdes.luwung@cirebonkab.go.id]', label: 'Email Resmi Desa', isPlaceholder: true },
    { key: 'AKUN_MEDIA_SOSIAL', value: '[AKUN MEDIA SOSIAL DESA - Instagram / Facebook / YouTube]', label: 'Akun Media Sosial Resmi', isPlaceholder: true },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, isPlaceholder: s.isPlaceholder },
      create: s,
    });
  }

  // 4. Sejarah & Profil Desa Luwung (Sesuai Fakta Terverifikasi + Data Resmi)
  const historyEntries = [
    {
      sectionKey: 'SELAYANG_PANDANG',
      yearOrPeriod: 'Kode Kemendagri 32.09.12.2004',
      title: 'Selayang Pandang Desa Luwung & Konteks Kecamatan Mundu',
      content:
        'Desa Luwung merupakan salah satu desa yang terletak di Kecamatan Mundu, Kabupaten Cirebon, Provinsi Jawa Barat (Kode Pos 45173, ketinggian ±9 mdpl). Desa ini memiliki nilai sejarah dan budaya yang berkaitan erat dengan perkembangan masyarakat serta penyebaran agama Islam di wilayah Cirebon Timur.\n\nSebagai konteks wilayah kecamatan: Kecamatan Mundu dibentuk berdasarkan Peraturan Pemerintah Nomor 3 Tahun 1992, dengan wilayah yang semula merupakan bagian dari Kecamatan Astanajapura. Menurut situs resmi Kecamatan Mundu, nama "Mundu" diyakini berasal dari pohon mundu (Garcinia dulcis) yang dahulu banyak tumbuh di daerah ini, dan wilayahnya terkait dengan masa Kerajaan Cirebon serta awal penyebaran Islam.\n\nData Batas Wilayah, Luas, & Jumlah Penduduk Rinci: [ISI – Menunggu verifikasi dokumen profil perangkat desa].',
      imageUrl: 'assets/luwung/hero.jpg',
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 1,
    },
    {
      sectionKey: 'ASAL_USUL',
      yearOrPeriod: 'Masa Pembukaan Lahan',
      title: 'Asal-usul Wilayah Desa Luwung',
      content:
        'Berdasarkan cerita sejarah yang berkembang di masyarakat dan beberapa dokumen penelitian, wilayah Luwung pada masa dahulu dikenal sebagai kawasan hutan yang kemudian dibuka menjadi permukiman dan lahan pertanian yang subur.\n\nKeterangan tambahan etimologi nama Luwung: [ISI – menunggu keterangan sesepuh atau dokumen desa].',
      imageUrl: null,
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 2,
    },
    {
      sectionKey: 'MASA_AWAL',
      yearOrPeriod: 'Tokoh Pembuka Wilayah',
      title: 'Masa Awal dan Tokoh Pendiri: Ki Sutajiwa',
      content:
        'Dalam salah satu cerita asal-usul Desa Luwung yang hidup di masyarakat, terdapat tokoh bernama Ki Sutajiwa yang dikisahkan membuka kawasan hutan tersebut hingga berkembang menjadi tempat tinggal masyarakat dan lahan pertanian.\n\nSilsilah dan tahun rincian masa awal: [ISI – menunggu verifikasi sesepuh / arsip desa].',
      imageUrl: null,
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 3,
    },
    {
      sectionKey: 'DAFTAR_KUWU',
      yearOrPeriod: 'Masa Pemerintahan Desa',
      title: 'Daftar Kepala Desa / Kuwu dari Masa ke Masa',
      content:
        'Saat ini pemerintahan Desa Luwung dipimpin oleh Kepala Desa (Kuwu) Bapak Muhammad Syarofi Kunaedi. Daftar urut Kuwu periode-periode terdahulu sedang dalam tahap pendokumentasian arsip desa: [ISI DAFTAR KUWU PERIODE SEBELUMNYA].',
      imageUrl: 'assets/luwung/kades.jpg',
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 4,
    },
    {
      sectionKey: 'SITUS_BERSEJARAH',
      yearOrPeriod: 'Warisan Sejarah & Islam Cirebon',
      title: 'Kompleks Makam Pangeran Raja Muhammad (Pangeran Luwung) — Blok Kramat',
      content:
        'Desa Luwung memiliki peninggalan sejarah penting berupa kompleks makam Pangeran Raja Muhammad atau yang lebih dikenal dengan sebutan Pangeran Luwung, yang berada di Blok Kramat. Tokoh tersebut dikenal dalam tradisi masyarakat setempat sebagai salah satu tokoh penyebaran agama Islam di wilayah Cirebon.\n\nKompleks situs memiliki arsitektur gerbang bata merah khas Cirebon serta bangunan pendopo dan cungkup makam yang terawat.',
      imageUrl: 'assets/luwung/makam-dalam.jpg',
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 5,
    },
    {
      sectionKey: 'TRADISI_BUDAYA',
      yearOrPeriod: 'Warisan Leluhur & Gotong Royong',
      title: 'Tradisi dan Budaya Masyarakat Desa Luwung',
      content:
        'Nilai sejarah serta budaya yang berkaitan dengan perkembangan masyarakat dan penyebaran agama Islam di Cirebon Timur menjadi bagian penting dari identitas Desa Luwung yang terus dijaga dan dilestarikan oleh generasi penerus melalui semangat kebersamaan dan gotong royong.\n\nJadwal agenda adat/tradisi tahunan desa: [ISI – menunggu konfirmasi perangkat desa].',
      imageUrl: 'assets/luwung/gerbang-bata.jpg',
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 6,
    },
    {
      sectionKey: 'LUWUNG_HARI_INI',
      yearOrPeriod: 'Era Digital & Kemandirian Desa',
      title: 'Desa Luwung Hari Ini',
      content:
        'Seiring berjalannya waktu, Desa Luwung terus mengalami perkembangan dalam bidang pemerintahan, pembangunan infrastruktur, pendidikan, sosial, dan kehidupan masyarakat. Dengan semangat kebersamaan dan gotong royong di bawah kepemimpinan Kuwu Muhammad Syarofi Kunaedi, Desa Luwung terus bergerak menjadi desa yang maju, mandiri, serta mampu memberikan pelayanan terbaik bagi seluruh masyarakatnya.',
      imageUrl: 'assets/luwung/hero.jpg',
      isPlaceholder: false,
      isVisiblePublic: true,
      sortOrder: 7,
    },
  ];

  for (const h of historyEntries) {
    await prisma.historyEntry.upsert({
      where: { sectionKey: h.sectionKey },
      update: h,
      create: h,
    });
  }

  console.log('✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
