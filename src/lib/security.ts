/**
 * Modul Keamanan & Pelindungan Data Pribadi (UU PDP) — SimpelDesa Luwung
 * Menyediakan validasi NIK 16 digit, penyamaran NIK, sanitasi XSS, CSRF token,
 * validasi berkas unggahan, dan pembatasan percobaan login (rate limiter).
 */

const loginAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

/**
 * Validasi format NIK 16 digit angka (standar Dukcapil, kode kab Cirebon 3209)
 */
export function validateNikFormat(nik: string): { valid: boolean; reason?: string } {
  const cleaned = (nik || '').trim();
  if (!/^\d{16}$/.test(cleaned)) {
    return { valid: false, reason: 'NIK harus terdiri dari tepat 16 digit angka.' };
  }
  if (/^(\d)\1{15}$/.test(cleaned)) {
    return { valid: false, reason: 'Format NIK tidak valid (angka berulang).' };
  }
  return { valid: true };
}

/**
 * Samarkan NIK saat ditampilkan di layar (contoh: 320912********04)
 */
export function maskNikDisplay(nik: string): string {
  const cleaned = (nik || '').replace(/\D/g, '');
  if (cleaned.length < 16) return '320912********00';
  return `${cleaned.slice(0, 6)}********${cleaned.slice(14, 16)}`;
}

/**
 * Sanitasi teks input untuk mencegah serangan XSS
 */
export function sanitizeHtmlInput(raw: string): string {
  return (raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Rate Limiter untuk percobaan login (Maksimal 5 percobaan gagal per 5 menit)
 */
export function checkLoginRateLimit(identifier: string): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const record = loginAttemptsMap.get(identifier);
  if (!record) return { allowed: true, waitSeconds: 0 };

  if (record.lockedUntil > now) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  const record = loginAttemptsMap.get(identifier) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000; // Kunci selama 5 menit
  }
  loginAttemptsMap.set(identifier, record);
}

export function resetLoginAttempts(identifier: string): void {
  loginAttemptsMap.delete(identifier);
}

/**
 * Validasi tipe dan ukuran berkas lampiran pengaduan (Maksimal 5 berkas, @10MB)
 */
export function validateAttachmentFile(file: { name: string; type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
  const maxBytes = 10 * 1024 * 1024; // 10 MB

  if (!allowedMime.includes(file.type)) {
    return { valid: false, error: `Tipe berkas ${file.name} tidak didukung. Gunakan JPG, PNG, WebP, atau MP4.` };
  }
  if (file.size > maxBytes) {
    return { valid: false, error: `Ukuran berkas ${file.name} melebihi batas maksimal 10 MB.` };
  }
  return { valid: true };
}
