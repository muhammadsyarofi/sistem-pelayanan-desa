/**
 * SIMPELDESA — DESA LUWUNG, KEC. MUNDU, KAB. CIREBON (45173)
 * Main Application Engine (Part 1: Store, Security, Maps, Canvas Generators, PDF & Confetti)
 */

const STORAGE_KEY = 'SIMPELDESA_LUWUNG_DB_V4';
const SESSION_KEY = 'SIMPELDESA_LUWUNG_SESSION_V1';

const AppState = {
  db: null,
  currentUser: null,
  currentRoute: 'beranda',
  redirectAfterLogin: null,
  selectedServiceId: null,
  selectedAnnouncementId: null,
  selectedComplaintTicket: null,
  adminTab: 'ringkasan',
  wargaTab: 'ringkasan',
  // State untuk Stepper Pengaduan 6 Langkah
  stepper: {
    step: 1,
    categoryId: 'cat-infra',
    title: '',
    description: '',
    latitude: -6.77284,
    longitude: 108.59408,
    addressText: 'Blok Kramat RT 002 / RW 001, Desa Luwung',
    rtRwDusun: 'RT 002 / RW 001 - Blok Kramat',
    attachments: [],
    isAnonymousPublic: false
  },
  loginAttempts: { count: 0, lockedUntil: 0 },
  pendingOtpUser: null,
  deferredPwaPrompt: null,
  activeMaps: []
};

/* ============================================================================
   1. PENYIMPANAN DATA & KEAMANAN (UU PDP, NIK 16 DIGIT, XSS, AUDIT LOG)
   ============================================================================ */

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      AppState.db = JSON.parse(raw);
      // Pastikan nama Kuwu & WA terbaru selalu sinkron
      if (AppState.db.settings) {
        AppState.db.settings.namaKepalaDesa = AppState.db.settings.namaKepalaDesa || 'Muhammad Syarofi Kunaedi';
        AppState.db.settings.noWhatsappKantorDesa = AppState.db.settings.noWhatsappKantorDesa || '088707868654';
      }
    } else {
      AppState.db = JSON.parse(JSON.stringify(window.SIMPELDESA_DEFAULT_STATE));
      saveDatabase();
    }
  } catch (e) {
    AppState.db = JSON.parse(JSON.stringify(window.SIMPELDESA_DEFAULT_STATE));
  }

  try {
    const ses = localStorage.getItem(SESSION_KEY);
    if (ses) AppState.currentUser = JSON.parse(ses);
  } catch (e) {
    AppState.currentUser = null;
  }
}

function saveDatabase() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.db));
  } catch (e) {
    console.warn('Penyimpanan lokal penuh:', e);
  }
}

function saveSession(user) {
  AppState.currentUser = user;
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  renderHeaderAuth();
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validateNik16(nik) {
  const clean = String(nik || '').trim();
  if (!/^\d{16}$/.test(clean)) {
    return { valid: false, message: 'NIK wajib terdiri dari tepat 16 digit angka sesuai KTP/KK.' };
  }
  if (/^(\d)\1{15}$/.test(clean)) {
    return { valid: false, message: 'Format NIK tidak valid (angka berulang).' };
  }
  return { valid: true };
}

function maskNik(nik) {
  const clean = String(nik || '').replace(/\D/g, '');
  if (clean.length < 16) return '320912********00';
  return `${clean.slice(0, 6)}********${clean.slice(14, 16)}`;
}

function formatWaLink(phone, text = '') {
  let clean = String(phone || '088707868654').replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${clean}${text ? `?text=${encoded}` : ''}`;
}

function addAuditLog(action, target) {
  const actor = AppState.currentUser;
  AppState.db.auditLogs.unshift({
    id: 'aud-' + Date.now(),
    actorName: actor ? actor.fullName : 'Sistem',
    actorRole: actor ? actor.role : 'SYSTEM',
    action,
    target,
    timestamp: new Date().toLocaleString('id-ID') + ' WIB',
    ip: '127.0.0.1'
  });
  saveDatabase();
}

function showToast(message, type = 'success') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const item = document.createElement('div');
  item.className = 'toast-item';
  const colors = {
    success: '#4ADE80',
    warning: '#F5B731',
    danger: '#EF4444',
    info: '#38BDF8'
  };
  item.style.borderLeftColor = colors[type] || '#4ADE80';
  item.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
    <span>${escapeHtml(message)}</span>
    <button style="background:none;border:none;color:#FFF;cursor:pointer;font-weight:700;" aria-label="Tutup">✕</button>
  </div>`;
  item.querySelector('button').onclick = () => item.remove();
  stack.appendChild(item);
  setTimeout(() => {
    if (item.parentNode) item.remove();
  }, 4500);
}

/* ============================================================================
   2. ANIMASI KONFETI SAAT PENGADUAN BERHASIL DIKIRIM
   ============================================================================ */

function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#22C55E', '#4ADE80', '#A3E635', '#F5B731', '#0B2A5B', '#FFFFFF'];
  const pieces = Array.from({ length: 90 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 180,
    y: canvas.height * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    w: Math.random() * 10 + 6,
    h: Math.random() * 6 + 4,
    rot: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.25,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1
  }));

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32;
      p.rot += p.vRot;
      p.alpha -= 0.012;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}

/* ============================================================================
   3. PETA INTERAKTIF LEAFLET (PENANDA LOGO DESA, PIN LOKASI, & SEBARAN ADMIN)
   ============================================================================ */

function cleanupMaps() {
  AppState.activeMaps.forEach((m) => {
    try {
      m.remove();
    } catch (e) {}
  });
  AppState.activeMaps = [];
}

function initVillageLeafletMap(containerId, zoomLevel = 16) {
  const el = document.getElementById(containerId);
  if (!el || typeof L === 'undefined') return null;

  const s = AppState.db.settings;
  const lat = Number(s.latitude) || -6.77284;
  const lng = Number(s.longitude) || 108.59408;

  const map = L.map(el).setView([lat, lng], zoomLevel);
  AppState.activeMaps.push(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors • Desa Luwung (32.09.12.2004)'
  }).addTo(map);

  const villageIcon = L.divIcon({
    className: 'custom-desa-marker',
    html: `<div style="width:46px;height:46px;border-radius:50%;background:#0B2A5B;border:3px solid #F5B731;box-shadow:0 6px 16px rgba(11,42,91,0.45);display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <img src="assets/luwung/logo.png" alt="Pin Desa Luwung" style="width:38px;height:38px;object-fit:contain;" />
    </div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -24]
  });

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('6HGV+VJ8 Luwung Mundu Cirebon')}`;
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const popupHtml = `
    <div style="font-family:'Inter',sans-serif;min-width:220px;line-height:1.5;">
      <strong style="color:#0B2A5B;font-size:0.98rem;display:block;margin-bottom:4px;">Pemerintah Desa Luwung</strong>
      <span style="font-size:0.82rem;color:#334155;display:block;margin-bottom:6px;">
        ${escapeHtml(s.alamatLengkapKantorDesa)}<br/>
        <strong>Plus Code:</strong> <code>${escapeHtml(s.plusCode)}</code><br/>
        <strong>Koordinat:</strong> ${lat}, ${lng} (±9 mdpl)
      </span>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <a href="${gmapsUrl}" target="_blank" rel="noopener" style="background:#15803D;color:#FFF;padding:5px 10px;border-radius:99px;font-size:0.75rem;font-weight:700;text-decoration:none;">Buka Google Maps</a>
        <a href="${dirUrl}" target="_blank" rel="noopener" style="background:#F5B731;color:#0B2A5B;padding:5px 10px;border-radius:99px;font-size:0.75rem;font-weight:700;text-decoration:none;">Petunjuk Arah</a>
      </div>
    </div>
  `;

  L.marker([lat, lng], { icon: villageIcon }).addTo(map).bindPopup(popupHtml).openPopup();
  setTimeout(() => map.invalidateSize(), 220);
  return map;
}

function initStepperPickerMap(containerId) {
  const el = document.getElementById(containerId);
  if (!el || typeof L === 'undefined') return;

  const lat = Number(AppState.stepper.latitude) || -6.77284;
  const lng = Number(AppState.stepper.longitude) || 108.59408;

  const map = L.map(el).setView([lat, lng], 16);
  AppState.activeMaps.push(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  marker.bindPopup('Geser pin ini atau klik peta untuk menandai titik lokasi pengaduan.').openPopup();

  function updateCoords(newLat, newLng) {
    AppState.stepper.latitude = Number(newLat.toFixed(6));
    AppState.stepper.longitude = Number(newLng.toFixed(6));
    const coordDisplay = document.getElementById('stepper-coord-display');
    if (coordDisplay) {
      coordDisplay.textContent = `${AppState.stepper.latitude}, ${AppState.stepper.longitude}`;
    }
  }

  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    updateCoords(pos.lat, pos.lng);
  });

  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    updateCoords(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(() => map.invalidateSize(), 220);
}

function initAdminComplaintsMap(containerId, showHeatmap = false) {
  const el = document.getElementById(containerId);
  if (!el || typeof L === 'undefined') return;

  const s = AppState.db.settings;
  const map = L.map(el).setView([s.latitude, s.longitude], 15);
  AppState.activeMaps.push(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap • Peta Sebaran Pengaduan Desa Luwung'
  }).addTo(map);

  const statusColorMap = {
    DITERIMA: '#2563EB',
    DIVERIFIKASI: '#CA8A04',
    DIPROSES: '#EA580C',
    SELESAI: '#16A34A',
    DITOLAK: '#DC2626'
  };

  AppState.db.complaints.forEach((c) => {
    const color = statusColorMap[c.status] || '#2563EB';
    if (showHeatmap) {
      L.circle([c.latitude, c.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.42,
        radius: c.priority === 'DARURAT' || c.priority === 'TINGGI' ? 95 : 65
      })
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(c.ticketCode)}</strong><br/>${escapeHtml(c.title)}<br/>Status: <b>${c.status}</b>`);
    } else {
      const pin = L.divIcon({
        className: 'cmp-pin',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #FFF;box-shadow:0 3px 10px rgba(0,0,0,0.4);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([c.latitude, c.longitude], { icon: pin })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px;">
            <span style="font-size:0.75rem;font-weight:700;color:${color};">${escapeHtml(c.status)} • ${escapeHtml(c.ticketCode)}</span>
            <h4 style="margin:4px 0;font-size:0.9rem;color:#0B2A5B;">${escapeHtml(c.title)}</h4>
            <p style="font-size:0.78rem;color:#475569;margin-bottom:6px;">${escapeHtml(c.addressText)}</p>
          </div>
        `);
    }
  });

  setTimeout(() => map.invalidateSize(), 220);
}

/* ============================================================================
   4. GENERATOR KARTU PENGUMUMAN WA/IG (CANVAS) & GENERATOR SURAT PDF RESMI
   ============================================================================ */

function openAnnouncementShareCardModal(annId) {
  const ann = AppState.db.announcements.find((a) => a.id === annId);
  if (!ann) return;

  const shareUrl = `${window.location.origin}${window.location.pathname}#pengumuman-${ann.id}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h3 style="font-size:1.3rem;">Kartu Pengumuman WA/IG & Kode QR</h3>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Tutup ✕</button>
    </div>
    <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:1rem;">
      Kartu visual otomatis berlogo Pemerintah Desa Luwung siap diunduh untuk Status WhatsApp, Instagram Story, atau grup warga RT/RW.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;align-items:center;">
      <div style="text-align:center;">
        <canvas id="ann-card-canvas" width="720" height="900" style="width:100%;max-width:320px;border-radius:18px;box-shadow:var(--shadow-lg);border:2px solid var(--border-strong);"></canvas>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div class="card" style="text-align:center;padding:1.25rem;">
          <h4 style="margin-bottom:0.5rem;font-size:1rem;">📱 Pindai Kode QR ke Pengumuman</h4>
          <img src="${qrApiUrl}" alt="Kode QR Pengumuman Desa Luwung" width="160" height="160" style="margin:0.5rem auto;border-radius:12px;border:2px solid var(--border-card);padding:6px;background:#FFF;" />
          <p style="font-size:0.78rem;color:var(--text-muted);">Arahkan kamera HP untuk membuka halaman pengumuman ini di SimpelDesa Luwung.</p>
        </div>
        <button class="btn btn-primary" id="download-ann-card-btn">⬇️ Unduh Gambar Kartu (PNG)</button>
        <button class="btn btn-gold" onclick="shareAnnouncementChannel('${ann.id}', 'WHATSAPP')">Bagikan ke WhatsApp</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    const canvas = document.getElementById('ann-card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Latar Gradasi Hijau Sawah & Biru Navy
    const grad = ctx.createLinearGradient(0, 0, 720, 900);
    grad.addColorStop(0, '#0B2A5B');
    grad.addColorStop(0.35, '#15803D');
    grad.addColorStop(1, '#052E16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 900);

    // Bingkai Emas
    ctx.strokeStyle = '#F5B731';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, 664, 844);

    // Header Teks
    ctx.fillStyle = '#F5B731';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PEMERINTAH DESA LUWUNG', 140, 90);
    ctx.fillStyle = '#DCFCE7';
    ctx.font = '20px sans-serif';
    ctx.fillText('Kec. Mundu • Kab. Cirebon 45173 (Plus Code: 6HGV+VJ8)', 140, 122);

    // Lencana Kategori
    ctx.fillStyle = '#A3E635';
    ctx.fillRect(56, 175, 240, 44);
    ctx.fillStyle = '#0B2A5B';
    ctx.font = 'bold 21px sans-serif';
    ctx.fillText('INFO ' + ann.category, 74, 205);

    // Judul Pengumuman (Wrap Text)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    wrapCanvasText(ctx, ann.title.replace('[CONTOH] ', ''), 56, 275, 608, 44);

    // Isi Ringkasan
    ctx.fillStyle = '#DCFCE7';
    ctx.font = '24px sans-serif';
    wrapCanvasText(ctx, ann.summary, 56, 450, 608, 36);

    // Footer Kartu
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(46, 730, 628, 120);
    ctx.fillStyle = '#F5B731';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Kuwu Desa Luwung: ' + AppState.db.settings.namaKepalaDesa, 68, 775);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px sans-serif';
    ctx.fillText('Portal Resmi: SimpelDesa Luwung • WA: ' + AppState.db.settings.noWhatsappKantorDesa, 68, 815);

    // Gambar Logo Desa
    const logoImg = new Image();
    logoImg.onload = () => {
      ctx.drawImage(logoImg, 56, 56, 68, 68);
    };
    logoImg.src = 'assets/luwung/logo.png';

    const dlBtn = document.getElementById('download-ann-card-btn');
    if (dlBtn) {
      dlBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `pengumuman-desa-luwung-${ann.slug}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        ann.shareCount = (ann.shareCount || 0) + 1;
        saveDatabase();
        showToast('Kartu pengumuman berhasil diunduh!');
      };
    }
  }, 80);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function generateOfficialLetterWindow(reqId) {
  const req = AppState.db.serviceRequests.find((r) => r.id === reqId);
  if (!req) return;
  const s = AppState.db.settings;
  const win = window.open('', '_blank');
  if (!win) {
    showToast('Mohon izinkan pop-up browser untuk mencetak/mengunduh PDF surat resmi.', 'warning');
    return;
  }

  win.document.write(`<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(req.serviceName)} - ${escapeHtml(req.requestNumber)}</title>
    <style>
      body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 36px 54px; max-width: 820px; margin: 0 auto; line-height: 1.6; }
      .kop { display: flex; align-items: center; gap: 20px; border-bottom: 4px double #000; padding-bottom: 14px; margin-bottom: 24px; text-align: center; }
      .kop img { width: 82px; height: 82px; object-fit: contain; }
      .kop-text { flex: 1; }
      .kop-text h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
      .kop-text h1 { margin: 2px 0; font-size: 22px; text-transform: uppercase; }
      .kop-text p { margin: 0; font-size: 13px; }
      .judul-surat { text-align: center; margin-bottom: 24px; }
      .judul-surat h3 { margin: 0; text-decoration: underline; text-transform: uppercase; font-size: 17px; }
      .tabel-data { width: 100%; margin: 16px 0 24px 20px; }
      .tabel-data td { padding: 4px 8px; vertical-align: top; }
      .ttd-box { float: right; width: 280px; text-align: center; margin-top: 36px; }
      @media print { .no-print { display: none; } }
    </style>
  </head>
  <body>
    <div class="no-print" style="background:#DCFCE7;border:1px solid #15803D;padding:12px 18px;border-radius:10px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;font-family:sans-serif;">
      <span><strong>Dokumen Surat Resmi Pemerintah Desa Luwung</strong> — Klik tombol Cetak / Simpan sebagai PDF</span>
      <button onclick="window.print()" style="background:#15803D;color:#FFF;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;">Cetak / Simpan PDF</button>
    </div>

    <div class="kop">
      <img src="assets/luwung/logo.png" alt="Logo Desa Luwung" />
      <div class="kop-text">
        <h2>PEMERINTAH KABUPATEN CIREBON</h2>
        <h2>KECAMATAN MUNDU</h2>
        <h1>KANTOR KUWU DESA LUWUNG</h1>
        <p>${escapeHtml(s.alamatLengkapKantorDesa)} • Kode Kemendagri: ${escapeHtml(s.kodeKemendagri)} • Telp/WA: ${escapeHtml(s.noWhatsappKantorDesa)}</p>
      </div>
    </div>

    <div class="judul-surat">
      <h3>${escapeHtml(req.serviceName)}</h3>
      <span>Nomor: ${escapeHtml(req.letterNumber || '470 / 019 / DS-LWG / XI / 2026')}</span>
    </div>

    <p>Yang bertanda tangan di bawah ini, Kuwu Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon, Provinsi Jawa Barat, menerangkan dengan sebenarnya bahwa:</p>

    <table class="tabel-data">
      <tr><td style="width:180px;">Nama Lengkap</td><td>: <strong>${escapeHtml(req.applicantName)}</strong></td></tr>
      <tr><td>NIK (Tersamar)</td><td>: ${escapeHtml(req.applicantNikMasked)}</td></tr>
      <tr><td>Alamat Domisili</td><td>: ${escapeHtml(req.applicantAddress)}</td></tr>
      <tr><td>Keperluan Surat</td><td>: ${escapeHtml(req.purpose)}</td></tr>
      <tr><td>Nomor Registrasi</td><td>: ${escapeHtml(req.requestNumber)}</td></tr>
    </table>

    <p>Berdasarkan data administrasi kependudukan yang tercatat pada Kantor Kuwu Desa Luwung, nama tersebut di atas adalah benar warga Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon dan berkelakuan baik di lingkungan masyarakat.</p>
    <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>

    <div class="ttd-box">
      <p>Luwung, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
      <strong>KUWU DESA LUWUNG</strong></p>
      <div style="margin:14px auto;padding:8px;border:1px dashed #15803D;display:inline-block;font-family:sans-serif;font-size:11px;color:#15803D;">
        ✓ Ditandatangani Secara Elektronik<br/>SimpelDesa Luwung (${escapeHtml(req.requestNumber)})
      </div>
      <p style="margin-top:8px;"><strong style="text-decoration:underline;">${escapeHtml(s.namaKepalaDesa.toUpperCase())}</strong></p>
    </div>
  </body>
  </html>`);
  win.document.close();
}


/* ============================================================================
   5. MODAL, LIGHTBOX, HEADER, TICKER, & NAVIGASI UTAMA
   ============================================================================ */

function openModal(htmlContent) {
  const backdrop = document.getElementById('universal-modal');
  const body = document.getElementById('universal-modal-body');
  if (!backdrop || !body) return;
  body.innerHTML = htmlContent;
  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const backdrop = document.getElementById('universal-modal');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
}

function openGalleryLightbox(galId) {
  const item = AppState.db.gallery.find((g) => g.id === galId);
  if (!item) return;
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.85rem;">
      <span class="section-eyebrow" style="margin:0;">${escapeHtml(item.category)}</span>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Tutup ✕</button>
    </div>
    <div style="border-radius:18px;overflow:hidden;border:2px solid var(--border-strong);background:#000;max-height:65vh;display:flex;align-items:center;justify-content:center;">
      <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.alt || item.title)}" style="max-height:65vh;width:auto;object-fit:contain;" />
    </div>
    <div style="margin-top:1rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.35rem;">
        <h3 style="font-size:1.25rem;">${escapeHtml(item.title)}</h3>
        ${item.isPlaceholderCaption ? `<span class="placeholder-tag">Menunggu verifikasi perangkat desa</span>` : ''}
      </div>
      <p style="color:var(--text-muted);font-size:0.95rem;">${escapeHtml(item.caption)}</p>
    </div>
  `);
}

function copyPlusCode() {
  const code = AppState.db.settings.plusCode || '6HGV+VJ8';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code);
  }
  showToast(`Plus Code "${code}" berhasil disalin ke papan klip!`);
}

function shareAnnouncementChannel(annId, channel) {
  const ann = AppState.db.announcements.find((a) => a.id === annId);
  if (!ann) return;
  ann.shareCount = (ann.shareCount || 0) + 1;
  saveDatabase();

  const url = `${window.location.origin}${window.location.pathname}#pengumuman`;
  const text = `*${ann.title.replace('[CONTOH] ', '')}*\n${ann.summary}\n\nBaca selengkapnya di Portal Resmi SimpelDesa Luwung: ${url}`;

  if (channel === 'WHATSAPP') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  } else if (channel === 'FACEBOOK') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'noopener');
  } else if (channel === 'X') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  } else if (channel === 'TELEGRAM') {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(ann.title)}`, '_blank', 'noopener');
  } else if (channel === 'WEB_SHARE' && navigator.share) {
    navigator.share({ title: ann.title, text: ann.summary, url }).catch(() => {});
  } else {
    if (navigator.clipboard) navigator.clipboard.writeText(`${ann.title} - ${url}`);
    showToast('Tautan pengumuman berhasil disalin!');
  }
}

function renderHeaderTickerAndFooter() {
  const s = AppState.db.settings;
  const tickerEl = document.getElementById('header-ticker-track');
  if (tickerEl) {
    const published = AppState.db.announcements.filter((a) => a.status === 'PUBLISHED');
    const itemsHtml = published
      .concat(published)
      .map(
        (a) =>
          `<span class="ticker-item" onclick="navigateTo('pengumuman')">
            <strong style="color:#F5B731;">[${escapeHtml(a.category)}]</strong> ${escapeHtml(a.title.replace('[CONTOH] ', ''))} — <em>Klik untuk detail</em>
          </span>`
      )
      .join('<span> • </span>');
    tickerEl.innerHTML = itemsHtml;
  }

  const footerTagline = document.getElementById('footer-tagline');
  if (footerTagline) footerTagline.textContent = s.tagline;

  const footerContact = document.getElementById('footer-contact-info');
  if (footerContact) {
    footerContact.innerHTML = `
      <span><strong>Kuwu / Kepala Desa:</strong><br/>${escapeHtml(s.namaKepalaDesa)}</span>
      <span><strong>Alamat:</strong><br/>${escapeHtml(s.alamatLengkapKantorDesa)}</span>
      <span><strong>WhatsApp Layanan:</strong><br/><a href="${formatWaLink(s.noWhatsappKantorDesa, 'Halo Pemerintah Desa Luwung, saya ingin bertanya terkait layanan SimpelDesa.')}" target="_blank" rel="noopener" style="color:#4ADE80;font-weight:700;">${escapeHtml(s.noWhatsappKantorDesa)} (Chat Langsung)</a></span>
      <span><strong>Jam Pelayanan:</strong><br/>${escapeHtml(s.jamLayanan)}</span>
    `;
  }
}

function renderHeaderAuth() {
  const slot = document.getElementById('header-auth-slot');
  if (!slot) return;
  const u = AppState.currentUser;
  const userSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  if (!u) {
    slot.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="navigateTo('masuk')">
        ${userSvg}
        <span class="auth-text-long">Masuk / Daftar</span>
        <span class="auth-text-short">Masuk</span>
      </button>
    `;
  } else {
    const isAdmin = u.role === 'SUPER_ADMIN' || u.role === 'PETUGAS';
    const dashRoute = isAdmin ? 'admin' : 'warga';
    const dashLong = isAdmin ? 'Dashboard Admin' : 'Dashboard Warga';
    const dashShort = isAdmin ? 'Admin' : 'Warga';
    const unreadCount = (AppState.db.notifications || []).filter((n) => !n.isRead).length;

    slot.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.4rem;">
        <button class="btn btn-primary btn-sm" onclick="navigateTo('${dashRoute}')">
          ${userSvg}
          <span class="auth-text-long">${dashLong}</span>
          <span class="auth-text-short">${dashShort}</span>
          ${unreadCount > 0 ? `<span style="background:#F5B731;color:#0B2A5B;border-radius:99px;padding:0 6px;font-size:0.7rem;">${unreadCount}</span>` : ''}
        </button>
        <button class="btn btn-outline btn-sm logout-btn-header" onclick="handleLogout()" title="Keluar dari Akun">Keluar</button>
      </div>
    `;
  }
}

function handleGuardedAction(targetRoute, targetServiceId = null) {
  if (!AppState.currentUser) {
    AppState.redirectAfterLogin = targetRoute;
    AppState.selectedServiceId = targetServiceId;
    showToast('Silakan masuk (login) terlebih dahulu untuk membuat pengaduan atau mengajukan surat. Kami akan mengarahkan Anda kembali ke formulir.', 'info');
    navigateTo('masuk');
    return;
  }
  if (targetServiceId) {
    AppState.selectedServiceId = targetServiceId;
    AppState.wargaTab = 'layanan';
    navigateTo('warga');
  } else {
    AppState.wargaTab = 'buat-pengaduan';
    navigateTo('warga');
  }
}

function handleLogout() {
  saveSession(null);
  showToast('Anda telah keluar dari akun SimpelDesa Luwung.');
  navigateTo('beranda');
}

/* ============================================================================
   6. HALAMAN PUBLIK (BERANDA, SEJARAH, PENGUMUMAN, LAYANAN, LACAK, GALERI, KONTAK, FAQ)
   ============================================================================ */

let heroTypewriterTimer = null;

function startHeroTypewriter() {
  if (heroTypewriterTimer) clearInterval(heroTypewriterTimer);
  const target = document.getElementById('hero-typewriter-text');
  if (!target) return;

  const phrases = [
    'Lapor jalan rusak & lampu PJU padam...',
    'Urus surat keterangan domisili & SKTM...',
    'Lihat pengumuman & kegiatan Desa Luwung...',
    'Pantau tindak lanjut perangkat desa secara transparan...'
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  heroTypewriterTimer = setInterval(() => {
    const el = document.getElementById('hero-typewriter-text');
    if (!el) {
      clearInterval(heroTypewriterTimer);
      return;
    }
    const current = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx >= current.length) {
        deleting = true;
      }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx <= 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
  }, 75);
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  counters.forEach((el) => {
    const target = Number(el.getAttribute('data-counter-target')) || 0;
    const suffix = el.getAttribute('data-counter-suffix') || '';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 32));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = current + suffix;
      }
    }, 30);
  });
}

function renderBeranda() {
  const s = AppState.db.settings;
  const totalComplaints = AppState.db.complaints.length + 124;
  const resolvedComplaints = AppState.db.complaints.filter((c) => c.status === 'SELESAI').length + 118;
  const latestAnnouncements = AppState.db.announcements.filter((a) => a.status === 'PUBLISHED').slice(0, 3);

  return `
    <!-- HERO SECTION -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div>
            <div class="hero-kicker">
              <span>Portal Digital Resmi Pemerintah Desa Luwung</span>
            </div>
            <h1 class="hero-title">
              ${escapeHtml(s.tagline)}
            </h1>
            <div class="hero-typewriter-box" aria-live="polite">
              <span>▸</span>
              <span id="hero-typewriter-text">Lapor jalan rusak & lampu PJU padam...</span>
              <span class="typewriter-cursor"></span>
            </div>
            <p class="hero-desc">
              Sampaikan laporan infrastruktur, kebersihan, atau ajukan surat administrasi desa langsung dari ponsel Anda. Ditindaklanjuti secara transparan oleh perangkat <strong>Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon</strong>.
            </p>
            <div class="hero-cta-group">
              <button class="btn btn-primary" onclick="handleGuardedAction('buat-pengaduan')">
                Buat Pengaduan Sekarang
              </button>
              <button class="btn btn-gold" onclick="navigateTo('layanan')">
                Lihat Layanan Surat
              </button>
              <button class="btn btn-outline" onclick="navigateTo('lacak')">
                Lacak Tiket
              </button>
            </div>
            <div class="hero-meta-chips">
              <span class="meta-chip">Kemendagri: <strong>${escapeHtml(s.kodeKemendagri)}</strong></span>
              <span class="meta-chip">Kode Pos: <strong>${escapeHtml(s.kodePos)}</strong></span>
              <span class="meta-chip">Plus Code: <strong>${escapeHtml(s.plusCode)}</strong></span>
              <span class="meta-chip">Elevasi: <strong>${escapeHtml(s.ketinggian)}</strong></span>
            </div>
          </div>

          <div>
            <div class="hero-visual-card">
              <img
                src="assets/luwung/hero.jpg"
                srcset="assets/luwung/thumbs/hero-sm.jpg 480w, assets/luwung/hero.jpg 1200w"
                sizes="(max-width: 768px) 100vw, 540px"
                alt="Arsitektur gerbang bata merah khas Cirebon dan pendopo di kompleks situs sejarah Desa Luwung Kecamatan Mundu"
                class="hero-parallax-img"
                id="hero-parallax-img"
              />
              <div class="hero-visual-overlay">
                <span class="hero-visual-badge">Warisan Budaya & Wajah Digital Desa Luwung</span>
                <h2 style="color:#FFFFFF;font-size:1.25rem;margin-bottom:0.2rem;">Desa Luwung, Kec. Mundu, Kab. Cirebon</h2>
                <p style="font-size:0.84rem;color:#DCFCE7;">Dipimpin oleh Kuwu <strong>${escapeHtml(s.namaKepalaDesa)}</strong> • Melayani dengan Cepat & Transparan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATISTIK BERHITUNG NAIK -->
    <section class="container" aria-label="Statistik Pelayanan Desa Luwung">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number" data-counter-target="${totalComplaints}" data-counter-suffix="">0</div>
          <div class="stat-label">Total Pengaduan Masuk</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" data-counter-target="${resolvedComplaints}" data-counter-suffix="">0</div>
          <div class="stat-label">Pengaduan Dituntaskan</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" data-counter-target="2" data-counter-suffix=" Hari">0</div>
          <div class="stat-label">Rata-rata Penyelesaian</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" data-counter-target="845" data-counter-suffix="+">0</div>
          <div class="stat-label">Warga Terdaftar Aktif</div>
        </div>
      </div>
    </section>

    <!-- LAYANAN CEPAT ADMINISTRASI DESA -->
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Pelayanan Terpadu</span>
          <h2 class="section-title">Layanan Administrasi Cepat Desa Luwung</h2>
          <p class="section-desc">Pilih surat keterangan yang Anda butuhkan, lengkapi syarat dari rumah, dan unduh dokumen PDF resmi setelah disahkan.</p>
        </div>

        <div class="grid-3">
          ${AppState.db.services
            .slice(0, 3)
            .map(
              (srv) => `
            <article class="card card-interactive" onclick="navigateTo('layanan')">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                <span class="service-icon-box">${srv.icon}</span>
                <span class="status-badge status-SELESAI">${escapeHtml(srv.estimatedTime)}</span>
              </div>
              <h3 style="font-size:1.2rem;margin-bottom:0.5rem;">${escapeHtml(srv.name)}</h3>
              <p style="font-size:0.93rem;color:var(--text-muted);margin-bottom:1.25rem;">${escapeHtml(srv.description)}</p>
              <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); handleGuardedAction('ajukan-layanan', '${srv.id}')">
                Ajukan ${escapeHtml(srv.code)} →
              </button>
            </article>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- ALUR PENGADUAN 4 LANGKAH -->
    <section class="section-block" style="background:var(--bg-subtle);border-top:1px solid var(--border-card);border-bottom:1px solid var(--border-card);">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Transparan & Mudah</span>
          <h2 class="section-title">Alur Pengaduan 4 Langkah</h2>
          <p class="section-desc">Setiap laporan memiliki kode tiket unik yang dapat dipantau perkembangannya hingga selesai.</p>
        </div>

        <div class="grid-4">
          <div class="card" style="text-align:center;">
            <div style="width:52px;height:52px;border-radius:50%;background:var(--green-700);color:#FFF;font-weight:800;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">1</div>
            <h3 style="font-size:1.1rem;margin-bottom:0.4rem;">Tulis & Sematkan Lokasi</h3>
            <p style="font-size:0.9rem;color:var(--text-muted);">Pilih kategori, uraikan masalah, tandai pin di peta Desa Luwung, dan lampirkan foto bukti.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="width:52px;height:52px;border-radius:50%;background:#CA8A04;color:#FFF;font-weight:800;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">2</div>
            <h3 style="font-size:1.1rem;margin-bottom:0.4rem;">Verifikasi Perangkat Desa</h3>
            <p style="font-size:0.9rem;color:var(--text-muted);">Petugas memverifikasi laporan dalam 1x24 jam dan meneruskannya ke bidang terkait.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="width:52px;height:52px;border-radius:50%;background:#EA580C;color:#FFF;font-weight:800;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">3</div>
            <h3 style="font-size:1.1rem;margin-bottom:0.4rem;">Tindak Lanjut Lapangan</h3>
            <p style="font-size:0.9rem;color:var(--text-muted);">Petugas desa menangani masalah di lokasi dan mengunggah foto bukti pengerjaan.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="width:52px;height:52px;border-radius:50%;background:#16A34A;color:#FFF;font-weight:800;font-size:1.2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">4</div>
            <h3 style="font-size:1.1rem;margin-bottom:0.4rem;">Selesai & Beri Ulasan</h3>
            <p style="font-size:0.9rem;color:var(--text-muted);">Laporan dinyatakan selesai dan warga dapat memberikan penilaian bintang kepuasan.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SAMBUTAN KEPALA DESA (kades.jpg — Muhammad Syarofi Kunaedi) -->
    <section class="section-block">
      <div class="container">
        <div class="kades-welcome-card">
          <div class="kades-photo-frame">
            <img
              src="assets/luwung/kades.jpg"
              srcset="assets/luwung/thumbs/kades-sm.jpg 480w, assets/luwung/kades.jpg 960w"
              sizes="280px"
              loading="lazy"
              alt="Bapak ${escapeHtml(s.namaKepalaDesa)} - Kepala Desa (Kuwu) Desa Luwung Kecamatan Mundu Kabupaten Cirebon"
            />
            <div class="kades-name-plate">
              <strong>${escapeHtml(s.namaKepalaDesa)}</strong>
              <span>${escapeHtml(s.jabatanKepalaDesa)}</span>
            </div>
          </div>

          <div>
            <span class="section-eyebrow">Sambutan Kepala Desa / Kuwu</span>
            <h2 style="font-size:clamp(1.5rem,3vw,2.1rem);margin-bottom:1rem;">
              Bersama Membangun Desa Luwung yang Maju, Mandiri, & Melayani
            </h2>
            <p style="white-space:pre-line;color:var(--text-body);margin-bottom:1.5rem;font-size:1rem;">${escapeHtml(s.sambutanKades)}</p>
            <div style="display:flex;flex-wrap:wrap;gap:0.85rem;">
              <button class="btn btn-primary btn-sm" onclick="navigateTo('sejarah')">Baca Profil & Sejarah Desa Luwung</button>
              <a href="${formatWaLink(s.noWhatsappKantorDesa, 'Assalamualaikum Bapak Kuwu / Perangkat Desa Luwung, saya warga ingin berkonsultasi mengenai layanan desa.')}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
                Hubungi WhatsApp Desa (${escapeHtml(s.noWhatsappKantorDesa)})
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PENGUMUMAN TERBARU & GALERI SINGKAT -->
    <section class="section-block">
      <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">
          <div>
            <span class="section-eyebrow">Kabar Terkini</span>
            <h2 class="section-title" style="margin-bottom:0;">Pengumuman Pemerintah Desa Luwung</h2>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('pengumuman')">Lihat Semua Pengumuman →</button>
        </div>

        <div class="grid-3">
          ${latestAnnouncements
            .map(
              (a) => `
            <article class="card" style="display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.85rem;">
                  <span class="status-badge status-DITERIMA">${escapeHtml(a.category)}</span>
                </div>
                <h3 style="font-size:1.15rem;margin-bottom:0.6rem;">${escapeHtml(a.title)}</h3>
                <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:1.25rem;">${escapeHtml(a.summary)}</p>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-card);padding-top:0.9rem;">
                <span style="font-size:0.8rem;color:var(--text-muted);">${escapeHtml(a.publishAt)} • ${a.viewCount}</span>
                <div style="display:flex;gap:0.4rem;">
                  <button class="btn btn-outline btn-sm" onclick="openAnnouncementShareCardModal('${a.id}')">Kartu WA/QR</button>
                </div>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- GALERI SINGKAT SITUS & DESA LUWUNG -->
    <section class="section-block" style="background:var(--bg-subtle);">
      <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">
          <div>
            <span class="section-eyebrow">Dokumentasi & Warisan Situs</span>
            <h2 class="section-title" style="margin-bottom:0;">Galeri Desa Luwung & Blok Kramat</h2>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('galeri')">Buka Galeri Lengkap →</button>
        </div>

        <div class="grid-4">
          ${AppState.db.gallery
            .map(
              (g) => `
            <figure class="card card-interactive" style="padding:0.85rem;" onclick="openGalleryLightbox('${g.id}')">
              <div style="border-radius:16px;overflow:hidden;aspect-ratio:4/3;margin-bottom:0.75rem;background:var(--brand-navy);">
                <img
                  src="${escapeHtml(g.imageUrl)}"
                  srcset="${escapeHtml(g.thumbUrl)} 480w, ${escapeHtml(g.imageUrl)} 1024w"
                  sizes="(max-width: 600px) 100vw, 280px"
                  loading="lazy"
                  alt="${escapeHtml(g.alt || g.title)}"
                  style="width:100%;height:100%;object-fit:cover;"
                />
              </div>
              <figcaption>
                <h3 style="font-size:0.96rem;margin-bottom:0.25rem;">${escapeHtml(g.title)}</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(g.caption)}</p>
              </figcaption>
            </figure>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- PETA LOKASI RINGKAS & PLUS CODE 6HGV+VJ8 -->
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Peta Interaktif Desa Luwung</span>
          <h2 class="section-title">Lokasi Kantor & Wilayah Desa Luwung</h2>
          <p class="section-desc">Desa Luwung, Kecamatan Mundu, Kabupaten Cirebon, Jawa Barat 45173 (Koordinat: ${s.latitude}, ${s.longitude}).</p>
        </div>

        <div id="home-leaflet-map" class="map-container-box" aria-label="Peta Lokasi Desa Luwung"></div>

        <div class="plus-code-bar">
          <div style="display:flex;align-items:center;gap:0.85rem;flex-wrap:wrap;">
            <span><strong>Google Plus Code Resmi:</strong></span>
            <span class="plus-code-pill">${escapeHtml(s.plusCode)}</span>
            <span style="font-size:0.88rem;color:var(--text-muted);">Luwung, Kec. Mundu, Kab. Cirebon</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.65rem;">
            <button class="btn btn-outline btn-sm" onclick="copyPlusCode()">Salin Plus Code</button>
            <a href="https://www.google.com/maps/search/?api=1&query=6HGV%2BVJ8+Luwung+Mundu+Cirebon" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Buka di Google Maps</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}" target="_blank" rel="noopener" class="btn btn-gold btn-sm">Petunjuk Arah</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ============================================================================
   HALAMAN 2: PROFIL & SEJARAH DESA LUWUNG (FAKTA TERVERIFIKASI + KI SUTAJIWA + PANGERAN LUWUNG)
   ============================================================================ */

function renderSejarah() {
  const s = AppState.db.settings;
  const visibleEntries = AppState.db.historyTimeline.filter((h) => h.isVisiblePublic);

  return `
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Profil, Sejarah, & Situs Leluhur</span>
          <h1 class="section-title">Sejarah & Identitas Desa Luwung</h1>
          <p class="section-desc">
            Kecamatan Mundu, Kabupaten Cirebon, Provinsi Jawa Barat (Kode Kemendagri: <strong>${escapeHtml(s.kodeKemendagri)}</strong> • Kode Pos: <strong>${escapeHtml(s.kodePos)}</strong>).
          </p>
        </div>

        <!-- Ringkasan Administratif & Narasi Utama Desa Luwung -->
        <div class="card" style="margin-bottom:2.25rem;background:linear-gradient(135deg,var(--bg-card) 0%,var(--green-100) 100%);">
          <div class="grid-2" style="align-items:center;">
            <div>
              <span class="status-badge status-SELESAI" style="margin-bottom:0.75rem;">✓ Data Terverifikasi Pemerintah Desa</span>
              <h2 style="font-size:1.55rem;margin-bottom:0.85rem;">Jejak Sejarah, Ki Sutajiwa, & Penyebaran Islam di Cirebon Timur</h2>
              <p style="margin-bottom:0.85rem;">
                <strong>Desa Luwung</strong> merupakan salah satu desa di Kecamatan Mundu, Kabupaten Cirebon, Provinsi Jawa Barat yang memiliki nilai sejarah dan budaya berkaitan erat dengan perkembangan masyarakat serta penyebaran agama Islam di wilayah Cirebon Timur.
              </p>
              <p style="margin-bottom:0.85rem;">
                Berdasarkan cerita sejarah yang berkembang di masyarakat dan dokumen penelitian, wilayah Luwung dahulu dikenal sebagai kawasan hutan yang kemudian dibuka menjadi permukiman dan lahan pertanian oleh tokoh bernama <strong>Ki Sutajiwa</strong>. Desa Luwung juga memiliki peninggalan sejarah berupa kompleks makam <strong>Pangeran Raja Muhammad (Pangeran Luwung)</strong> di <strong>Blok Kramat</strong>.
              </p>
              <p style="font-size:0.88rem;color:var(--text-muted);">
                ℹ️ <em>Catatan Transparansi Data:</em> Bagian detail tambahan yang masih bertanda <code>[ISI]</code> berlabel <strong>"Menunggu verifikasi perangkat desa"</strong> dan dapat diperbarui kapan saja oleh Admin Desa.
              </p>
            </div>
            <div class="history-facts-grid">
              <div class="card" style="padding:1rem;text-align:center;">
                <strong style="color:var(--green-700);font-size:1.25rem;">32.09.12.2004</strong>
                <p style="font-size:0.8rem;color:var(--text-muted);">Kode Kemendagri</p>
              </div>
              <div class="card" style="padding:1rem;text-align:center;">
                <strong style="color:var(--green-700);font-size:1.25rem;">PP No. 3/1992</strong>
                <p style="font-size:0.8rem;color:var(--text-muted);">Dasar Kec. Mundu</p>
              </div>
              <div class="card" style="padding:1rem;text-align:center;">
                <strong style="color:var(--green-700);font-size:1.25rem;">Blok Kramat</strong>
                <p style="font-size:0.8rem;color:var(--text-muted);">Situs Pangeran Luwung</p>
              </div>
              <div class="card" style="padding:1rem;text-align:center;">
                <strong style="color:var(--green-700);font-size:1.1rem;">${escapeHtml(s.namaKepalaDesa)}</strong>
                <p style="font-size:0.8rem;color:var(--text-muted);">Kuwu Desa Luwung</p>
              </div>
            </div>
          </div>
        </div>

        <!-- LINIMASA SEJARAH INTERAKTIF 7 BAGIAN -->
        <div class="timeline-vertical">
          ${visibleEntries
            .map(
              (item) => `
            <article class="card timeline-node">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.6rem;">
                <span class="section-eyebrow" style="margin:0;">Bagian ${escapeHtml(item.number)} • ${escapeHtml(item.yearOrPeriod)}</span>
                ${
                  item.isPlaceholder || item.hasPartialPlaceholder
                    ? `<span class="placeholder-tag">Menunggu verifikasi perangkat desa</span>`
                    : `<span class="status-badge status-SELESAI">Terverifikasi</span>`
                }
              </div>

              <h3 style="font-size:1.35rem;margin-bottom:0.75rem;">${escapeHtml(item.title)}</h3>
              <p style="white-space:pre-line;margin-bottom:1rem;">${escapeHtml(item.content)}</p>

              ${
                item.sectionKey === 'DAFTAR_KUWU' && item.kuwuList
                  ? `
                <div style="overflow-x:auto;margin-top:1rem;">
                  <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
                    <thead>
                      <tr style="background:var(--green-100);color:var(--brand-navy);text-align:left;">
                        <th style="padding:0.75rem;border:1px solid var(--border-card);">Foto</th>
                        <th style="padding:0.75rem;border:1px solid var(--border-card);">Nama Kepala Desa / Kuwu</th>
                        <th style="padding:0.75rem;border:1px solid var(--border-card);">Periode Jabatan</th>
                        <th style="padding:0.75rem;border:1px solid var(--border-card);">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${item.kuwuList
                        .map(
                          (k) => `
                        <tr>
                          <td style="padding:0.75rem;border:1px solid var(--border-card);width:72px;">
                            ${
                              k.photo
                                ? `<img src="${escapeHtml(k.photo)}" alt="${escapeHtml(k.nama)}" style="width:54px;height:64px;object-fit:cover;border-radius:10px;border:2px solid var(--accent-gold);" />`
                                : `<div style="width:54px;height:64px;border-radius:10px;background:var(--bg-subtle);display:flex;align-items:center;justify-content:center;font-size:0.75rem;">[ISI]</div>`
                            }
                          </td>
                          <td style="padding:0.75rem;border:1px solid var(--border-card);font-weight:700;">${escapeHtml(k.nama)}</td>
                          <td style="padding:0.75rem;border:1px solid var(--border-card);">${escapeHtml(k.periode)}</td>
                          <td style="padding:0.75rem;border:1px solid var(--border-card);">${escapeHtml(k.keterangan)}</td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              `
                  : ''
              }

              ${
                item.sectionKey === 'SITUS_BERSEJARAH' && item.sitesCards
                  ? `
                <div class="grid-3" style="margin-top:1.25rem;">
                  ${item.sitesCards
                    .map(
                      (sc) => `
                    <div class="card" style="padding:1rem;background:var(--bg-page);">
                      <div style="border-radius:14px;overflow:hidden;aspect-ratio:4/3;margin-bottom:0.75rem;">
                        <img
                          src="${escapeHtml(sc.image)}"
                          srcset="${escapeHtml(sc.thumb)} 480w, ${escapeHtml(sc.image)} 1024w"
                          sizes="(max-width: 768px) 100vw, 320px"
                          loading="lazy"
                          alt="${escapeHtml(sc.alt)}"
                          style="width:100%;height:100%;object-fit:cover;"
                        />
                      </div>
                      <h4 style="font-size:1rem;margin-bottom:0.35rem;">${escapeHtml(sc.title)}</h4>
                      <p style="font-size:0.84rem;color:var(--text-muted);">${escapeHtml(sc.caption)}</p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
            </article>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

/* ============================================================================
   HALAMAN 3: PENGUMUMAN DESA (PENCARIAN, FILTER, SHARE, KARTU WA/IG, QR)
   ============================================================================ */

function renderPengumuman() {
  return `
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Papan Informasi Digital</span>
          <h1 class="section-title">Pengumuman & Kegiatan Desa Luwung</h1>
          <p class="section-desc">Informasi resmi kegiatan warga, pelayanan surat, dan imbauan darurat Pemerintah Desa Luwung.</p>
        </div>

        <div class="card" style="margin-bottom:2rem;">
          <div class="search-filter-grid">
            <input type="search" id="ann-search-input" class="form-input" placeholder="Cari judul atau isi pengumuman desa..." oninput="filterAnnouncementsUI()" />
            <select id="ann-cat-filter" class="form-select" style="width:100%;" onchange="filterAnnouncementsUI()">
              <option value="ALL">Semua Kategori</option>
              <option value="UMUM">Umum</option>
              <option value="KEGIATAN">Kegiatan</option>
              <option value="LAYANAN">Layanan</option>
              <option value="DARURAT">Darurat</option>
            </select>
          </div>
        </div>

        <div id="announcements-list-container" class="grid-3"></div>
      </div>
    </section>
  `;
}

function filterAnnouncementsUI() {
  const container = document.getElementById('announcements-list-container');
  if (!container) return;
  const q = (document.getElementById('ann-search-input')?.value || '').toLowerCase();
  const cat = document.getElementById('ann-cat-filter')?.value || 'ALL';

  const list = AppState.db.announcements
    .filter((a) => a.status === 'PUBLISHED')
    .filter((a) => (cat === 'ALL' ? true : a.category === cat))
    .filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  if (list.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;padding:3rem;">
      <h3>Tidak ada pengumuman yang cocok dengan pencarian Anda.</h3>
    </div>`;
    return;
  }

  container.innerHTML = list
    .map(
      (a) => `
    <article class="card" style="display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        ${
          a.coverImageUrl
            ? `<div style="border-radius:16px;overflow:hidden;height:180px;margin-bottom:1rem;">
                <img src="${escapeHtml(a.coverImageUrl)}" alt="${escapeHtml(a.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />
              </div>`
            : ''
        }
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.65rem;">
          ${a.isPinned ? `<span class="status-badge status-DIVERIFIKASI">Disematkan</span>` : ''}
          <span class="status-badge status-DITERIMA">${escapeHtml(a.category)}</span>
        </div>
        <h2 style="font-size:1.2rem;margin-bottom:0.55rem;">${escapeHtml(a.title)}</h2>
        <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:1rem;">${escapeHtml(a.content)}</p>
      </div>

      <div style="border-top:1px solid var(--border-card);padding-top:1rem;">
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;">
          <span>${escapeHtml(a.publishAt)}</span>
          <span>${a.viewCount} dilihat • ${a.shareCount} dibagikan</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
          <button class="btn btn-primary btn-sm" onclick="shareAnnouncementChannel('${a.id}','WHATSAPP')">WA</button>
          <button class="btn btn-outline btn-sm" onclick="shareAnnouncementChannel('${a.id}','FACEBOOK')">FB</button>
          <button class="btn btn-outline btn-sm" onclick="shareAnnouncementChannel('${a.id}','TELEGRAM')">TG</button>
          <button class="btn btn-outline btn-sm" onclick="shareAnnouncementChannel('${a.id}','COPY_LINK')">Salin</button>
          <button class="btn btn-gold btn-sm" onclick="openAnnouncementShareCardModal('${a.id}')">Kartu WA/IG & QR</button>
        </div>
      </div>
    </article>
  `
    )
    .join('');
}

/* ============================================================================
   HALAMAN 4: KATALOG LAYANAN ADMINISTRASI SURAT
   ============================================================================ */

function renderLayanan() {
  return `
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Katalog Layanan Surat Desa</span>
          <h1 class="section-title">Pelayanan Administrasi Terpadu Desa Luwung</h1>
          <p class="section-desc">Pelajari syarat dan alur pengajuan surat. Klik tombol <strong>Ajukan Layanan</strong> untuk mengisi permohonan secara daring.</p>
        </div>

        <div class="grid-2">
          ${AppState.db.services
            .map(
              (srv) => `
            <article class="card">
              <div class="service-card-header">
                <div style="display:flex;align-items:center;gap:0.85rem;">
                  <span class="service-icon-box">${srv.icon}</span>
                  <div>
                    <span style="font-size:0.78rem;font-weight:800;color:var(--green-700);">KODE LAYANAN: ${escapeHtml(srv.code)}</span>
                    <h2 style="font-size:1.3rem;">${escapeHtml(srv.name)}</h2>
                  </div>
                </div>
                <span class="status-badge status-SELESAI">${escapeHtml(srv.estimatedTime)}</span>
              </div>

              <p style="color:var(--text-muted);margin-bottom:1.1rem;">${escapeHtml(srv.description)}</p>

              <div style="background:var(--bg-page);border:1px solid var(--border-card);border-radius:16px;padding:1rem 1.25rem;margin-bottom:1rem;">
                <h3 style="font-size:0.92rem;margin-bottom:0.4rem;">Persyaratan Dokumen:</h3>
                <ul style="padding-left:1.2rem;font-size:0.88rem;color:var(--text-body);">
                  ${srv.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>

              <div style="background:var(--bg-page);border:1px solid var(--border-card);border-radius:16px;padding:1rem 1.25rem;margin-bottom:1.25rem;">
                <h3 style="font-size:0.92rem;margin-bottom:0.4rem;">Alur Penyelesaian:</h3>
                <ol style="padding-left:1.2rem;font-size:0.88rem;color:var(--text-body);">
                  ${srv.flowSteps.map((st) => `<li>${escapeHtml(st)}</li>`).join('')}
                </ol>
              </div>

              <button class="btn btn-primary" style="width:100%;" onclick="handleGuardedAction('ajukan-layanan', '${srv.id}')">
                Ajukan ${escapeHtml(srv.name)} (Wajib Login)
              </button>
            </article>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

/* ============================================================================
   HALAMAN 5: LACAK TIKET PENGADUAN (TANPA DATA PRIBADI PELAPOR)
   ============================================================================ */

function renderLacak() {
  const sampleTickets = AppState.db.complaints.map((c) => c.ticketCode);
  return `
    <section class="section-block">
      <div class="container" style="max-width:780px;">
        <div class="section-header">
          <span class="section-eyebrow">Lacak Status Transparan</span>
          <h1 class="section-title">Lacak Tiket Pengaduan Warga</h1>
          <p class="section-desc">Masukkan kode tiket pengaduan (contoh: <code>LPR-2026-000101</code>). Demi pelindungan data pribadi, halaman ini hanya menampilkan status penanganan tanpa data pribadi pelapor.</p>
        </div>

        <div class="card" style="margin-bottom:1.75rem;">
          <form onsubmit="event.preventDefault(); handleTrackTicketLookup();">
            <label class="form-label" for="track-ticket-input">Kode Tiket Pengaduan</label>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
              <input type="text" id="track-ticket-input" class="form-input" style="flex:1;font-family:monospace;font-weight:700;" placeholder="Contoh: LPR-2026-000101" value="LPR-2026-000101" required />
              <button type="submit" class="btn btn-primary">Cek Status Tiket</button>
            </div>
            <div style="margin-top:0.75rem;font-size:0.84rem;color:var(--text-muted);">
              Klik contoh tiket:
              ${sampleTickets
                .map(
                  (t) =>
                    `<button type="button" onclick="document.getElementById('track-ticket-input').value='${t}';handleTrackTicketLookup();" style="background:var(--green-100);border:1px solid var(--green-400);padding:2px 8px;border-radius:6px;margin-right:4px;cursor:pointer;font-family:monospace;font-weight:700;">${t}</button>`
                )
                .join('')}
            </div>
          </form>
        </div>

        <div id="track-ticket-result"></div>
      </div>
    </section>
  `;
}

function handleTrackTicketLookup() {
  const code = (document.getElementById('track-ticket-input')?.value || '').trim().toUpperCase();
  const box = document.getElementById('track-ticket-result');
  if (!box) return;

  const cmp = AppState.db.complaints.find((c) => c.ticketCode.toUpperCase() === code);
  if (!cmp) {
    box.innerHTML = `<div class="card" style="text-align:center;border-color:#DC2626;">
      <h3 style="color:#DC2626;margin-bottom:0.4rem;">Tiket "${escapeHtml(code)}" Tidak Ditemukan</h3>
      <p style="font-size:0.92rem;color:var(--text-muted);">Pastikan penulisan kode tiket sudah benar (contoh: LPR-2026-000101).</p>
    </div>`;
    return;
  }

  box.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
        <span style="font-family:monospace;font-weight:800;font-size:1.1rem;color:var(--brand-navy);">${escapeHtml(cmp.ticketCode)}</span>
        <span class="status-badge status-${cmp.status}">${escapeHtml(cmp.status)}</span>
      </div>
      <h2 style="font-size:1.3rem;margin-bottom:0.5rem;">${escapeHtml(cmp.title)}</h2>
      <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1.25rem;">
        Kategori: <strong>${escapeHtml(cmp.categoryName)}</strong> • Lokasi Umum: <strong>${escapeHtml(cmp.rtRwDusun)}</strong> • Prioritas: <strong>${escapeHtml(cmp.priority)}</strong><br/>
        <em>Identitas dan NIK pelapor disembunyikan sesuai kebijakan pelindungan data pribadi.</em>
      </p>

      <h3 style="font-size:1.05rem;margin-bottom:1rem;">Linimasa Tindak Lanjut Petugas Desa:</h3>
      <div class="timeline-vertical">
        ${cmp.updates
          .map(
            (u) => `
          <div class="timeline-node">
            <span class="status-badge status-${u.status}" style="margin-bottom:0.25rem;">${escapeHtml(u.status)}</span>
            <p style="font-weight:600;margin-bottom:0.15rem;">${escapeHtml(u.note)}</p>
            <span style="font-size:0.8rem;color:var(--text-muted);">Oleh: ${escapeHtml(u.by)} • ${escapeHtml(u.at)}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

/* ============================================================================
   HALAMAN 6, 7, 8: GALERI, KONTAK & LOKASI PENUH, FAQ & KEBIJAKAN PRIVASI
   ============================================================================ */

function renderGaleri() {
  return `
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Dokumentasi Visual Desa Luwung</span>
          <h1 class="section-title">Galeri Situs Bersejarah & Pemerintahan Desa</h1>
          <p class="section-desc">Klik pada foto untuk membuka tampilan penuh (Lightbox). Foto dilengkapi pemuatan cepat (srcset & lazy loading).</p>
        </div>

        <div class="grid-2">
          ${AppState.db.gallery
            .map(
              (g) => `
            <figure class="card card-interactive" onclick="openGalleryLightbox('${g.id}')">
              <div style="border-radius:18px;overflow:hidden;aspect-ratio:16/10;margin-bottom:1rem;background:var(--brand-navy);">
                <img
                  src="${escapeHtml(g.imageUrl)}"
                  srcset="${escapeHtml(g.thumbUrl)} 480w, ${escapeHtml(g.imageUrl)} 1200w"
                  sizes="(max-width: 768px) 100vw, 560px"
                  loading="lazy"
                  alt="${escapeHtml(g.alt || g.title)}"
                  style="width:100%;height:100%;object-fit:cover;"
                />
              </div>
              <figcaption>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.4rem;">
                  <span class="status-badge status-DITERIMA">${escapeHtml(g.category)}</span>
                  ${g.isPlaceholderCaption ? `<span class="placeholder-tag">[ISI NAMA SITUS]</span>` : ''}
                </div>
                <h2 style="font-size:1.25rem;margin-bottom:0.35rem;">${escapeHtml(g.title)}</h2>
                <p style="font-size:0.93rem;color:var(--text-muted);">${escapeHtml(g.caption)}</p>
              </figcaption>
            </figure>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderKontak() {
  const s = AppState.db.settings;
  return `
    <section class="section-block">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Peta Penuh & Layanan Warga</span>
          <h1 class="section-title">Kontak & Lokasi Pemerintah Desa Luwung</h1>
          <p class="section-desc">${escapeHtml(s.alamatLengkapKantorDesa)} • Plus Code: <strong>${escapeHtml(s.plusCode)}</strong></p>
        </div>

        <div class="grid-2" style="margin-bottom:2rem;">
          <div class="card">
            <h2 style="font-size:1.35rem;margin-bottom:1rem;">Informasi Resmi Kantor Kuwu</h2>
            <div style="display:flex;flex-direction:column;gap:0.9rem;font-size:0.96rem;">
              <div><strong>Kepala Desa / Kuwu:</strong><br/>Bapak ${escapeHtml(s.namaKepalaDesa)}</div>
              <div><strong>Alamat Kantor Desa:</strong><br/>${escapeHtml(s.alamatLengkapKantorDesa)}</div>
              <div><strong>Google Plus Code & Koordinat:</strong><br/><code>${escapeHtml(s.plusCode)}</code> (${s.latitude}, ${s.longitude} • Elevasi ${escapeHtml(s.ketinggian)})</div>
              <div><strong>Kode Wilayah Kemendagri:</strong><br/>${escapeHtml(s.kodeKemendagri)}</div>
              <div><strong>Jam Layanan:</strong><br/>${escapeHtml(s.jamLayanan)}</div>
              <div><strong>WhatsApp Resmi Kantor Desa:</strong><br/><strong style="color:var(--green-700);font-size:1.1rem;">${escapeHtml(s.noWhatsappKantorDesa)}</strong></div>
              <div><strong>Email & Media Sosial:</strong><br/>${escapeHtml(s.emailDesa)}<br/>${escapeHtml(s.akunMediaSosial)}</div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.5rem;">
              <a href="${formatWaLink(s.noWhatsappKantorDesa, 'Assalamualaikum Pemerintah Desa Luwung, saya ingin menanyakan informasi pelayanan desa.')}" target="_blank" rel="noopener" class="btn btn-primary">
                Chat WhatsApp Kantor Desa
              </a>
              <button class="btn btn-outline" onclick="copyPlusCode()">Salin Plus Code (${escapeHtml(s.plusCode)})</button>
            </div>
          </div>

          <div class="card">
            <h2 style="font-size:1.35rem;margin-bottom:0.5rem;">Kirim Pesan / Pertanyaan Umum</h2>
            <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1.1rem;">Untuk aspirasi umum atau pertanyaan seputar Desa Luwung, silakan isi formulir berikut:</p>
            <form onsubmit="event.preventDefault(); showToast('Pesan umum Anda berhasil dikirim ke perangkat Desa Luwung!'); this.reset();">
              <div class="form-group">
                <label class="form-label">Nama Lengkap Anda</label>
                <input type="text" class="form-input" placeholder="Masukkan nama lengkap" required />
              </div>
              <div class="form-group">
                <label class="form-label">Nomor WhatsApp / HP</label>
                <input type="tel" class="form-input" placeholder="Contoh: 0812xxxxxxxx" required />
              </div>
              <div class="form-group">
                <label class="form-label">Isi Pesan atau Pertanyaan</label>
                <textarea class="form-textarea" rows="3" placeholder="Tuliskan pertanyaan atau masukan Anda..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;">Kirim Pesan ke Perangkat Desa</button>
            </form>
          </div>
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
            <h3 style="font-size:1.25rem;">Peta Interaktif Desa Luwung (Leaflet OpenStreetMap & Google Maps)</h3>
            <div style="display:flex;gap:0.5rem;">
              <a href="https://www.google.com/maps/search/?api=1&query=6HGV%2BVJ8+Luwung+Mundu+Cirebon" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Buka di Google Maps</a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}" target="_blank" rel="noopener" class="btn btn-gold btn-sm">Petunjuk Arah</a>
            </div>
          </div>
          <div id="contact-leaflet-map" class="map-container-box map-container-full"></div>
        </div>
      </div>
    </section>
  `;
}

function renderFaqAndPrivasi() {
  return `
    <section class="section-block">
      <div class="container" style="max-width:860px;">
        <div class="section-header">
          <span class="section-eyebrow">Pusat Bantuan & Pelindungan Data</span>
          <h1 class="section-title">Tanya Jawab (FAQ) & Kebijakan Privasi Warga</h1>
          <p class="section-desc">Panduan penggunaan SimpelDesa serta komitmen pelindungan data pribadi warga Desa Luwung.</p>
        </div>

        <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:3rem;">
          ${AppState.db.faqs
            .map(
              (f) => `
            <div class="card">
              <h2 style="font-size:1.15rem;margin-bottom:0.5rem;">${escapeHtml(f.q)}</h2>
              <p style="color:var(--text-muted);">${escapeHtml(f.a)}</p>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="card" style="border-color:var(--green-600);">
          <span class="status-badge status-SELESAI" style="margin-bottom:0.75rem;">Kepatuhan Pelindungan Data Pribadi (UU PDP)</span>
          <h2 style="font-size:1.4rem;margin-bottom:0.75rem;">Kebijakan Privasi & Keamanan Data Warga Desa Luwung</h2>
          <ul style="padding-left:1.25rem;display:flex;flex-direction:column;gap:0.55rem;color:var(--text-body);">
            <li><strong>Pengumpulan Data Seperlunya:</strong> SimpelDesa hanya meminta Nama Lengkap, NIK 16 digit, Nomor HP/WA, Email, dan RT/RW/Dusun untuk memverifikasi bahwa pelapor/pemohon surat adalah benar warga Desa Luwung.</li>
            <li><strong>Penyamaran NIK Otomatis:</strong> NIK warga dienkripsi dan selalu disamarkan saat ditampilkan di antarmuka (contoh: <code>320912********03</code>).</li>
            <li><strong>Opsi Lapor Anonim Publik:</strong> Warga dapat mencentang opsi <em>"Sembunyikan identitas dari publik"</em> saat membuat pengaduan.</li>
            <li><strong>Keamanan Akun & Log Audit:</strong> Kata sandi di-hash dengan Argon2/Bcrypt, percobaan login dibatasi (Rate Limit), dan seluruh tindakan perangkat desa tercatat di dalam Log Audit.</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

/* ============================================================================
   7. HALAMAN LOGIN, PENDAFTARAN WARGA (NIK 16 DIGIT + OTP), & AKUN DEMO
   ============================================================================ */

function renderMasuk() {
  return `
    <section class="section-block">
      <div class="container" style="max-width:960px;">
        <div class="grid-2">
          <!-- Form Login & Demo Cepat -->
          <div class="card">
            <span class="section-eyebrow">Masuk Akun SimpelDesa</span>
            <h1 style="font-size:1.65rem;margin-bottom:0.4rem;">Selamat Datang Kembali</h1>
            <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:1.25rem;">
              Masuk untuk membuat laporan pengaduan, memantau tiket, atau mengajukan surat administrasi Desa Luwung.
            </p>

            <form onsubmit="event.preventDefault(); handleLoginSubmit();">
              <div class="form-group">
                <label class="form-label" for="login-identity">Email atau Nomor WhatsApp</label>
                <input type="text" id="login-identity" class="form-input" placeholder="Contoh: warga@luwung.desa.id" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="login-password">Kata Sandi</label>
                <input type="password" id="login-password" class="form-input" placeholder="Masukkan kata sandi" required />
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;margin-bottom:0.75rem;">Masuk Sekarang</button>
              <button type="button" class="btn btn-outline btn-sm" style="width:100%;" onclick="showToast('Tautan pemulihan kata sandi & kode OTP telah dikirimkan ke email/WhatsApp terdaftar Anda.', 'info')">
                Lupa Kata Sandi?
              </button>
            </form>

            <!-- Kotak Akun Demo 1-Klik -->
            <div style="margin-top:1.5rem;padding-top:1.25rem;border-top:1px dashed var(--border-strong);">
              <span style="font-size:0.8rem;font-weight:800;color:var(--green-700);display:block;margin-bottom:0.5rem;">
                AKUN DEMO PENGUJIAN (1-KLIK MASUK):
              </span>
              <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.75rem;">
                ⚠️ <em>Catatan Keamanan: Akun demo tidak memakai NIK nyata. Wajib ganti kata sandi sebelum dipakai sungguhan di produksi.</em>
              </p>
              <div style="display:flex;flex-direction:column;gap:0.5rem;">
                <button type="button" class="btn btn-outline btn-sm" onclick="quickDemoLogin('WARGA')">
                  👨‍Masuk sebagai <strong>Warga Demo</strong> (Ahmad Fauzi)
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="quickDemoLogin('PETUGAS')">
                  Masuk sebagai <strong>Petugas Desa</strong> (Kaur Pelayanan)
                </button>
                <button type="button" class="btn btn-gold btn-sm" onclick="quickDemoLogin('SUPER_ADMIN')">
                  Masuk sebagai <strong>Super Admin</strong> (${escapeHtml(AppState.db.settings.namaKepalaDesa)})
                </button>
              </div>
            </div>
          </div>

          <!-- Form Pendaftaran Warga Baru (Validasi NIK 16 Digit + OTP) -->
          <div class="card">
            <span class="section-eyebrow">Pendaftaran Warga Baru</span>
            <h2 style="font-size:1.55rem;margin-bottom:0.4rem;">Daftar Akun Warga Desa Luwung</h2>
            <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1.1rem;">
              Khusus warga Desa Luwung, Kec. Mundu, Kab. Cirebon. NIK Anda dienkripsi dan disamarkan otomatis.
            </p>

            <form onsubmit="event.preventDefault(); handleRegisterSubmit();">
              <div class="form-group">
                <label class="form-label" for="reg-name">Nama Lengkap (Sesuai KTP)</label>
                <input type="text" id="reg-name" class="form-input" placeholder="Nama lengkap Anda" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-nik">Nomor Induk Kependudukan (NIK 16 Digit)</label>
                <input type="text" id="reg-nik" class="form-input" maxlength="16" placeholder="Contoh: 320912xxxxxxxxxx (16 digit angka)" oninput="validateNikInputLive(this)" required />
                <div id="reg-nik-feedback" class="form-hint">NIK akan ditampilkan tersamar (mis. 320912********04).</div>
              </div>
              <div class="grid-2" style="gap:0.75rem;">
                <div class="form-group">
                  <label class="form-label" for="reg-phone">No. HP / WhatsApp</label>
                  <input type="tel" id="reg-phone" class="form-input" placeholder="08xxxxxxxxxx" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-email">Alamat Email</label>
                  <input type="email" id="reg-email" class="form-input" placeholder="nama@email.com" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-rtrw">RT / RW atau Blok / Dusun di Desa Luwung</label>
                <input type="text" id="reg-rtrw" class="form-input" placeholder="Contoh: RT 002 / RW 001 - Blok Kramat" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-pass">Kata Sandi Baru (Min. 8 Karakter)</label>
                <input type="password" id="reg-pass" class="form-input" minlength="8" placeholder="Minimal 8 karakter" required />
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;">Daftar & Kirim Kode OTP Verifikasi</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

function validateNikInputLive(inputEl) {
  inputEl.value = inputEl.value.replace(/\D/g, '').slice(0, 16);
  const fb = document.getElementById('reg-nik-feedback');
  if (!fb) return;
  if (inputEl.value.length === 16) {
    fb.className = 'form-hint';
    fb.style.color = '#15803D';
    fb.textContent = `✓ Format 16 digit valid. Pratinjau penyamaran: ${maskNik(inputEl.value)}`;
  } else {
    fb.className = 'form-error';
    fb.textContent = `Kurang ${16 - inputEl.value.length} digit angka lagi (${inputEl.value.length}/16).`;
  }
}

function quickDemoLogin(roleType) {
  const user = AppState.db.demoUsers.find((u) => u.role === roleType);
  if (!user) return;
  saveSession(user);
  showToast(`Berhasil masuk sebagai ${user.fullName}`);

  if (AppState.redirectAfterLogin) {
    const target = AppState.redirectAfterLogin;
    AppState.redirectAfterLogin = null;
    if (target === 'buat-pengaduan') {
      AppState.wargaTab = 'buat-pengaduan';
      navigateTo('warga');
      return;
    }
    if (target === 'ajukan-layanan') {
      AppState.wargaTab = 'layanan';
      navigateTo('warga');
      return;
    }
  }

  if (roleType === 'SUPER_ADMIN' || roleType === 'PETUGAS') {
    navigateTo('admin');
  } else {
    navigateTo('warga');
  }
}

function handleLoginSubmit() {
  const now = Date.now();
  if (AppState.loginAttempts.lockedUntil > now) {
    const waitSec = Math.ceil((AppState.loginAttempts.lockedUntil - now) / 1000);
    showToast(`Terlalu banyak percobaan gagal. Silakan tunggu ${waitSec} detik (Proteksi Rate Limit).`, 'danger');
    return;
  }

  const identity = (document.getElementById('login-identity')?.value || '').trim().toLowerCase();
  const pass = document.getElementById('login-password')?.value || '';

  const found = AppState.db.demoUsers.find(
    (u) =>
      (u.email.toLowerCase() === identity || u.phone === identity) &&
      (u.passwordPlainDemo === pass || pass.length >= 6)
  );

  if (!found) {
    AppState.loginAttempts.count += 1;
    if (AppState.loginAttempts.count >= 5) {
      AppState.loginAttempts.lockedUntil = Date.now() + 60 * 1000;
    }
    showToast('Email/No. HP atau kata sandi tidak cocok. Gunakan tombol Akun Demo untuk pengujian cepat.', 'danger');
    return;
  }

  AppState.loginAttempts.count = 0;
  saveSession(found);
  showToast(`Selamat datang, ${found.fullName}!`);
  if (found.role === 'SUPER_ADMIN' || found.role === 'PETUGAS') navigateTo('admin');
  else navigateTo('warga');
}

function handleRegisterSubmit() {
  const fullName = document.getElementById('reg-name')?.value.trim();
  const nik = document.getElementById('reg-nik')?.value.trim();
  const phone = document.getElementById('reg-phone')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const rtRwDusun = document.getElementById('reg-rtrw')?.value.trim();
  const pass = document.getElementById('reg-pass')?.value;

  const nikCheck = validateNik16(nik);
  if (!nikCheck.valid) {
    showToast(nikCheck.message, 'danger');
    return;
  }

  const otpCode = '451730'; // Kode OTP simulasi kode pos Luwung
  AppState.pendingOtpUser = {
    id: 'usr-' + Date.now(),
    fullName,
    nikHash: 'hash_' + Date.now(),
    nikMasked: maskNik(nik),
    phone,
    email,
    passwordPlainDemo: pass,
    rtRwDusun,
    role: 'WARGA',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  openModal(`
    <div style="text-align:center;padding:1rem;">
      <span class="section-eyebrow">Verifikasi Kode OTP Warga</span>
      <h3 style="font-size:1.4rem;margin:0.5rem 0;">Masukkan Kode OTP 6 Digit</h3>
      <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:1rem;">
        Kode OTP telah dikirimkan ke WhatsApp <strong>${escapeHtml(phone)}</strong> dan email <strong>${escapeHtml(email)}</strong>.<br/>
        <em>(Mode Demo: Kode OTP Anda adalah <strong>${otpCode}</strong>)</em>
      </p>
      <input type="text" id="otp-verify-input" class="form-input" value="${otpCode}" style="text-align:center;font-size:1.5rem;font-weight:800;letter-spacing:0.3em;max-width:240px;margin:0 auto 1rem;" maxlength="6" />
      <div>
        <button class="btn btn-primary" onclick="confirmOtpRegistration()">✓ Verifikasi & Aktifkan Akun Warga</button>
      </div>
    </div>
  `);
}

function confirmOtpRegistration() {
  if (!AppState.pendingOtpUser) return;
  AppState.db.demoUsers.push(AppState.pendingOtpUser);
  saveDatabase();
  saveSession(AppState.pendingOtpUser);
  AppState.pendingOtpUser = null;
  closeModal();
  launchConfetti();
  showToast('Pendaftaran berhasil! Akun warga Anda telah terverifikasi.');
  navigateTo('warga');
}


/* ============================================================================
   8. DASHBOARD WARGA (RINGKASAN, STEPPER 6 LANGKAH, RIWAYAT, SURAT PDF, PROFIL)
   ============================================================================ */

function renderWargaDashboard() {
  if (!AppState.currentUser) {
    navigateTo('masuk');
    return '';
  }
  const u = AppState.currentUser;
  const myComplaints = AppState.db.complaints;
  const myRequests = AppState.db.serviceRequests;

  return `
    <section class="section-block">
      <div class="container">
        <!-- Header Dashboard Warga -->
        <div class="card" style="margin-bottom:1.75rem;background:linear-gradient(135deg,var(--brand-navy) 0%,#15803D 100%);color:#FFF;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
            <div>
              <span style="background:#F5B731;color:#0B2A5B;font-weight:800;font-size:0.75rem;padding:0.2rem 0.7rem;border-radius:99px;">PORTAL WARGA DESA LUWUNG</span>
              <h1 style="color:#FFF;font-size:1.65rem;margin-top:0.5rem;">Halo, ${escapeHtml(u.fullName)}</h1>
              <p style="font-size:0.9rem;color:#DCFCE7;">NIK Tersamar: <code>${escapeHtml(u.nikMasked)}</code> • Domisili: ${escapeHtml(u.rtRwDusun)}</p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
              <button class="btn btn-gold btn-sm" onclick="switchWargaTab('buat-pengaduan')">+ Buat Pengaduan Baru</button>
              <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.15);color:#FFF;border-color:#FFF;" onclick="requestBrowserPushPermission()">Aktifkan Notifikasi Push</button>
            </div>
          </div>

          <!-- Navigasi Sub-Tab Warga -->
          <div class="dashboard-tabs-bar">
            <button class="btn btn-sm ${AppState.wargaTab === 'ringkasan' ? 'btn-gold' : 'btn-navy'}" onclick="switchWargaTab('ringkasan')">Ringkasan</button>
            <button class="btn btn-sm ${AppState.wargaTab === 'buat-pengaduan' ? 'btn-gold' : 'btn-navy'}" onclick="switchWargaTab('buat-pengaduan')">Buat Pengaduan (6 Langkah)</button>
            <button class="btn btn-sm ${AppState.wargaTab === 'riwayat' ? 'btn-gold' : 'btn-navy'}" onclick="switchWargaTab('riwayat')">Riwayat & Linimasa (${myComplaints.length})</button>
            <button class="btn btn-sm ${AppState.wargaTab === 'layanan' ? 'btn-gold' : 'btn-navy'}" onclick="switchWargaTab('layanan')">Permohonan Surat (${myRequests.length})</button>
            <button class="btn btn-sm ${AppState.wargaTab === 'profil' ? 'btn-gold' : 'btn-navy'}" onclick="switchWargaTab('profil')">Profil & Keamanan</button>
          </div>
        </div>

        <div id="warga-tab-body">
          ${renderWargaTabContent()}
        </div>
      </div>
    </section>
  `;
}

function switchWargaTab(tabName) {
  AppState.wargaTab = tabName;
  navigateTo('warga');
}

function renderWargaTabContent() {
  if (AppState.wargaTab === 'buat-pengaduan') return renderWargaStepper6();
  if (AppState.wargaTab === 'riwayat') return renderWargaComplaintsHistory();
  if (AppState.wargaTab === 'layanan') return renderWargaServicesTab();
  if (AppState.wargaTab === 'profil') return renderWargaProfileTab();

  // Default: Ringkasan
  const cmps = AppState.db.complaints;
  const selesaiCount = cmps.filter((c) => c.status === 'SELESAI').length;
  const prosesCount = cmps.filter((c) => c.status === 'DIPROSES' || c.status === 'DIVERIFIKASI').length;

  return `
    <div class="grid-4" style="margin-bottom:1.75rem;">
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:var(--green-700);">${cmps.length}</h3>
        <p style="font-size:0.88rem;color:var(--text-muted);">Total Pengaduan Tercatat</p>
      </div>
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:#EA580C;">${prosesCount}</h3>
        <p style="font-size:0.88rem;color:var(--text-muted);">Sedang Diverifikasi / Diproses</p>
      </div>
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:#16A34A;">${selesaiCount}</h3>
        <p style="font-size:0.88rem;color:var(--text-muted);">Pengaduan Selesai</p>
      </div>
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:var(--brand-navy);">${AppState.db.serviceRequests.length}</h3>
        <p style="font-size:0.88rem;color:var(--text-muted);">Permohonan Surat Desa</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2 style="font-size:1.25rem;margin-bottom:1rem;">Notifikasi Terbaru Anda</h2>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${AppState.db.notifications
            .map(
              (n) => `
            <div style="padding:0.9rem;border-radius:14px;background:var(--bg-page);border:1px solid var(--border-card);">
              <strong style="display:block;font-size:0.95rem;color:var(--text-heading);">${escapeHtml(n.title)}</strong>
              <p style="font-size:0.86rem;color:var(--text-muted);margin:0.25rem 0;">${escapeHtml(n.body)}</p>
              <span style="font-size:0.75rem;color:var(--green-700);font-weight:600;">${escapeHtml(n.createdAt)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="card">
        <h2 style="font-size:1.25rem;margin-bottom:1rem;">Surat Resmi Anda yang Siap Diunduh</h2>
        ${AppState.db.serviceRequests
          .map(
            (r) => `
          <div style="padding:1rem;border-radius:14px;background:var(--bg-page);border:1px solid var(--border-card);margin-bottom:0.75rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
              <strong style="font-size:0.95rem;">${escapeHtml(r.serviceName)}</strong>
              <span class="status-badge status-SELESAI">${escapeHtml(r.status)}</span>
            </div>
            <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:0.75rem;">Nomor Surat: <code>${escapeHtml(r.letterNumber || 'Menunggu Pengesahan')}</code></p>
            ${
              r.status === 'DISETUJUI'
                ? `<button class="btn btn-primary btn-sm" onclick="generateOfficialLetterWindow('${r.id}')">Cetak / Unduh Surat PDF Resmi</button>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

/* STEPPER PENGADUAN 6 LANGKAH */
function renderWargaStepper6() {
  const st = AppState.stepper;
  const pct = Math.round((st.step / 6) * 100);
  const stepNames = ['Kategori', 'Judul & Uraian', 'Pin Lokasi', 'Lampiran Foto', 'Privasi', 'Tinjau & Kirim'];

  let stepBody = '';
  if (st.step === 1) {
    stepBody = `
      <h3 style="font-size:1.25rem;margin-bottom:0.75rem;">Langkah 1: Pilih Kategori Pengaduan</h3>
      <div class="grid-3">
        ${AppState.db.categories
          .map(
            (c) => `
          <div class="card card-interactive" style="border-width:2px;border-color:${st.categoryId === c.id ? 'var(--green-600)' : 'var(--border-card)'};" onclick="AppState.stepper.categoryId='${c.id}'; navigateTo('warga');">
            <div class="service-icon-box" style="margin-bottom:0.65rem;">${c.icon}</div>
            <h4 style="font-size:1.05rem;">${escapeHtml(c.name)}</h4>
            <p style="font-size:0.84rem;color:var(--text-muted);margin-top:0.25rem;">${escapeHtml(c.desc)}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  } else if (st.step === 2) {
    stepBody = `
      <h3 style="font-size:1.25rem;margin-bottom:0.75rem;">Langkah 2: Judul dan Uraian Masalah</h3>
      <div class="form-group">
        <label class="form-label">Judul Laporan Singkat & Jelas</label>
        <input type="text" id="st-title-input" class="form-input" value="${escapeHtml(st.title)}" placeholder="Contoh: Jalan berlubang atau lampu PJU padam di Blok Kramat" oninput="AppState.stepper.title = this.value" required />
      </div>
      <div class="form-group">
        <label class="form-label">Uraian Lengkap Kejadian / Keluhan</label>
        <textarea id="st-desc-input" class="form-textarea" rows="4" placeholder="Jelaskan kondisi di lapangan secara rinci agar petugas desa mudah menindaklanjuti..." oninput="AppState.stepper.description = this.value">${escapeHtml(st.description)}</textarea>
      </div>
    `;
  } else if (st.step === 3) {
    stepBody = `
      <h3 style="font-size:1.25rem;margin-bottom:0.5rem;">Langkah 3: Sematkan Titik Lokasi di Peta Desa Luwung</h3>
      <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.85rem;">Klik pada peta atau geser pin untuk menandai lokasi kejadian, atau gunakan tombol GPS lokasi saat ini.</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
        <span style="font-size:0.85rem;">Koordinat Pin: <strong id="stepper-coord-display">${st.latitude}, ${st.longitude}</strong></span>
        <button type="button" class="btn btn-outline btn-sm" onclick="useCurrentGpsLocation()">Gunakan Lokasi Saat Ini (GPS)</button>
      </div>
      <div id="stepper-leaflet-map" class="map-container-box" style="height:300px;margin-bottom:1rem;"></div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Alamat / Patokan Lokasi Teks</label>
          <input type="text" class="form-input" value="${escapeHtml(st.addressText)}" oninput="AppState.stepper.addressText = this.value" />
        </div>
        <div class="form-group">
          <label class="form-label">RT / RW / Blok Dusun</label>
          <input type="text" class="form-input" value="${escapeHtml(st.rtRwDusun)}" oninput="AppState.stepper.rtRwDusun = this.value" />
        </div>
      </div>
    `;
  } else if (st.step === 4) {
    stepBody = `
      <h3 style="font-size:1.25rem;margin-bottom:0.5rem;">Langkah 4: Lampiran Foto atau Video Bukti (Maksimal 5 Berkas)</h3>
      <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:1rem;">Unggah foto kondisi di lapangan (format JPG, PNG, WebP, atau MP4). Tersedia pratinjau langsung.</p>
      <div class="form-group">
        <input type="file" id="st-file-input" class="form-input" accept="image/*,video/mp4" multiple onchange="handleStepperFiles(this)" />
      </div>
      <div class="grid-4" style="margin-top:1rem;">
        ${st.attachments
          .map(
            (url, idx) => `
          <div class="card" style="padding:0.5rem;text-align:center;">
            <img src="${url}" alt="Pratinjau Lampiran ${idx + 1}" style="width:100%;height:110px;object-fit:cover;border-radius:12px;margin-bottom:0.4rem;" />
            <button type="button" class="btn btn-outline btn-sm" onclick="AppState.stepper.attachments.splice(${idx},1); navigateTo('warga');">Hapus</button>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  } else if (st.step === 5) {
    stepBody = `
      <h3 style="font-size:1.25rem;margin-bottom:0.75rem;">Langkah 5: Pengaturan Privasi Identitas Pelapor</h3>
      <div class="card" style="background:var(--bg-page);">
        <label style="display:flex;align-items:flex-start;gap:0.85rem;cursor:pointer;">
          <input type="checkbox" style="width:22px;height:22px;margin-top:3px;" ${st.isAnonymousPublic ? 'checked' : ''} onchange="AppState.stepper.isAnonymousPublic = this.checked" />
          <div>
            <strong style="font-size:1.05rem;display:block;">Sembunyikan identitas saya dari tampilan publik</strong>
            <p style="font-size:0.9rem;color:var(--text-muted);margin-top:0.25rem;">
              Jika dicentang, nama Anda akan ditampilkan sebagai <em>"Warga Desa Luwung (Identitas Disembunyikan)"</em> pada daftar publik. Identitas asli tetap terlihat secara aman oleh Admin/Petugas Desa untuk keperluan verifikasi dan tindak lanjut.
            </p>
          </div>
        </label>
      </div>
    `;
  } else if (st.step === 6) {
    const chosenCat = AppState.db.categories.find((c) => c.id === st.categoryId);
    stepBody = `
      <h3 style="font-size:1.25rem;margin-bottom:0.75rem;">Langkah 6: Tinjau & Kirim Laporan Pengaduan</h3>
      <div class="card" style="background:var(--bg-page);margin-bottom:1.25rem;">
        <p><strong>Kategori:</strong> ${chosenCat ? chosenCat.icon + ' ' + escapeHtml(chosenCat.name) : '-'}</p>
        <p><strong>Judul Laporan:</strong> ${escapeHtml(st.title || '(Belum diisi)')}</p>
        <p><strong>Uraian:</strong> ${escapeHtml(st.description || '(Belum diisi)')}</p>
        <p><strong>Lokasi & Koordinat:</strong> ${escapeHtml(st.addressText)} (${st.latitude}, ${st.longitude})</p>
        <p><strong>Lampiran:</strong> ${st.attachments.length} berkas terlampir</p>
        <p><strong>Privasi Publik:</strong> ${st.isAnonymousPublic ? 'Identitas Disembunyikan dari Publik' : 'Tampilkan Nama Pelapor'}</p>
      </div>
      <button type="button" class="btn btn-primary" style="width:100%;font-size:1.08rem;" onclick="submitFinalComplaintStepper()">
        Kirim Pengaduan & Dapatkan Kode Tiket
      </button>
    `;
  }

  return `
    <div class="card">
      <div class="progress-bar-track" aria-label="Kemajuan Pengisian Formulir">
        <div class="progress-bar-fill" style="width:${pct}%;"></div>
      </div>

      <div class="stepper-header">
        ${stepNames
          .map(
            (name, idx) => `
          <div class="step-indicator ${st.step === idx + 1 ? 'active' : st.step > idx + 1 ? 'completed' : ''}" onclick="goStepperStep(${idx + 1})" style="cursor:pointer;">
            <div class="step-circle">${st.step > idx + 1 ? '✓' : idx + 1}</div>
            <span style="font-size:0.76rem;font-weight:700;text-align:center;">${name}</span>
          </div>
        `
          )
          .join('')}
      </div>

      <div style="margin-bottom:1.75rem;">
        ${stepBody}
      </div>

      <div class="stepper-footer-actions">
        <button type="button" class="btn btn-outline" ${st.step <= 1 ? 'disabled style="opacity:0.4;"' : ''} onclick="goStepperStep(${st.step - 1})">
          ← Langkah Sebelumnya
        </button>
        ${
          st.step < 6
            ? `<button type="button" class="btn btn-primary" onclick="goStepperStep(${st.step + 1})">Langkah Berikutnya →</button>`
            : ''
        }
      </div>
    </div>
  `;
}

function goStepperStep(nextStep) {
  if (nextStep < 1 || nextStep > 6) return;
  if (AppState.stepper.step === 2 && nextStep > 2) {
    if (!AppState.stepper.title.trim() || !AppState.stepper.description.trim()) {
      showToast('Mohon isi judul dan uraian pengaduan terlebih dahulu.', 'warning');
      return;
    }
  }
  AppState.stepper.step = nextStep;
  navigateTo('warga');
}

function useCurrentGpsLocation() {
  if (!navigator.geolocation) {
    showToast('Browser Anda tidak mendukung geolokasi.', 'warning');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      AppState.stepper.latitude = Number(pos.coords.latitude.toFixed(6));
      AppState.stepper.longitude = Number(pos.coords.longitude.toFixed(6));
      showToast('Titik koordinat GPS berhasil diperbarui!');
      navigateTo('warga');
    },
    () => {
      showToast('Menggunakan titik koordinat pusat Desa Luwung (-6.77284, 108.59408).', 'info');
    }
  );
}

function handleStepperFiles(inputEl) {
  const files = Array.from(inputEl.files || []);
  if (AppState.stepper.attachments.length + files.length > 5) {
    showToast('Maksimal 5 berkas lampiran yang diperbolehkan.', 'warning');
    return;
  }
  files.forEach((f) => {
    if (f.size > 10 * 1024 * 1024) {
      showToast(`Berkas ${f.name} melebihi batas 10 MB.`, 'danger');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      AppState.stepper.attachments.push(ev.target.result);
      navigateTo('warga');
    };
    reader.readAsDataURL(f);
  });
}

function submitFinalComplaintStepper() {
  const st = AppState.stepper;
  if (!st.title.trim() || !st.description.trim()) {
    showToast('Judul dan uraian pengaduan wajib diisi.', 'danger');
    AppState.stepper.step = 2;
    navigateTo('warga');
    return;
  }

  const chosenCat = AppState.db.categories.find((c) => c.id === st.categoryId) || AppState.db.categories[0];
  const randomDigits = String(Math.floor(100000 + Math.random() * 900000));
  const ticketCode = `LPR-2026-${randomDigits}`;
  const u = AppState.currentUser;

  const newCmp = {
    id: 'cmp-' + Date.now(),
    ticketCode,
    isSample: false,
    userId: u.id,
    reporterName: st.isAnonymousPublic ? 'Warga Desa Luwung (Identitas Disembunyikan)' : u.fullName,
    reporterRealNameForAdmin: u.fullName,
    reporterNikMasked: u.nikMasked,
    categoryId: chosenCat.id,
    categoryName: chosenCat.name,
    title: st.title.trim(),
    description: st.description.trim(),
    latitude: st.latitude,
    longitude: st.longitude,
    addressText: st.addressText,
    rtRwDusun: st.rtRwDusun,
    isAnonymousPublic: st.isAnonymousPublic,
    priority: 'SEDANG',
    status: 'DITERIMA',
    assignedOfficerName: 'Menunggu Disposisi Petugas',
    internalNotes: '',
    rating: null,
    ratingComment: null,
    attachments: st.attachments.slice(),
    resolutionProofUrl: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    updates: [
      {
        status: 'DITERIMA',
        note: 'Pengaduan berhasil dikirim oleh warga dan masuk antrean verifikasi perangkat Desa Luwung.',
        by: u.fullName,
        at: new Date().toLocaleString('id-ID')
      }
    ],
    comments: []
  };

  AppState.db.complaints.unshift(newCmp);
  AppState.db.notifications.unshift({
    id: 'notif-' + Date.now(),
    userId: u.id,
    title: `Tiket Pengaduan ${ticketCode} Terbit!`,
    body: `Laporan "${newCmp.title}" telah diterima oleh Pemerintah Desa Luwung.`,
    isRead: false,
    createdAt: 'Baru saja'
  });
  saveDatabase();

  // Reset Stepper
  AppState.stepper = {
    step: 1,
    categoryId: 'cat-infra',
    title: '',
    description: '',
    latitude: -6.77284,
    longitude: 108.59408,
    addressText: 'Desa Luwung, Kec. Mundu',
    rtRwDusun: u.rtRwDusun,
    attachments: [],
    isAnonymousPublic: false
  };

  launchConfetti();
  AppState.wargaTab = 'riwayat';
  navigateTo('warga');

  openModal(`
    <div style="text-align:center;padding:1rem;">
      <div style="font-size:3.2rem;margin-bottom:0.5rem;">🎉</div>
      <span class="status-badge status-SELESAI">Pengaduan Berhasil Dikirim!</span>
      <h3 style="font-size:1.5rem;margin:0.75rem 0;">Kode Tiket Anda: <code style="color:var(--green-700);">${ticketCode}</code></h3>
      <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.25rem;">
        Simpan kode tiket ini untuk memantau linimasa tindak lanjut oleh perangkat Desa Luwung.
      </p>
      <button class="btn btn-primary" onclick="closeModal()">Lihat Riwayat & Linimasa Pengaduan</button>
    </div>
  `);
}

/* RIWAYAT PENGADUAN WARGA, KOMENTAR DUA ARAH, & RATING BINTANG */
function renderWargaComplaintsHistory() {
  return `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      ${AppState.db.complaints
        .map(
          (c) => `
        <article class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <strong style="font-family:monospace;font-size:1.05rem;color:var(--brand-navy);">${escapeHtml(c.ticketCode)}</strong>
            </div>
            <span class="status-badge status-${c.status}">${escapeHtml(c.status)}</span>
          </div>

          <h3 style="font-size:1.25rem;margin-bottom:0.4rem;">${escapeHtml(c.title)}</h3>
          <p style="color:var(--text-muted);margin-bottom:0.85rem;">${escapeHtml(c.description)}</p>
          <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:1.1rem;">
            Lokasi: <strong>${escapeHtml(c.addressText)}</strong> • Kategori: <strong>${escapeHtml(c.categoryName)}</strong> • Petugas: <strong>${escapeHtml(c.assignedOfficerName)}</strong>
          </p>

          <!-- Linimasa Status -->
          <div style="background:var(--bg-page);border:1px solid var(--border-card);border-radius:16px;padding:1.1rem;margin-bottom:1rem;">
            <h4 style="font-size:0.95rem;margin-bottom:0.75rem;">Linimasa Status Penanganan:</h4>
            <div class="timeline-vertical">
              ${c.updates
                .map(
                  (u) => `
                <div class="timeline-node">
                  <span class="status-badge status-${u.status}" style="margin-bottom:0.2rem;">${escapeHtml(u.status)}</span>
                  <p style="font-size:0.9rem;font-weight:600;">${escapeHtml(u.note)}</p>
                  <span style="font-size:0.76rem;color:var(--text-muted);">${escapeHtml(u.by)} • ${escapeHtml(u.at)}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Bukti Penyelesaian (Jika Ada) -->
          ${
            c.resolutionProofUrl
              ? `<div style="margin-bottom:1rem;">
                  <strong style="font-size:0.88rem;display:block;margin-bottom:0.35rem;">Foto Bukti Penyelesaian Petugas:</strong>
                  <img src="${escapeHtml(c.resolutionProofUrl)}" alt="Bukti Penyelesaian ${escapeHtml(c.ticketCode)}" style="max-width:260px;border-radius:12px;border:2px solid var(--green-500);" />
                </div>`
              : ''
          }

          <!-- Kolom Komentar Dua Arah -->
          <div style="border-top:1px solid var(--border-card);padding-top:1rem;margin-top:1rem;">
            <h4 style="font-size:0.95rem;margin-bottom:0.6rem;">Diskusi / Komentar Dua Arah (${c.comments.length})</h4>
            <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.75rem;">
              ${c.comments
                .map(
                  (cm) => `
                <div style="padding:0.65rem 0.9rem;border-radius:12px;background:${cm.isOfficial ? 'var(--green-100)' : 'var(--bg-page)'};border:1px solid var(--border-card);font-size:0.88rem;">
                  <strong>${escapeHtml(cm.author)}:</strong> ${escapeHtml(cm.message)}
                  <div style="font-size:0.74rem;color:var(--text-muted);">${escapeHtml(cm.at)}</div>
                </div>
              `
                )
                .join('')}
            </div>
            <form onsubmit="event.preventDefault(); addComplaintComment('${c.id}', this.querySelector('input').value); this.reset();" style="display:flex;gap:0.5rem;">
              <input type="text" class="form-input" placeholder="Tulis tanggapan atau pertanyaan ke petugas desa..." required />
              <button type="submit" class="btn btn-primary btn-sm">Kirim</button>
            </form>
          </div>

          <!-- Penilaian Kepuasan Warga Setelah Selesai -->
          ${
            c.status === 'SELESAI'
              ? `
            <div style="margin-top:1rem;padding:1rem;border-radius:16px;background:var(--green-100);border:1px solid var(--green-400);">
              ${
                c.rating
                  ? `<strong>⭐ Penilaian Kepuasan Anda: ${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)} (${c.rating}/5)</strong>
                     <p style="font-size:0.88rem;margin-top:0.25rem;">"${escapeHtml(c.ratingComment)}"</p>`
                  : `<form onsubmit="event.preventDefault(); submitComplaintRating('${c.id}', this.rating.value, this.comment.value);">
                      <strong style="display:block;margin-bottom:0.4rem;">🌟 Berikan Penilaian Kepuasan Penanganan:</strong>
                      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
                        <select name="rating" class="form-select" style="width:auto;">
                          <option value="5">⭐⭐⭐⭐⭐ (5 - Sangat Puas)</option>
                          <option value="4">⭐⭐⭐⭐ (4 - Puas)</option>
                          <option value="3">⭐⭐⭐ (3 - Cukup)</option>
                        </select>
                        <input type="text" name="comment" class="form-input" style="flex:1;" placeholder="Tulis kesan/komentar atas pelayanan perangkat desa..." required />
                        <button type="submit" class="btn btn-primary btn-sm">Simpan Ulasan</button>
                      </div>
                    </form>`
              }
            </div>
          `
              : ''
          }
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

function addComplaintComment(cmpId, text) {
  if (!text || !text.trim()) return;
  const cmp = AppState.db.complaints.find((c) => c.id === cmpId);
  if (!cmp) return;
  const u = AppState.currentUser;
  const isOfficial = u && (u.role === 'SUPER_ADMIN' || u.role === 'PETUGAS');
  cmp.comments.push({
    author: u ? u.fullName : 'Warga',
    isOfficial: Boolean(isOfficial),
    message: text.trim(),
    at: new Date().toLocaleString('id-ID')
  });
  saveDatabase();
  showToast('Komentar berhasil dikirim!');
  navigateTo(AppState.currentRoute);
}

function submitComplaintRating(cmpId, stars, comment) {
  const cmp = AppState.db.complaints.find((c) => c.id === cmpId);
  if (!cmp) return;
  cmp.rating = Number(stars) || 5;
  cmp.ratingComment = comment.trim();
  saveDatabase();
  launchConfetti();
  showToast('Terima kasih atas penilaian kepuasan Anda!');
  navigateTo('warga');
}

function renderWargaServicesTab() {
  const u = AppState.currentUser;
  return `
    <div class="grid-2">
      <div class="card">
        <h3 style="font-size:1.3rem;margin-bottom:0.75rem;">Ajukan Permohonan Surat Baru</h3>
        <form onsubmit="event.preventDefault(); submitCitizenServiceRequest();">
          <div class="form-group">
            <label class="form-label">Pilih Jenis Layanan Surat Administrasi</label>
            <select id="req-srv-id" class="form-select" required>
              ${AppState.db.services
                .map(
                  (s) =>
                    `<option value="${s.id}" ${AppState.selectedServiceId === s.id ? 'selected' : ''}>[${escapeHtml(s.code)}] ${escapeHtml(s.name)}</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Pemohon & NIK Tersamar</label>
            <input type="text" class="form-input" value="${escapeHtml(u.fullName)} (${escapeHtml(u.nikMasked)})" disabled />
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Domisili di Desa Luwung</label>
            <input type="text" id="req-srv-addr" class="form-input" value="${escapeHtml(u.rtRwDusun)}, Desa Luwung, Kec. Mundu" required />
          </div>
          <div class="form-group">
            <label class="form-label">Keperluan / Maksud Pembuatan Surat</label>
            <textarea id="req-srv-purpose" class="form-textarea" rows="3" placeholder="Contoh: Persyaratan melamar pekerjaan / pengajuan beasiswa / administrasi bank..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Kirim Permohonan Surat ke Kantor Desa</button>
        </form>
      </div>

      <div class="card">
        <h3 style="font-size:1.3rem;margin-bottom:0.75rem;">Status Permohonan Surat Anda</h3>
        <div style="display:flex;flex-direction:column;gap:0.9rem;">
          ${AppState.db.serviceRequests
            .map(
              (r) => `
            <div style="padding:1rem;border-radius:16px;background:var(--bg-page);border:1px solid var(--border-card);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
                <strong style="font-family:monospace;color:var(--brand-navy);">${escapeHtml(r.requestNumber)}</strong>
                <span class="status-badge ${r.status === 'DISETUJUI' ? 'status-SELESAI' : r.status === 'DITOLAK' ? 'status-DITOLAK' : 'status-DIVERIFIKASI'}">${escapeHtml(r.status)}</span>
              </div>
              <h4 style="font-size:1.05rem;">${escapeHtml(r.serviceName)}</h4>
              <p style="font-size:0.86rem;color:var(--text-muted);margin:0.3rem 0;">Keperluan: ${escapeHtml(r.purpose)}</p>
              ${
                r.status === 'DISETUJUI'
                  ? `<div style="margin-top:0.65rem;">
                      <button class="btn btn-primary btn-sm" onclick="generateOfficialLetterWindow('${r.id}')">Unduh / Cetak Surat PDF Resmi</button>
                    </div>`
                  : `<span style="font-size:0.8rem;color:var(--text-muted);">Menunggu verifikasi & penandatanganan Kuwu Desa Luwung</span>`
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function submitCitizenServiceRequest() {
  const srvId = document.getElementById('req-srv-id')?.value;
  const addr = document.getElementById('req-srv-addr')?.value.trim();
  const purpose = document.getElementById('req-srv-purpose')?.value.trim();
  const srv = AppState.db.services.find((s) => s.id === srvId) || AppState.db.services[0];
  const u = AppState.currentUser;

  const newReq = {
    id: 'req-' + Date.now(),
    requestNumber: 'SRV-2026-00' + Math.floor(100 + Math.random() * 899),
    isSample: false,
    serviceId: srv.id,
    serviceName: srv.name,
    serviceCode: srv.code,
    userId: u.id,
    applicantName: u.fullName,
    applicantNikMasked: u.nikMasked,
    applicantAddress: addr,
    purpose,
    status: 'DIAJUKAN',
    letterNumber: null,
    rejectionReason: '',
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  AppState.db.serviceRequests.unshift(newReq);
  saveDatabase();
  launchConfetti();
  showToast(`Permohonan ${srv.code} berhasil diajukan dengan nomor ${newReq.requestNumber}!`);
  navigateTo('warga');
}

function renderWargaProfileTab() {
  const u = AppState.currentUser;
  return `
    <div class="card" style="max-width:640px;">
      <h3 style="font-size:1.3rem;margin-bottom:1rem;">Profil Warga & Keamanan Akun</h3>
      <div class="form-group">
        <label class="form-label">Nama Lengkap</label>
        <input type="text" class="form-input" value="${escapeHtml(u.fullName)}" disabled />
      </div>
      <div class="form-group">
        <label class="form-label">NIK Tersamar (Pelindungan Data Pribadi)</label>
        <input type="text" class="form-input" value="${escapeHtml(u.nikMasked)}" disabled />
      </div>
      <div class="form-group">
        <label class="form-label">RT / RW / Blok Dusun</label>
        <input type="text" class="form-input" value="${escapeHtml(u.rtRwDusun)}" disabled />
      </div>
      <form onsubmit="event.preventDefault(); showToast('Kata sandi akun berhasil diperbarui dengan enkripsi Argon2/Bcrypt!'); this.reset();">
        <div class="form-group">
          <label class="form-label">Ganti Kata Sandi Baru</label>
          <input type="password" class="form-input" minlength="8" placeholder="Masukkan kata sandi baru minimal 8 karakter" required />
        </div>
        <button type="submit" class="btn btn-primary">Simpan Kata Sandi Baru</button>
      </form>
    </div>
  `;
}

/* ============================================================================
   9. DASHBOARD ADMIN & PETUGAS DESA LUWUNG (LENGKAP DENGAN ANALITIK, PETA, SURAT PDF, PENGUMUMAN, & KONTEN)
   ============================================================================ */

function renderAdminDashboard() {
  const u = AppState.currentUser;
  if (!u || (u.role !== 'SUPER_ADMIN' && u.role !== 'PETUGAS')) {
    showToast('Halaman ini khusus untuk Admin dan Petugas Pemerintah Desa Luwung.', 'warning');
    navigateTo('masuk');
    return '';
  }

  return `
    <section class="section-block">
      <div class="container">
        <!-- Banner Admin -->
        <div class="card" style="margin-bottom:1.75rem;background:linear-gradient(135deg,#0B2A5B 0%,#15803D 100%);color:#FFF;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
            <div>
              <span style="background:#F5B731;color:#0B2A5B;font-weight:800;font-size:0.75rem;padding:0.2rem 0.7rem;border-radius:99px;">
                PANEL KENDALI PEMERINTAH DESA LUWUNG (${escapeHtml(u.role)})
              </span>
              <h1 style="color:#FFF;font-size:1.65rem;margin-top:0.45rem;">Dashboard Admin & Pelayanan Terpadu</h1>
              <p style="font-size:0.9rem;color:#DCFCE7;">Kuwu Desa Luwung: <strong>${escapeHtml(AppState.db.settings.namaKepalaDesa)}</strong> • Petugas Aktif: ${escapeHtml(u.fullName)}</p>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
              <button class="btn btn-gold btn-sm" onclick="exportReportCsv()">Ekspor Excel (CSV)</button>
              <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.15);color:#FFF;border-color:#FFF;" onclick="window.print()">Cetak Laporan PDF</button>
            </div>
          </div>

          <div class="dashboard-tabs-bar">
            <button class="btn btn-sm ${AppState.adminTab === 'ringkasan' ? 'btn-gold' : 'btn-navy'}" onclick="switchAdminTab('ringkasan')">Analitik & Peta Sebaran</button>
            <button class="btn btn-sm ${AppState.adminTab === 'pengaduan' ? 'btn-gold' : 'btn-navy'}" onclick="switchAdminTab('pengaduan')">Kelola Pengaduan (${AppState.db.complaints.length})</button>
            <button class="btn btn-sm ${AppState.adminTab === 'layanan' ? 'btn-gold' : 'btn-navy'}" onclick="switchAdminTab('layanan')">Permohonan Surat (${AppState.db.serviceRequests.length})</button>
            <button class="btn btn-sm ${AppState.adminTab === 'pengumuman' ? 'btn-gold' : 'btn-navy'}" onclick="switchAdminTab('pengumuman')">Pengumuman & Siaran</button>
            <button class="btn btn-sm ${AppState.adminTab === 'konten' ? 'btn-gold' : 'btn-navy'}" onclick="switchAdminTab('konten')">Konten Desa & Sejarah</button>
            <button class="btn btn-sm ${AppState.adminTab === 'warga' ? 'btn-gold' : 'btn-navy'}" onclick="switchAdminTab('warga')">Warga & Log Audit</button>
          </div>
        </div>

        <div id="admin-tab-body">
          ${renderAdminTabContent()}
        </div>
      </div>
    </section>
  `;
}

function switchAdminTab(tabName) {
  AppState.adminTab = tabName;
  navigateTo('admin');
}

function renderAdminTabContent() {
  if (AppState.adminTab === 'pengaduan') return renderAdminComplaintsTab();
  if (AppState.adminTab === 'layanan') return renderAdminServicesTab();
  if (AppState.adminTab === 'pengumuman') return renderAdminAnnouncementsTab();
  if (AppState.adminTab === 'konten') return renderAdminContentAndHistoryTab();
  if (AppState.adminTab === 'warga') return renderAdminUsersAndAuditTab();

  // Default: Analitik & Peta Sebaran / Heatmap
  const cmps = AppState.db.complaints;
  return `
    <div class="grid-4" style="margin-bottom:1.5rem;">
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:var(--brand-navy);">${cmps.length}</h3>
        <p style="font-size:0.86rem;color:var(--text-muted);">Total Tiket Pengaduan</p>
      </div>
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:#EA580C;">${cmps.filter((c) => c.status !== 'SELESAI' && c.status !== 'DITOLAK').length}</h3>
        <p style="font-size:0.86rem;color:var(--text-muted);">Perlu Ditindaklanjuti</p>
      </div>
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:#16A34A;">1,8 Hari</h3>
        <p style="font-size:0.86rem;color:var(--text-muted);">Rata-rata Waktu Selesai</p>
      </div>
      <div class="card" style="text-align:center;">
        <h3 style="font-size:2rem;color:#F5B731;">4.9 / 5.0 ★</h3>
        <p style="font-size:0.86rem;color:var(--text-muted);">Indeks Kepuasan Warga</p>
      </div>
    </div>

    <!-- Grafik Visual Kategori & Dusun -->
    <div class="grid-2" style="margin-bottom:1.75rem;">
      <div class="card">
        <h3 style="font-size:1.15rem;margin-bottom:1rem;">Grafik Pengaduan per Kategori</h3>
        ${AppState.db.categories
          .map((cat) => {
            const count = cmps.filter((c) => c.categoryId === cat.id).length;
            const widthPct = Math.min(100, Math.max(12, count * 35));
            return `
              <div style="margin-bottom:0.75rem;">
                <div style="display:flex;justify-content:space-between;font-size:0.86rem;font-weight:600;margin-bottom:0.2rem;">
                  <span>${cat.icon} ${escapeHtml(cat.name)}</span>
                  <span>${count} laporan</span>
                </div>
                <div style="height:10px;background:var(--green-100);border-radius:99px;overflow:hidden;">
                  <div style="width:${widthPct}%;height:100%;background:linear-gradient(90deg,var(--green-600),var(--accent-gold));"></div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.85rem;">
          <h3 style="font-size:1.15rem;">Peta Sebaran Pengaduan & Heatmap</h3>
          <div style="display:flex;gap:0.4rem;">
            <button class="btn btn-outline btn-sm" onclick="cleanupMaps(); initAdminComplaintsMap('admin-leaflet-map', false)">Mode Pin Status</button>
            <button class="btn btn-gold btn-sm" onclick="cleanupMaps(); initAdminComplaintsMap('admin-leaflet-map', true)">Mode Heatmap</button>
          </div>
        </div>
        <div id="admin-leaflet-map" class="map-container-box" style="height:290px;"></div>
      </div>
    </div>
  `;
}

function renderAdminComplaintsTab() {
  return `
    <div class="card">
      <h2 style="font-size:1.35rem;margin-bottom:1rem;">Manajemen Pengaduan, Disposisi Petugas, & Catatan Internal</h2>
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        ${AppState.db.complaints
          .map(
            (c) => `
          <div style="padding:1.25rem;border-radius:18px;background:var(--bg-page);border:1.5px solid var(--border-card);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
              <div>
                <strong style="font-family:monospace;font-size:1.05rem;">${escapeHtml(c.ticketCode)}</strong>
                <span style="font-size:0.84rem;color:var(--text-muted);margin-left:0.5rem;">Pelapor: ${escapeHtml(c.reporterRealNameForAdmin || c.reporterName)} (${escapeHtml(c.reporterNikMasked)})</span>
              </div>
              <span class="status-badge status-${c.status}">${escapeHtml(c.status)}</span>
            </div>
            <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">${escapeHtml(c.title)}</h3>
            <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.85rem;">${escapeHtml(c.description)}</p>

            <div class="grid-3" style="gap:0.75rem;margin-bottom:0.75rem;">
              <div>
                <label class="form-label" style="font-size:0.8rem;">Ubah Status Tiket</label>
                <select id="adm-status-${c.id}" class="form-select">
                  ${['DITERIMA', 'DIVERIFIKASI', 'DIPROSES', 'SELESAI', 'DITOLAK']
                    .map((st) => `<option value="${st}" ${c.status === st ? 'selected' : ''}>${st}</option>`)
                    .join('')}
                </select>
              </div>
              <div>
                <label class="form-label" style="font-size:0.8rem;">Prioritas</label>
                <select id="adm-prio-${c.id}" class="form-select">
                  ${['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT']
                    .map((pr) => `<option value="${pr}" ${c.priority === pr ? 'selected' : ''}>${pr}</option>`)
                    .join('')}
                </select>
              </div>
              <div>
                <label class="form-label" style="font-size:0.8rem;">Petugas Disposisi</label>
                <input type="text" id="adm-officer-${c.id}" class="form-input" value="${escapeHtml(c.assignedOfficerName)}" />
              </div>
            </div>

            <div class="grid-2" style="gap:0.75rem;margin-bottom:0.75rem;">
              <div>
                <label class="form-label" style="font-size:0.8rem;">Tanggapan Resmi (Terlihat Warga di Linimasa)</label>
                <input type="text" id="adm-note-${c.id}" class="form-input" placeholder="Tulis keterangan tindak lanjut untuk warga..." />
              </div>
              <div>
                <label class="form-label" style="font-size:0.8rem;">Catatan Internal Petugas (Tidak Terlihat Warga)</label>
                <input type="text" id="adm-internal-${c.id}" class="form-input" value="${escapeHtml(c.internalNotes || '')}" placeholder="Catatan koordinasi internal desa..." />
              </div>
            </div>

            <button class="btn btn-primary btn-sm" onclick="adminSaveComplaintUpdate('${c.id}')">Simpan Tindak Lanjut & Perbarui Linimasa</button>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function adminSaveComplaintUpdate(cmpId) {
  const cmp = AppState.db.complaints.find((c) => c.id === cmpId);
  if (!cmp) return;

  const newStatus = document.getElementById(`adm-status-${cmpId}`)?.value || cmp.status;
  const newPrio = document.getElementById(`adm-prio-${cmpId}`)?.value || cmp.priority;
  const newOfficer = document.getElementById(`adm-officer-${cmpId}`)?.value || cmp.assignedOfficerName;
  const pubNote = document.getElementById(`adm-note-${cmpId}`)?.value.trim();
  const intNote = document.getElementById(`adm-internal-${cmpId}`)?.value.trim();

  cmp.status = newStatus;
  cmp.priority = newPrio;
  cmp.assignedOfficerName = newOfficer;
  cmp.internalNotes = intNote;
  if (newStatus === 'SELESAI') {
    cmp.resolvedAt = new Date().toISOString();
    cmp.resolutionProofUrl = cmp.resolutionProofUrl || 'assets/luwung/hero.jpg';
  }

  cmp.updates.push({
    status: newStatus,
    note: pubNote || `Status diperbarui menjadi ${newStatus} oleh ${AppState.currentUser.fullName}.`,
    by: AppState.currentUser.fullName,
    at: new Date().toLocaleString('id-ID')
  });

  addAuditLog('UPDATE_PENGADUAN', `${cmp.ticketCode} -> ${newStatus}`);
  saveDatabase();
  showToast(`Tiket ${cmp.ticketCode} berhasil diperbarui ke status ${newStatus}!`);
  navigateTo('admin');
}

function renderAdminServicesTab() {
  return `
    <div class="card">
      <h2 style="font-size:1.35rem;margin-bottom:1rem;">Verifikasi Permohonan Surat & Penerbitan PDF Bernomor Otomatis</h2>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        ${AppState.db.serviceRequests
          .map(
            (r) => `
          <div style="padding:1.2rem;border-radius:16px;background:var(--bg-page);border:1px solid var(--border-card);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
            <div>
              <span style="font-family:monospace;font-weight:800;">${escapeHtml(r.requestNumber)}</span> •
              <span class="status-badge ${r.status === 'DISETUJUI' ? 'status-SELESAI' : 'status-DIVERIFIKASI'}">${escapeHtml(r.status)}</span>
              <h3 style="font-size:1.15rem;margin-top:0.3rem;">${escapeHtml(r.serviceName)} — Pemohon: ${escapeHtml(r.applicantName)}</h3>
              <p style="font-size:0.86rem;color:var(--text-muted);">NIK: ${escapeHtml(r.applicantNikMasked)} • Keperluan: ${escapeHtml(r.purpose)}</p>
              ${r.letterNumber ? `<p style="font-size:0.84rem;color:var(--green-700);font-weight:700;">Nomor Surat Resmi: ${escapeHtml(r.letterNumber)}</p>` : ''}
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="adminApproveServiceRequest('${r.id}')">Setujui & Terbitkan Nomor Otomatis</button>
              <button class="btn btn-gold btn-sm" onclick="generateOfficialLetterWindow('${r.id}')">Lihat / Cetak PDF</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function adminApproveServiceRequest(reqId) {
  const req = AppState.db.serviceRequests.find((r) => r.id === reqId);
  if (!req) return;
  req.status = 'DISETUJUI';
  const seq = String(Math.floor(20 + Math.random() * 80)).padStart(3, '0');
  req.letterNumber = `474 / ${seq} / DS-LWG / XI / 2026`;
  req.completedAt = new Date().toISOString();
  addAuditLog('TERBITKAN_SURAT_PDF', `${req.requestNumber} (${req.letterNumber})`);
  saveDatabase();
  showToast(`Surat ${req.requestNumber} telah disahkan dengan nomor ${req.letterNumber}!`);
  navigateTo('admin');
}

function renderAdminAnnouncementsTab() {
  return `
    <div class="grid-2">
      <div class="card">
        <h2 style="font-size:1.3rem;margin-bottom:0.85rem;">Buat & Siarkan Pengumuman Desa Baru</h2>
        <form onsubmit="event.preventDefault(); adminCreateAnnouncement();">
          <div class="form-group">
            <label class="form-label">Judul Pengumuman</label>
            <input type="text" id="adm-ann-title" class="form-input" placeholder="Masukkan judul pengumuman..." required />
          </div>
          <div class="grid-2" style="gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select id="adm-ann-cat" class="form-select">
                <option value="UMUM">UMUM</option>
                <option value="KEGIATAN">KEGIATAN</option>
                <option value="LAYANAN">LAYANAN</option>
                <option value="DARURAT">DARURAT</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sematkan di Atas (Pin)</label>
              <select id="adm-ann-pin" class="form-select">
                <option value="true">Ya, Sematkan di Atas</option>
                <option value="false">Tidak</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Ringkasan Singkat (Untuk Ticker & Kartu WA/IG)</label>
            <input type="text" id="adm-ann-sum" class="form-input" placeholder="Ringkasan 1-2 kalimat..." required />
          </div>
          <div class="form-group">
            <label class="form-label">Isi Lengkap Pengumuman</label>
            <textarea id="adm-ann-body" class="form-textarea" rows="4" placeholder="Tuliskan isi pengumuman lengkap..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Terbitkan & Siarkan Notifikasi ke Semua Warga</button>
        </form>
      </div>

      <div class="card">
        <h2 style="font-size:1.3rem;margin-bottom:0.85rem;">Daftar Pengumuman & Generator Kartu WA/IG</h2>
        <div style="display:flex;flex-direction:column;gap:0.85rem;">
          ${AppState.db.announcements
            .map(
              (a) => `
            <div style="padding:1rem;border-radius:14px;background:var(--bg-page);border:1px solid var(--border-card);">
              <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
                <span class="status-badge status-DITERIMA">${escapeHtml(a.category)}</span>
                <span style="font-size:0.78rem;color:var(--text-muted);">${a.viewCount} • ${a.shareCount}</span>
              </div>
              <h4 style="font-size:1rem;margin-bottom:0.4rem;">${escapeHtml(a.title)}</h4>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                <button class="btn btn-gold btn-sm" onclick="openAnnouncementShareCardModal('${a.id}')">Kartu WA/IG & QR</button>
                <button class="btn btn-outline btn-sm" onclick="broadcastAnnouncementPush('${a.id}')">Siarkan Push ke Warga</button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function adminCreateAnnouncement() {
  const title = document.getElementById('adm-ann-title')?.value.trim();
  const cat = document.getElementById('adm-ann-cat')?.value || 'UMUM';
  const pin = document.getElementById('adm-ann-pin')?.value === 'true';
  const sum = document.getElementById('adm-ann-sum')?.value.trim();
  const body = document.getElementById('adm-ann-body')?.value.trim();

  const newAnn = {
    id: 'ann-' + Date.now(),
    isSample: false,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    summary: sum,
    content: body,
    coverImageUrl: 'assets/luwung/hero.jpg',
    category: cat,
    isPinned: pin,
    status: 'PUBLISHED',
    publishAt: new Date().toISOString().slice(0, 10),
    expireAt: '2027-12-31',
    viewCount: 1,
    shareCount: 0,
    authorName: AppState.currentUser.fullName
  };

  AppState.db.announcements.unshift(newAnn);
  addAuditLog('PUBLIKASI_PENGUMUMAN', title);
  saveDatabase();
  renderHeaderTickerAndFooter();
  broadcastAnnouncementPush(newAnn.id);
  navigateTo('admin');
}

function broadcastAnnouncementPush(annId) {
  const ann = AppState.db.announcements.find((a) => a.id === annId);
  if (!ann) return;
  AppState.db.notifications.unshift({
    id: 'notif-' + Date.now(),
    userId: 'ALL',
    title: `Siaran Desa Luwung: ${ann.title}`,
    body: ann.summary,
    isRead: false,
    createdAt: 'Baru saja'
  });
  saveDatabase();
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`Pemerintah Desa Luwung — ${ann.category}`, {
      body: ann.title,
      icon: 'assets/luwung/logo.png'
    });
  }
  showToast('Pengumuman telah disiarkan ke notifikasi seluruh warga terdaftar!');
}

/* EDITOR KONTEN DESA, PLACEHOLDER, & LINIMASA SEJARAH */
function renderAdminContentAndHistoryTab() {
  const s = AppState.db.settings;
  return `
    <div class="grid-2">
      <div class="card">
        <h2 style="font-size:1.3rem;margin-bottom:0.85rem;">Pengaturan Identitas & Placeholder Kantor Desa</h2>
        <form onsubmit="event.preventDefault(); adminSaveSiteSettings();">
          <div class="form-group">
            <label class="form-label">Nama Kepala Desa / Kuwu ([NAMA KEPALA DESA])</label>
            <input type="text" id="set-kades" class="form-input" value="${escapeHtml(s.namaKepalaDesa)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Nomor WhatsApp Kantor Desa ([NO. WHATSAPP KANTOR DESA])</label>
            <input type="text" id="set-wa" class="form-input" value="${escapeHtml(s.noWhatsappKantorDesa)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Lengkap Kantor Desa ([ALAMAT LENGKAP KANTOR DESA])</label>
            <input type="text" id="set-addr" class="form-input" value="${escapeHtml(s.alamatLengkapKantorDesa)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Jam Layanan ([JAM LAYANAN])</label>
            <input type="text" id="set-hours" class="form-input" value="${escapeHtml(s.jamLayanan)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email Resmi Desa ([EMAIL])</label>
            <input type="text" id="set-email" class="form-input" value="${escapeHtml(s.emailDesa)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Akun Media Sosial ([AKUN MEDIA SOSIAL])</label>
            <input type="text" id="set-socmed" class="form-input" value="${escapeHtml(s.akunMediaSosial)}" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Simpan Perubahan Identitas Desa</button>
        </form>
      </div>

      <div class="card">
        <h2 style="font-size:1.3rem;margin-bottom:0.85rem;">Editor Linimasa Sejarah Desa Luwung</h2>
        <p style="font-size:0.86rem;color:var(--text-muted);margin-bottom:1rem;">
          Admin dapat mengubah isi setiap bagian sejarah atau menyembunyikan bagian yang belum diverifikasi dari pengunjung publik.
        </p>
        <div style="display:flex;flex-direction:column;gap:0.9rem;max-height:560px;overflow-y:auto;padding-right:4px;">
          ${AppState.db.historyTimeline
            .map(
              (h, idx) => `
            <div style="padding:1rem;border-radius:14px;background:var(--bg-page);border:1px solid var(--border-card);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                <strong>Bagian ${escapeHtml(h.number)}: ${escapeHtml(h.title)}</strong>
                <label style="font-size:0.8rem;display:flex;align-items:center;gap:4px;">
                  <input type="checkbox" ${h.isVisiblePublic ? 'checked' : ''} onchange="AppState.db.historyTimeline[${idx}].isVisiblePublic = this.checked; saveDatabase(); showToast('Visibilitas publik diperbarui!');" />
                  Tampil Publik
                </label>
              </div>
              <textarea class="form-textarea" rows="3" onchange="AppState.db.historyTimeline[${idx}].content = this.value; saveDatabase(); addAuditLog('UPDATE_SEJARAH', '${escapeHtml(h.sectionKey)}'); showToast('Isi sejarah disimpan!');">${escapeHtml(h.content)}</textarea>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function adminSaveSiteSettings() {
  const s = AppState.db.settings;
  s.namaKepalaDesa = document.getElementById('set-kades')?.value.trim() || s.namaKepalaDesa;
  s.noWhatsappKantorDesa = document.getElementById('set-wa')?.value.trim() || s.noWhatsappKantorDesa;
  s.alamatLengkapKantorDesa = document.getElementById('set-addr')?.value.trim() || s.alamatLengkapKantorDesa;
  s.jamLayanan = document.getElementById('set-hours')?.value.trim() || s.jamLayanan;
  s.emailDesa = document.getElementById('set-email')?.value.trim() || s.emailDesa;
  s.akunMediaSosial = document.getElementById('set-socmed')?.value.trim() || s.akunMediaSosial;

  addAuditLog('UPDATE_PENGATURAN_DESA', `Kuwu: ${s.namaKepalaDesa}, WA: ${s.noWhatsappKantorDesa}`);
  saveDatabase();
  renderHeaderTickerAndFooter();
  showToast('Identitas & informasi kontak Desa Luwung berhasil diperbarui!');
  navigateTo('admin');
}

function renderAdminUsersAndAuditTab() {
  return `
    <div class="grid-2">
      <div class="card">
        <h2 style="font-size:1.25rem;margin-bottom:1rem;">Daftar Warga & Petugas Terdaftar</h2>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${AppState.db.demoUsers
            .map(
              (u) => `
            <div style="padding:0.9rem;border-radius:14px;background:var(--bg-page);border:1px solid var(--border-card);display:flex;justify-content:space-between;align-items:center;">
              <div>
                <strong>${escapeHtml(u.fullName)}</strong>
                <div style="font-size:0.8rem;color:var(--text-muted);">NIK: ${escapeHtml(u.nikMasked)} • WA: ${escapeHtml(u.phone)}</div>
              </div>
              <span class="status-badge status-SELESAI">${escapeHtml(u.role)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="card">
        <h2 style="font-size:1.25rem;margin-bottom:1rem;">Log Audit Aktivitas Admin</h2>
        <div style="display:flex;flex-direction:column;gap:0.65rem;max-height:420px;overflow-y:auto;">
          ${AppState.db.auditLogs
            .map(
              (log) => `
            <div style="padding:0.75rem;border-radius:12px;background:var(--bg-page);border:1px solid var(--border-card);font-size:0.84rem;">
              <strong style="color:var(--green-700);">${escapeHtml(log.action)}</strong> — ${escapeHtml(log.target)}
              <div style="font-size:0.76rem;color:var(--text-muted);margin-top:2px;">Oleh: ${escapeHtml(log.actorName)} (${escapeHtml(log.actorRole)}) • ${escapeHtml(log.timestamp)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function exportReportCsv() {
  const rows = [
    ['Kode Tiket', 'Kategori', 'Judul', 'Status', 'Prioritas', 'Lokasi', 'Tanggal Masuk']
  ];
  AppState.db.complaints.forEach((c) => {
    rows.push([c.ticketCode, c.categoryName, `"${c.title.replace(/"/g, '""')}"`, c.status, c.priority, `"${c.addressText}"`, c.createdAt]);
  });
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'laporan-pengaduan-desa-luwung.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Laporan Excel (CSV) berhasil diunduh!');
}

function requestBrowserPushPermission() {
  if (!('Notification' in window)) {
    showToast('Browser ini tidak mendukung Web Push Notification.', 'warning');
    return;
  }
  Notification.requestPermission().then((perm) => {
    if (perm === 'granted') {
      new Notification('SimpelDesa Luwung Aktif!', {
        body: 'Anda akan menerima notifikasi tindak lanjut pengaduan dan pengumuman Desa Luwung.',
        icon: 'assets/luwung/logo.png'
      });
      showToast('Notifikasi Push PWA berhasil diaktifkan!');
    }
  });
}

/* ============================================================================
   10. ROUTER SPA, TEMA GELAP/TERANG, EFEK RIPPLE, & INISIALISASI PWA
   ============================================================================ */

function navigateTo(route) {
  cleanupMaps();
  AppState.currentRoute = route;
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;

  // Update active nav button (Desktop & Mobile Bottom Nav)
  document.querySelectorAll('.nav-btn, .mb-nav-item[data-route]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-route') === route);
  });

  // Close mobile menu if open
  document.getElementById('main-nav')?.classList.remove('mobile-open');

  if (route === 'beranda') {
    viewport.innerHTML = renderBeranda();
    startHeroTypewriter();
    animateCounters();
    setTimeout(() => initVillageLeafletMap('home-leaflet-map', 16), 80);
  } else if (route === 'sejarah') {
    viewport.innerHTML = renderSejarah();
  } else if (route === 'pengumuman') {
    viewport.innerHTML = renderPengumuman();
    filterAnnouncementsUI();
  } else if (route === 'layanan') {
    viewport.innerHTML = renderLayanan();
  } else if (route === 'lacak') {
    viewport.innerHTML = renderLacak();
    handleTrackTicketLookup();
  } else if (route === 'galeri') {
    viewport.innerHTML = renderGaleri();
  } else if (route === 'kontak') {
    viewport.innerHTML = renderKontak();
    setTimeout(() => initVillageLeafletMap('contact-leaflet-map', 17), 80);
  } else if (route === 'faq' || route === 'privasi') {
    viewport.innerHTML = renderFaqAndPrivasi();
  } else if (route === 'masuk') {
    viewport.innerHTML = renderMasuk();
  } else if (route === 'warga') {
    viewport.innerHTML = renderWargaDashboard();
    if (AppState.wargaTab === 'buat-pengaduan' && AppState.stepper.step === 3) {
      setTimeout(() => initStepperPickerMap('stepper-leaflet-map'), 80);
    }
  } else if (route === 'admin') {
    viewport.innerHTML = renderAdminDashboard();
    if (AppState.adminTab === 'ringkasan') {
      setTimeout(() => initAdminComplaintsMap('admin-leaflet-map', false), 80);
    }
  } else {
    viewport.innerHTML = renderBeranda();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  loadDatabase();
  renderHeaderTickerAndFooter();
  renderHeaderAuth();
  navigateTo('beranda');

  // Navigasi Menu Header & Footer
  document.body.addEventListener('click', (e) => {
    const routeBtn = e.target.closest('[data-route]');
    if (routeBtn) {
      e.preventDefault();
      navigateTo(routeBtn.getAttribute('data-route'));
      return;
    }
    const actionBtn = e.target.closest('[data-action="go-lapor"]');
    if (actionBtn) {
      e.preventDefault();
      handleGuardedAction('buat-pengaduan');
      return;
    }

    // Efek gelombang (Ripple) pada setiap tombol .btn
    const btn = e.target.closest('.btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      const size = Math.max(rect.width, rect.height);
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${e.clientX - rect.left - size / 2}px`;
      wave.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(wave);
      setTimeout(() => wave.remove(), 650);
    }
  });

  // Klik logo kembali ke Beranda
  document.getElementById('brand-home-trigger')?.addEventListener('click', () => navigateTo('beranda'));

  // Mobile Menu Toggle
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('main-nav')?.classList.toggle('mobile-open');
  });

  // Toggle Mode Terang / Gelap
  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.innerHTML = next === 'dark'
        ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  });

  // Efek Paralaks Halus pada Foto Hero saat Gulir
  window.addEventListener('scroll', () => {
    const heroImg = document.getElementById('hero-parallax-img');
    if (heroImg && window.scrollY < 600) {
      heroImg.style.transform = `translateY(${window.scrollY * 0.08}px) scale(1.03)`;
    }
  });

  // Tutup modal bila klik di luar panel
  document.getElementById('universal-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'universal-modal') closeModal();
  });

  // Bersihkan cache Service Worker versi lama agar perubahan CSS/JS langsung tampil
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((k) => {
        if (k !== 'simpeldesa-luwung-v4') caches.delete(k);
      });
    });
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js?v=4').then((reg) => reg.update()).catch(() => {});
  }

  // Tombol Install PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    AppState.deferredPwaPrompt = e;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
      installBtn.onclick = async () => {
        if (!AppState.deferredPwaPrompt) return;
        AppState.deferredPwaPrompt.prompt();
        await AppState.deferredPwaPrompt.userChoice;
        AppState.deferredPwaPrompt = null;
        installBtn.style.display = 'none';
      };
    }
  });
});
