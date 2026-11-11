/**
 * SIMPELDESA — DESA LUWUNG, KEC. MUNDU, KAB. CIREBON (45173)
 * Data Store Awal, Data Terverifikasi Desa, Sejarah, Layanan, & Data Contoh
 */

window.SIMPELDESA_DEFAULT_STATE = {
  settings: {
    namaDesa: 'Desa Luwung',
    tagline: 'Lapor, layani, selesai. Bersama membangun Desa Luwung.',
    kodeKemendagri: '32.09.12.2004',
    kodePos: '45173',
    ketinggian: '± 9 mdpl',
    plusCode: '6HGV+VJ8',
    plusCodeFull: '6HGV+VJ8 Luwung, Kabupaten Cirebon, Jawa Barat',
    latitude: -6.77284,
    longitude: 108.59408,
    namaKepalaDesa: 'Muhammad Syarofi Kunaedi',
    jabatanKepalaDesa: 'Kuwu / Kepala Desa Luwung',
    noWhatsappKantorDesa: '088707868654',
    alamatLengkapKantorDesa: 'Desa Luwung, Kec. Mundu, Kabupaten Cirebon, Jawa Barat 45173',
    jamLayanan: 'Senin – Jumat: 08.00 – 15.00 WIB (Sabtu–Minggu Libur)',
    emailDesa: '[EMAIL - Menunggu Konfirmasi Perangkat Desa]',
    akunMediaSosial: '[AKUN MEDIA SOSIAL - Instagram / Facebook / YouTube Desa Luwung]',
    sambutanKades:
      'Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di SimpelDesa, wajah digital resmi Pemerintah Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon. Melalui platform ini, kami berkomitmen menghadirkan pelayanan surat administrasi yang cepat serta menindaklanjuti setiap aspirasi dan pengaduan warga secara transparan.\n\nDengan semangat kebersamaan dan gotong royong serta menjunjung tinggi nilai sejarah dan budaya leluhur kita, mari bersama-sama membangun Desa Luwung yang maju, mandiri, dan memberikan pelayanan terbaik bagi seluruh masyarakat.'
  },

  demoUsers: [
    {
      id: 'usr-admin-01',
      fullName: 'Muhammad Syarofi Kunaedi (Super Admin Demo)',
      nikHash: 'hash_admin_01',
      nikMasked: '320912********01',
      phone: '088707868654',
      email: 'admin@luwung.desa.id',
      passwordPlainDemo: 'AdminLuwung2026!',
      rtRwDusun: 'Kantor Kuwu Desa Luwung',
      role: 'SUPER_ADMIN',
      isVerified: true,
      isActive: true,
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'usr-petugas-01',
      fullName: 'Kaur Pelayanan & Trantib (Petugas Demo)',
      nikHash: 'hash_petugas_01',
      nikMasked: '320912********02',
      phone: '088707868654',
      email: 'petugas@luwung.desa.id',
      passwordPlainDemo: 'PetugasLuwung2026!',
      rtRwDusun: 'Kantor Kuwu Desa Luwung',
      role: 'PETUGAS',
      isVerified: true,
      isActive: true,
      createdAt: '2026-01-12T08:00:00Z'
    },
    {
      id: 'usr-warga-01',
      fullName: 'Ahmad Fauzi (Akun Warga Contoh)',
      nikHash: 'hash_warga_01',
      nikMasked: '320912********03',
      phone: '081200001234',
      email: 'warga@luwung.desa.id',
      passwordPlainDemo: 'WargaLuwung2026!',
      rtRwDusun: 'RT 002 / RW 001 - Blok Kramat',
      role: 'WARGA',
      isVerified: true,
      isActive: true,
      createdAt: '2026-02-01T09:30:00Z'
    }
  ],

  categories: [
    {
      id: 'cat-infra',
      name: 'Infrastruktur',
      slug: 'infrastruktur',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19L8 5"/><path d="M20 19L16 5"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="11" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="18"/></svg>',
      slaDays: 5,
      desc: 'Jalan desa, jembatan, drainase, lampu penerangan jalan umum (PJU)'
    },
    {
      id: 'cat-clean',
      name: 'Kebersihan',
      slug: 'kebersihan',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
      slaDays: 2,
      desc: 'Tumpukan sampah, saluran air tersumbat, kebersihan lingkungan blok'
    },
    {
      id: 'cat-sec',
      name: 'Keamanan',
      slug: 'keamanan',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
      slaDays: 1,
      desc: 'Pos kamling, ketertiban lingkungan, gangguan keamanan warga'
    },
    {
      id: 'cat-health',
      name: 'Kesehatan',
      slug: 'kesehatan',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      slaDays: 2,
      desc: 'Posyandu, fogging DBD, sanitasi, darurat kesehatan masyarakat'
    },
    {
      id: 'cat-pub',
      name: 'Pelayanan Publik',
      slug: 'pelayanan-publik',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
      slaDays: 2,
      desc: 'Masukan pelayanan administrasi kantor desa dan perangkat'
    },
    {
      id: 'cat-other',
      name: 'Lainnya',
      slug: 'lainnya',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
      slaDays: 3,
      desc: 'Aspirasi sosial, pertanian, kegiatan pemuda, dan usulan warga'
    }
  ],

  complaints: [
    {
      id: 'cmp-001',
      ticketCode: 'LPR-2026-000101',
      isSample: false,
      userId: 'usr-warga-01',
      reporterName: 'Ahmad Fauzi',
      reporterNikMasked: '320912********03',
      categoryId: 'cat-infra',
      categoryName: 'Infrastruktur',
      title: 'Lampu Penerangan Jalan Umum (PJU) Padam di Sekitar Akses Blok Kramat',
      description: 'Mohon izin melaporkan, terdapat 2 titik lampu penerangan jalan yang padam sejak dua malam lalu di jalur menuju area Blok Kramat sehingga cukup gelap bagi warga yang melintas malam hari.',
      latitude: -6.77245,
      longitude: 108.59445,
      addressText: 'Jl. Blok Kramat RT 002 / RW 001, Desa Luwung',
      rtRwDusun: 'RT 002 / RW 001 - Blok Kramat',
      isAnonymousPublic: false,
      priority: 'TINGGI',
      status: 'SELESAI',
      assignedOfficerName: 'Kaur Pelayanan & Trantib',
      internalNotes: 'Sudah dikoordinasikan dengan teknisi listrik desa, bohlam LED 50W dan fotokontrol telah diganti baru.',
      rating: 5,
      ratingComment: 'Alhamdulillah cepat sekali ditindaklanjuti perangkat desa, sekarang jalan Blok Kramat sudah terang kembali. Terima kasih Pak Kuwu!',
      attachments: ['assets/luwung/gerbang-bata.jpg'],
      resolutionProofUrl: 'assets/luwung/hero.jpg',
      createdAt: '2026-11-02T09:15:00Z',
      resolvedAt: '2026-11-04T14:20:00Z',
      updates: [
        { status: 'DITERIMA', note: 'Laporan diterima melalui sistem SimpelDesa.', by: 'Sistem SimpelDesa', at: '2026-11-02 09:15' },
        { status: 'DIVERIFIKASI', note: 'Laporan telah diverifikasi oleh Kaur Pelayanan dan diteruskan ke tim teknis desa.', by: 'Kaur Pelayanan & Trantib', at: '2026-11-02 11:00' },
        { status: 'DIPROSES', note: 'Petugas sedang melakukan pengecekan jaringan dan penggantian lampu di lokasi Blok Kramat.', by: 'Kaur Pelayanan & Trantib', at: '2026-11-03 10:30' },
        { status: 'SELESAI', note: 'Kedua titik lampu PJU telah selesai diperbaiki dan menyala normal.', by: 'Kaur Pelayanan & Trantib', at: '2026-11-04 14:20' }
      ],
      comments: [
        { author: 'Ahmad Fauzi (Warga)', isOfficial: false, message: 'Terima kasih respon cepatnya Pak, ditunggu petugasnya di lokasi.', at: '2026-11-02 13:10' },
        { author: 'Kaur Pelayanan & Trantib (Petugas Desa)', isOfficial: true, message: 'Siap Pak Ahmad, hari ini petugas lapangan menuju titik PJU di Blok Kramat.', at: '2026-11-03 09:00' }
      ]
    },
    {
      id: 'cmp-002',
      ticketCode: 'LPR-2026-000102',
      isSample: false,
      userId: 'usr-warga-01',
      reporterName: 'Warga Desa Luwung (Identitas Disembunyikan)',
      reporterNikMasked: '320912********08',
      categoryId: 'cat-clean',
      categoryName: 'Kebersihan',
      title: 'Saluran Drainase Tersumbat Daun & Sedimen Pasca Hujan',
      description: 'Saluran air di tepi jalan lingkungan mengalami pendangkalan karena ranting dan sedimen tanah, dikhawatirkan meluap saat hujan deras.',
      latitude: -6.77320,
      longitude: 108.59360,
      addressText: 'RT 003 / RW 002, Desa Luwung',
      rtRwDusun: 'RT 003 / RW 002 - Dusun 02',
      isAnonymousPublic: true,
      priority: 'SEDANG',
      status: 'DIPROSES',
      assignedOfficerName: 'Kaur Pelayanan & Trantib',
      internalNotes: 'Dijadwalkan kerja bakti bersama RT/RW hari Jumat pagi.',
      rating: null,
      ratingComment: null,
      attachments: [],
      resolutionProofUrl: null,
      createdAt: '2026-11-07T08:00:00Z',
      resolvedAt: null,
      updates: [
        { status: 'DITERIMA', note: 'Laporan masuk ke sistem SimpelDesa.', by: 'Sistem SimpelDesa', at: '2026-11-07 08:00' },
        { status: 'DIVERIFIKASI', note: 'Lokasi drainase telah dicek oleh Ketua RT dan perangkat desa.', by: 'Kaur Pelayanan & Trantib', at: '2026-11-07 14:15' },
        { status: 'DIPROSES', note: 'Pembersihan sedimen sedang dijadwalkan bersama tim kebersihan desa.', by: 'Kaur Pelayanan & Trantib', at: '2026-11-08 09:30' }
      ],
      comments: []
    },
    {
      id: 'cmp-003',
      ticketCode: 'LPR-2026-000103',
      isSample: false,
      userId: 'usr-warga-01',
      reporterName: 'Siti Rahmawati',
      reporterNikMasked: '320912********19',
      categoryId: 'cat-infra',
      categoryName: 'Infrastruktur',
      title: 'Usulan Perbaikan Bahu Jalan Paving Menuju Area Sawah Warga',
      description: 'Terdapat bagian paving bahu jalan yang agak amblas sekitar 1,5 meter di jalur akses pertanian warga.',
      latitude: -6.77190,
      longitude: 108.59490,
      addressText: 'RT 001 / RW 001, Desa Luwung',
      rtRwDusun: 'RT 001 / RW 001 - Dusun 01',
      isAnonymousPublic: false,
      priority: 'RENDAH',
      status: 'DIVERIFIKASI',
      assignedOfficerName: 'Kaur Pelayanan & Trantib',
      internalNotes: 'Masuk daftar survei tim TPK Desa Luwung.',
      rating: null,
      ratingComment: null,
      attachments: [],
      resolutionProofUrl: null,
      createdAt: '2026-11-09T10:15:00Z',
      resolvedAt: null,
      updates: [
        { status: 'DITERIMA', note: 'Laporan diterima.', by: 'Sistem SimpelDesa', at: '2026-11-09 10:15' },
        { status: 'DIVERIFIKASI', note: 'Telah diverifikasi untuk survei lapangan oleh Kasi Kesejahteraan.', by: 'Kaur Pelayanan & Trantib', at: '2026-11-09 15:00' }
      ],
      comments: []
    },
    {
      id: 'cmp-004',
      ticketCode: 'LPR-2026-000104',
      isSample: false,
      userId: 'usr-warga-01',
      reporterName: 'Budi Santoso',
      reporterNikMasked: '320912********27',
      categoryId: 'cat-health',
      categoryName: 'Kesehatan',
      title: 'Permohonan Jadwal Posyandu Lansia & Pemeriksaan Tekanan Darah',
      description: 'Mohon informasi dan fasilitasi pemeriksaan tensi rutin bagi warga lansia di RW 003.',
      latitude: -6.77355,
      longitude: 108.59470,
      addressText: 'RW 003, Desa Luwung',
      rtRwDusun: 'RT 001 / RW 003 - Dusun 03',
      isAnonymousPublic: false,
      priority: 'SEDANG',
      status: 'DITERIMA',
      assignedOfficerName: 'Belum Ditugaskan',
      internalNotes: '',
      rating: null,
      ratingComment: null,
      attachments: [],
      resolutionProofUrl: null,
      createdAt: '2026-11-10T07:45:00Z',
      resolvedAt: null,
      updates: [
        { status: 'DITERIMA', note: 'Laporan diterima dan menunggu verifikasi petugas.', by: 'Sistem SimpelDesa', at: '2026-11-10 07:45' }
      ],
      comments: []
    }
  ],

  services: [
    {
      id: 'srv-domisili',
      code: 'SKD',
      name: 'Surat Keterangan Domisili (SKD)',
      slug: 'surat-keterangan-domisili',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z"/><polyline points="9 15 11 17 15 13"/></svg>',
      estimatedTime: '1 Hari Kerja',
      description: 'Surat resmi keterangan tempat tinggal warga di wilayah Desa Luwung untuk keperluan administrasi bank, sekolah, atau pekerjaan.',
      requirements: [
        'Pengantar RT/RW setempat',
        'KTP Elektronik (e-KTP) asli / foto jelas',
        'Kartu Keluarga (KK) asli / foto jelas'
      ],
      flowSteps: [
        'Isi formulir pengajuan SKD di SimpelDesa & unggah foto KTP/KK',
        'Petugas Desa memverifikasi kesesuaian data kependudukan',
        'Pengesahan oleh Kuwu Desa Luwung (Muhammad Syarofi Kunaedi)',
        'Unduh surat PDF bernomor resmi atau ambil cetak di Kantor Desa'
      ]
    },
    {
      id: 'srv-pengantar',
      code: 'SP-UMUM',
      name: 'Surat Pengantar Umum Desa',
      slug: 'surat-pengantar-umum',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
      estimatedTime: '1 Hari Kerja',
      description: 'Surat pengantar resmi dari Pemerintah Desa Luwung untuk pengurusan dokumen kependudukan atau keperluan instansi di Kecamatan Mundu / Kabupaten Cirebon.',
      requirements: [
        'KTP Elektronik (e-KTP)',
        'Kartu Keluarga (KK)',
        'Keterangan maksud/tujuan pengurusan surat'
      ],
      flowSteps: [
        'Pilih layanan Surat Pengantar Umum dan isi tujuan keperluan',
        'Verifikasi berkas oleh Kaur Pelayanan Desa Luwung',
        'Penerbitan surat pengantar bernomor otomatis'
      ]
    },
    {
      id: 'srv-sktm',
      code: 'SKTM',
      name: 'Surat Keterangan Tidak Mampu (SKTM)',
      slug: 'surat-keterangan-tidak-mampu',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3 19v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1"/><path d="M15 14h2a4 4 0 0 1 4 4v1"/></svg>',
      estimatedTime: '1–2 Hari Kerja',
      description: 'Surat keterangan bagi keluarga prasejahtera untuk pengajuan beasiswa pendidikan (KIP), keringanan biaya rumah sakit, atau bantuan sosial.',
      requirements: [
        'Surat Pengantar RT/RW',
        'KTP Elektronik & Kartu Keluarga (KK)',
        'Pernyataan kondisi ekonomi / tujuan penggunaan SKTM'
      ],
      flowSteps: [
        'Ajukan permohonan SKTM melalui dashboard warga',
        'Verifikasi data sosial oleh Kasi Kesejahteraan / Petugas Desa',
        'Penandatanganan dan penerbitan SKTM resmi'
      ]
    },
    {
      id: 'srv-sku',
      code: 'SKU',
      name: 'Surat Keterangan Usaha (SKU)',
      slug: 'surat-keterangan-usaha',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l2-5h14l2 5"/><path d="M4 9v11h16V9"/><rect x="9" y="13" width="6" height="7"/></svg>',
      estimatedTime: '1 Hari Kerja',
      description: 'Surat bukti kepemilikan usaha mikro/kecil warga Desa Luwung untuk keperluan pengajuan KUR, perizinan UMKM, atau kemitraan.',
      requirements: [
        'KTP Elektronik & Kartu Keluarga (KK)',
        'Nama jenis usaha dan alamat lokasi usaha di Desa Luwung',
        'Foto tempat/kegiatan usaha'
      ],
      flowSteps: [
        'Isi rincian nama dan bidang usaha warga',
        'Verifikasi oleh perangkat desa',
        'Surat Keterangan Usaha siap diunduh dalam format PDF resmi'
      ]
    },
    {
      id: 'srv-skck',
      code: 'SP-SKCK',
      name: 'Surat Pengantar SKCK',
      slug: 'surat-pengantar-skck',
      icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="2.5"/><path d="M8.5 16a4 4 0 0 1 7 0"/></svg>',
      estimatedTime: '1 Hari Kerja',
      description: 'Surat pengantar dari Pemerintah Desa Luwung sebagai syarat pembuatan Surat Keterangan Catatan Kepolisian (SKCK) di Polsek Mundu / Polres Cirebon Kota.',
      requirements: [
        'KTP Elektronik (e-KTP)',
        'Kartu Keluarga (KK)',
        'Akta Kelahiran / Ijazah terakhir'
      ],
      flowSteps: [
        'Ajukan Surat Pengantar SKCK dan tulis keperluan melamar kerja/pendidikan',
        'Verifikasi catatan ketertiban oleh perangkat desa',
        'Unduh surat pengantar untuk dibawa ke Polsek/Polres'
      ]
    }
  ],

  serviceRequests: [
    {
      id: 'req-001',
      requestNumber: 'SRV-2026-00018',
      isSample: false,
      serviceId: 'srv-domisili',
      serviceName: 'Surat Keterangan Domisili (SKD)',
      serviceCode: 'SKD',
      userId: 'usr-warga-01',
      applicantName: 'Ahmad Fauzi',
      applicantNikMasked: '320912********03',
      applicantAddress: 'RT 002 / RW 001 - Blok Kramat, Desa Luwung, Kec. Mundu, Kab. Cirebon',
      purpose: 'Persyaratan Administrasi Pembukaan Rekening & Beasiswa Pendidikan',
      status: 'DISETUJUI',
      letterNumber: '474.4 / 018 / DS-LWG / XI / 2026',
      rejectionReason: '',
      createdAt: '2026-11-05T09:00:00Z',
      completedAt: '2026-11-05T13:30:00Z'
    }
  ],

  announcements: [
    {
      id: 'ann-001',
      isSample: false,
      title: 'Pelayanan Administrasi Terpadu & Digitalisasi SimpelDesa Luwung',
      slug: 'pelayanan-administrasi-terpadu-simpeldesa-luwung',
      summary: 'Pemerintah Desa Luwung menghadirkan layanan pengaduan warga dan pengajuan surat online melalui platform SimpelDesa di bawah kepemimpinan Kuwu Muhammad Syarofi Kunaedi.',
      content:
        'Pemerintah Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon terus berkomitmen meningkatkan kualitas pelayanan publik. Kini warga dapat menyampaikan laporan infrastruktur, kebersihan, maupun mengajukan surat keterangan domisili, SKTM, SKU, dan pengantar SKCK secara daring melalui SimpelDesa.\n\nBagi warga yang membutuhkan bantuan langsung, perangkat desa siap melayani di Kantor Kuwu Desa Luwung atau melalui WhatsApp resmi 088707868654.',
      coverImageUrl: 'assets/luwung/hero.jpg',
      category: 'LAYANAN',
      isPinned: true,
      status: 'PUBLISHED',
      publishAt: '2026-11-01',
      expireAt: '2027-12-31',
      viewCount: 342,
      shareCount: 48,
      authorName: 'Pemerintah Desa Luwung'
    },
    {
      id: 'ann-002',
      isSample: false,
      title: 'Kerja Bakti Bersama & Pemeliharaan Lingkungan Sekitar Blok Kramat',
      slug: 'kerja-bakti-bersama-blok-kramat-luwung',
      summary: 'Mengundang seluruh warga RT/RW untuk berpartisipasi dalam kegiatan gotong royong kebersihan saluran drainase dan lingkungan kompleks situs sejarah Desa Luwung.',
      content:
        'Dalam rangka menjaga kebersihan lingkungan sekaligus merawat warisan sejarah Desa Luwung di sekitar Blok Kramat (Kompleks Makam Pangeran Luwung), Pemerintah Desa Luwung mengajak warga untuk mengikuti kegiatan Gotong Royong Jumat Bersih.\n\nMari kita jaga semangat kebersamaan demi Desa Luwung yang bersih, sehat, dan asri.',
      coverImageUrl: 'assets/luwung/gerbang-bata.jpg',
      category: 'KEGIATAN',
      isPinned: true,
      status: 'PUBLISHED',
      publishAt: '2026-11-06',
      expireAt: '2026-12-30',
      viewCount: 215,
      shareCount: 31,
      authorName: 'Kaur Pelayanan Desa Luwung'
    },
    {
      id: 'ann-003',
      isSample: false,
      title: 'Imbauan Kewaspadaan Musim Penghujan & Pelaporan Cepat Genangan',
      slug: 'imbauan-kewaspadaan-musim-penghujan-desa-luwung',
      summary: 'Warga diimbau menjaga kebersihan selokan depan rumah dan segera melapor melalui menu Pengaduan Darurat jika terdapat pohon rawan tumbang atau saluran tersumbat.',
      content:
        'Memasuki musim penghujan, Pemerintah Desa Luwung mengimbau seluruh warga di setiap blok dan RT/RW untuk memeriksa saluran air di lingkungan masing-masing. Apabila ditemukan lampu jalan padam, tanggul/drainase tersumbat, atau kondisi darurat, silakan kirimkan laporan disertai foto dan titik lokasi melalui tombol Buat Pengaduan.',
      coverImageUrl: 'assets/luwung/makam-dalam.jpg',
      category: 'DARURAT',
      isPinned: false,
      status: 'PUBLISHED',
      publishAt: '2026-11-08',
      expireAt: '2027-03-31',
      viewCount: 189,
      shareCount: 27,
      authorName: 'Pemerintah Desa Luwung'
    }
  ],

  historyTimeline: [
    {
      id: 'hist-1',
      sectionKey: 'SELAYANG_PANDANG',
      number: '01',
      yearOrPeriod: 'Kode Kemendagri 32.09.12.2004',
      title: 'Selayang Pandang Desa Luwung & Konteks Kecamatan Mundu',
      content:
        'Desa Luwung merupakan salah satu desa yang terletak di Kecamatan Mundu, Kabupaten Cirebon, Provinsi Jawa Barat (Kode Pos 45173, ketinggian ±9 mdpl). Desa ini memiliki nilai sejarah dan budaya yang berkaitan dengan perkembangan masyarakat serta penyebaran agama Islam di wilayah Cirebon Timur.\n\nKonteks Wilayah Kecamatan Mundu (Fakta Terverifikasi): Kecamatan Mundu dibentuk berdasarkan Peraturan Pemerintah Nomor 3 Tahun 1992, dengan wilayah yang semula bagian dari Kecamatan Astanajapura. Menurut situs resmi Kecamatan Mundu, nama "Mundu" diyakini berasal dari pohon mundu (Garcinia dulcis) yang dahulu banyak tumbuh di daerah ini, dan wilayahnya terkait dengan masa Kerajaan Cirebon serta awal penyebaran Islam.\n\nRincian Batas Wilayah, Luas Ha, & Jumlah Penduduk: [ISI – menunggu verifikasi dokumen profil perangkat desa].',
      imageUrl: 'assets/luwung/hero.jpg',
      isPlaceholder: false,
      hasPartialPlaceholder: true,
      isVisiblePublic: true
    },
    {
      id: 'hist-2',
      sectionKey: 'ASAL_USUL',
      number: '02',
      yearOrPeriod: 'Sejarah Awal & Pembukaan Kawasan',
      title: 'Asal-usul Nama & Wilayah Desa Luwung',
      content:
        'Berdasarkan cerita sejarah yang berkembang di masyarakat dan beberapa dokumen penelitian, wilayah Luwung pada masa dahulu dikenal sebagai kawasan hutan yang kemudian dibuka menjadi permukiman dan lahan pertanian.\n\nCatatan tambahan etimologi nama Luwung dari naskah/sesepuh desa: [ISI – menunggu keterangan sesepuh atau dokumen desa].',
      imageUrl: null,
      isPlaceholder: false,
      hasPartialPlaceholder: true,
      isVisiblePublic: true
    },
    {
      id: 'hist-3',
      sectionKey: 'MASA_AWAL',
      number: '03',
      yearOrPeriod: 'Tokoh Pembuka Kawasan',
      title: 'Masa Awal dan Tokoh Pendiri: Ki Sutajiwa',
      content:
        'Dalam salah satu cerita asal-usulnya yang hidup di tengah masyarakat Desa Luwung, terdapat tokoh bernama Ki Sutajiwa yang dikisahkan membuka kawasan hutan tersebut hingga berkembang menjadi tempat tinggal masyarakat dan area pertanian yang menghidupi warga.',
      imageUrl: null,
      isPlaceholder: false,
      hasPartialPlaceholder: false,
      isVisiblePublic: true
    },
    {
      id: 'hist-4',
      sectionKey: 'DAFTAR_KUWU',
      number: '04',
      yearOrPeriod: 'Kepemimpinan Pemerintahan Desa',
      title: 'Daftar Kepala Desa / Kuwu dari Masa ke Masa',
      content:
        'Pemerintahan Desa Luwung saat ini dipimpin oleh Kuwu (Kepala Desa) Bapak Muhammad Syarofi Kunaedi. Data masa jabatan Kuwu periode-periode sebelumnya dapat dilengkapi oleh perangkat desa melalui editor di Dashboard Admin.',
      imageUrl: 'assets/luwung/kades.jpg',
      isPlaceholder: false,
      hasPartialPlaceholder: true,
      isVisiblePublic: true,
      kuwuList: [
        { periode: 'Periode Saat Ini (Aktif)', nama: 'Muhammad Syarofi Kunaedi', keterangan: 'Kepala Desa / Kuwu Desa Luwung', photo: 'assets/luwung/kades.jpg' },
        { periode: '[ISI PERIODE SEBELUMNYA]', nama: '[ISI NAMA KUWU SEBELUMNYA]', keterangan: 'Menunggu verifikasi arsip perangkat desa', photo: null }
      ]
    },
    {
      id: 'hist-5',
      sectionKey: 'SITUS_BERSEJARAH',
      number: '05',
      yearOrPeriod: 'Blok Kramat • Warisan Sejarah Islam Cirebon',
      title: 'Peninggalan & Situs Bersejarah: Kompleks Makam Pangeran Luwung',
      content:
        'Desa Luwung memiliki peninggalan sejarah berupa kompleks makam Pangeran Raja Muhammad atau yang lebih dikenal dengan sebutan Pangeran Luwung, yang berada di Blok Kramat. Tokoh tersebut dikenal dalam tradisi masyarakat setempat sebagai salah satu tokoh penyebaran agama Islam di wilayah Cirebon.',
      imageUrl: 'assets/luwung/makam-dalam.jpg',
      isPlaceholder: false,
      hasPartialPlaceholder: false,
      isVisiblePublic: true,
      sitesCards: [
        {
          title: 'Kompleks Pendopo & Gerbang Bata Khas Cirebon — Situs Desa Luwung',
          image: 'assets/luwung/hero.jpg',
          thumb: 'assets/luwung/thumbs/hero-sm.jpg',
          alt: 'Arsitektur gerbang bata merah candi bentar berhias keramik dan pendopo kayu di kompleks situs sejarah Desa Luwung',
          caption: 'Kompleks Situs Blok Kramat Desa Luwung (Gapura Bata Merah & Pendopo). Detail penamaan bangunan spesifik: [ISI NAMA SITUS]'
        },
        {
          title: 'Gerbang Paduraksa Bata Merah Kuno',
          image: 'assets/luwung/gerbang-bata.jpg',
          thumb: 'assets/luwung/thumbs/gerbang-bata-sm.jpg',
          alt: 'Gerbang bata merah kuno berpintu kayu di kompleks situs sejarah Desa Luwung',
          caption: 'Gerbang bata merah berpintu kayu menuju area dalam situs Blok Kramat Desa Luwung. Keterangan rincian bangunan: [ISI NAMA SITUS DAN CERITANYA]'
        },
        {
          title: 'Bagian Dalam Makam Pangeran Raja Muhammad (Pangeran Luwung)',
          image: 'assets/luwung/makam-dalam.jpg',
          thumb: 'assets/luwung/thumbs/makam-dalam-sm.jpg',
          alt: 'Bagian dalam cungkup makam Pangeran Raja Muhammad atau Pangeran Luwung di Blok Kramat Desa Luwung dengan ukiran kayu hijau emas dan prasasti aksara',
          caption: 'Cungkup Makam Pangeran Raja Muhammad (Pangeran Luwung) di Blok Kramat, tokoh penyebaran agama Islam di wilayah Cirebon.'
        }
      ]
    },
    {
      id: 'hist-6',
      sectionKey: 'TRADISI_BUDAYA',
      number: '06',
      yearOrPeriod: 'Identitas & Pelestarian Budaya',
      title: 'Tradisi dan Budaya Desa Luwung',
      content:
        'Nilai sejarah serta budaya yang dimiliki Desa Luwung—khususnya yang berkaitan dengan jejak penyebaran Islam di Cirebon Timur dan penghormatan terhadap leluhur di Blok Kramat—menjadi bagian penting dari identitas desa yang terus dijaga dan dilestarikan oleh generasi penerus.\n\nRincian jadwal kegiatan tradisi tahunan masyarakat: [ISI – menunggu verifikasi perangkat desa].',
      imageUrl: null,
      isPlaceholder: false,
      hasPartialPlaceholder: true,
      isVisiblePublic: true
    },
    {
      id: 'hist-7',
      sectionKey: 'LUWUNG_HARI_INI',
      number: '07',
      yearOrPeriod: 'Kemajuan & Gotong Royong',
      title: 'Desa Luwung Hari Ini: Maju, Mandiri, & Melayani',
      content:
        'Seiring berjalannya waktu, Desa Luwung terus mengalami perkembangan dalam bidang pemerintahan, pembangunan infrastruktur, pendidikan, sosial, dan kehidupan masyarakat.\n\nDengan semangat kebersamaan dan gotong royong, Desa Luwung diharapkan terus berkembang menjadi desa yang maju, mandiri, serta mampu memberikan pelayanan terbaik bagi seluruh masyarakatnya.',
      imageUrl: 'assets/luwung/hero.jpg',
      isPlaceholder: false,
      hasPartialPlaceholder: false,
      isVisiblePublic: true
    }
  ],

  gallery: [
    {
      id: 'gal-1',
      title: 'Kompleks Situs & Pendopo Bata Merah Desa Luwung',
      caption: 'Arsitektur gapura bata merah khas Cirebon berhias piring keramik dan bangunan pendopo di kompleks situs sejarah Desa Luwung. [ISI NAMA SITUS]',
      imageUrl: 'assets/luwung/hero.jpg',
      thumbUrl: 'assets/luwung/thumbs/hero-sm.jpg',
      alt: 'Gapura bata merah dan pendopo kayu di Desa Luwung Kecamatan Mundu Kabupaten Cirebon',
      category: 'Situs Sejarah',
      isPlaceholderCaption: true
    },
    {
      id: 'gal-2',
      title: 'Gerbang Bata Kuno Kompleks Kramat Desa Luwung',
      caption: 'Pintu gerbang bata merah kuno pada kompleks situs bersejarah di Blok Kramat, Desa Luwung. [ISI NAMA SITUS]',
      imageUrl: 'assets/luwung/gerbang-bata.jpg',
      thumbUrl: 'assets/luwung/thumbs/gerbang-bata-sm.jpg',
      alt: 'Gerbang bata merah kuno berpintu kayu di situs sejarah Desa Luwung',
      category: 'Situs Sejarah',
      isPlaceholderCaption: true
    },
    {
      id: 'gal-3',
      title: 'Kompleks Makam Pangeran Raja Muhammad (Pangeran Luwung)',
      caption: 'Bagian dalam kompleks makam Pangeran Raja Muhammad (Pangeran Luwung) di Blok Kramat, tokoh penyebaran agama Islam di wilayah Cirebon.',
      imageUrl: 'assets/luwung/makam-dalam.jpg',
      thumbUrl: 'assets/luwung/thumbs/makam-dalam-sm.jpg',
      alt: 'Cungkup makam Pangeran Luwung di Blok Kramat Desa Luwung Cirebon',
      category: 'Situs Sejarah',
      isPlaceholderCaption: false
    },
    {
      id: 'gal-4',
      title: 'Kepala Desa (Kuwu) Desa Luwung — Muhammad Syarofi Kunaedi',
      caption: 'Bapak Muhammad Syarofi Kunaedi, Kepala Desa (Kuwu) Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon.',
      imageUrl: 'assets/luwung/kades.jpg',
      thumbUrl: 'assets/luwung/thumbs/kades-sm.jpg',
      alt: 'Potret Bapak Muhammad Syarofi Kunaedi Kepala Desa Luwung',
      category: 'Pemerintahan Desa',
      isPlaceholderCaption: false
    }
  ],

  faqs: [
    {
      q: 'Apakah membuat laporan pengaduan atau mengurus surat di SimpelDesa dipungut biaya?',
      a: 'Tidak. Seluruh layanan pengaduan masyarakat dan pengajuan administrasi surat di Pemerintah Desa Luwung melalui SimpelDesa 100% GRATIS tanpa pungutan biaya.'
    },
    {
      q: 'Mengapa warga harus login terlebih dahulu sebelum membuat pengaduan atau mengajukan surat?',
      a: 'Untuk memastikan setiap laporan dan permohonan surat berasal dari warga yang dapat dipertanggungjawabkan serta memudahkan petugas desa mengirimkan pemberitahuan tindak lanjut. Namun Anda tetap dapat memilih opsi "Sembunyikan identitas dari publik" saat melapor.'
    },
    {
      q: 'Bagaimana keamanan data NIK 16 digit saya di SimpelDesa?',
      a: 'Sesuai prinsip Pelindungan Data Pribadi (UU PDP), NIK Anda dienkripsi dan disamarkan saat ditampilkan di layar (contoh: 320912********03). Halaman publik Lacak Tiket sama sekali tidak menampilkan identitas pribadi pelapor.'
    },
    {
      q: 'Bagaimana cara menghubungi Kantor Desa Luwung secara langsung?',
      a: 'Anda dapat datang langsung ke Kantor Kuwu Desa Luwung (Plus Code: 6HGV+VJ8, Kec. Mundu, Kab. Cirebon 45173) pada jam kerja atau menghubungi WhatsApp Layanan Desa di nomor 088707868654.'
    }
  ],

  notifications: [
    {
      id: 'notif-1',
      userId: 'usr-warga-01',
      title: 'Pengaduan LPR-2026-000101 Telah Selesai!',
      body: 'Laporan lampu PJU di Blok Kramat telah selesai diperbaiki oleh petugas desa. Silakan berikan penilaian kepuasan Anda.',
      isRead: false,
      createdAt: '2026-11-04 14:25'
    },
    {
      id: 'notif-2',
      userId: 'usr-warga-01',
      title: 'Surat Keterangan Domisili (SKD) Terbit',
      body: 'Permohonan SRV-2026-00018 telah disahkan oleh Kuwu Muhammad Syarofi Kunaedi. Anda dapat mengunduh PDF surat sekarang.',
      isRead: false,
      createdAt: '2026-11-05 13:35'
    }
  ],

  auditLogs: [
    {
      id: 'aud-1',
      actorName: 'Kaur Pelayanan & Trantib',
      actorRole: 'PETUGAS',
      action: 'UPDATE_STATUS_PENGADUAN',
      target: 'LPR-2026-000101 (Status -> SELESAI)',
      timestamp: '2026-11-04 14:20 WIB',
      ip: '127.0.0.1'
    },
    {
      id: 'aud-2',
      actorName: 'Muhammad Syarofi Kunaedi (Super Admin)',
      actorRole: 'SUPER_ADMIN',
      action: 'TERBITKAN_SURAT_PDF',
      target: 'SRV-2026-00018 (No: 474.4/018/DS-LWG/XI/2026)',
      timestamp: '2026-11-05 13:30 WIB',
      ip: '127.0.0.1'
    },
    {
      id: 'aud-3',
      actorName: 'Muhammad Syarofi Kunaedi (Super Admin)',
      actorRole: 'SUPER_ADMIN',
      action: 'PUBLIKASI_PENGUMUMAN',
      target: 'Pelayanan Administrasi Terpadu SimpelDesa Luwung',
      timestamp: '2026-11-01 08:30 WIB',
      ip: '127.0.0.1'
    }
  ]
};
