// lib/welcomeCanvas.js
//
// Generator banner welcome/left bergaya "Discord card":
//   - Background 1 gambar fixed (blur ringan otomatis, biar teks kebaca)
//   - Lingkaran besar berisi foto profil (PP) user yang join/keluar,
//     dengan border warna beda untuk welcome (hijau) vs left (merah)
//   - Teks judul besar (WELCOME / GOOD BYE)
//   - Nama user di bawah judul
//
// Dipakai oleh lib/welcome.js. Kalau canvas gagal render (module belum
// terinstall, font hilang, dsb) pemanggil WAJIB fallback ke foto statis /
// teks biasa — fungsi ini akan throw, bukan mengembalikan null, supaya
// pemanggil eksplisit menangani via try/catch.

'use strict';

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

const WIDTH = 1024;
const HEIGHT = 512;

const BG_CANDIDATES = [
  path.join(__dirname, '..', 'media', 'welcome_bg.jpg'),   // background baru khusus canvas ini (ganti file ini untuk kustomisasi)
  path.join(__dirname, '..', 'media', 'welcome_img.jpg'),  // fallback ke gambar lama yang sudah ada
];

const FALLBACK_AVATAR = path.join(__dirname, '..', 'media', 'alya.jpg');

// ─── Font (pakai font yang sudah ada di project, kalau gagal daftar → pakai default sans-serif canvas) ───
let _fontsRegistered = false;
function ensureFonts() {
  if (_fontsRegistered) return;
  _fontsRegistered = true;
  try {
    registerFont(path.join(__dirname, '..', 'media', 'fonts', 'ceraroundpro-medium.otf'), {
      family: 'CeraTitle',
    });
  } catch (_) {}
  try {
    registerFont(path.join(__dirname, '..', 'media', 'fonts', 'Roboto_Medium.ttf'), {
      family: 'RobotoName',
    });
  } catch (_) {}
}

function firstExisting(paths) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {}
  }
  return null;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

/**
 * Gambar background yang meng-cover seluruh canvas (crop-to-fill, seperti CSS background-size:cover),
 * lalu overlay gelap tipis supaya teks putih/berwarna tetap kontras di atas background apapun.
 */
function drawCoverBackground(ctx, img, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let drawW, drawH, dx, dy;

  if (imgRatio > boxRatio) {
    drawH = h;
    drawW = h * imgRatio;
    dx = (w - drawW) / 2;
    dy = 0;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    dx = 0;
    dy = (h - drawH) / 2;
  }

  ctx.drawImage(img, dx, dy, drawW, drawH);

  // overlay gelap tipis biar teks kontras di background apapun
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, w, h);
}

/**
 * Gambar lingkaran avatar besar di tengah-atas, dengan border ring berwarna.
 */
function drawAvatarCircle(ctx, avatarImg, centerX, centerY, radius, ringColor) {
  // Ring luar
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 6, 0, Math.PI * 2);
  ctx.fillStyle = ringColor;
  ctx.fill();
  ctx.restore();

  // Clip lingkaran untuk avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    avatarImg,
    centerX - radius,
    centerY - radius,
    radius * 2,
    radius * 2
  );
  ctx.restore();
}

/**
 * Teks judul besar dengan efek stroke gelap tipis (mirip gaya referensi: teks tebal, warna solid, outline gelap).
 */
function drawTitleText(ctx, text, centerX, y, fillColor, fontSize) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px "CeraTitle", sans-serif`;
  ctx.lineWidth = Math.round(fontSize / 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.strokeText(text, centerX, y);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, centerX, y);
  ctx.restore();
}

function drawNameText(ctx, text, centerX, y, fontSize) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px "RobotoName", sans-serif`;
  ctx.lineWidth = Math.round(fontSize / 8);
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.strokeText(text, centerX, y);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, centerX, y);
  ctx.restore();
}

/**
 * Render banner welcome atau left/goodbye.
 *
 * @param {Object} opts
 * @param {'welcome'|'left'} opts.type
 * @param {string} opts.name          Nama/nomor yang ditampilkan di bawah judul
 * @param {Buffer|string} [opts.avatarBuffer]  Buffer foto profil (atau URL) — kalau gagal load, pakai fallback
 * @returns {Promise<Buffer>} PNG buffer siap dikirim sebagai image
 */
async function renderWelcomeCard(opts) {
  const { type, name, avatarBuffer } = opts;
  ensureFonts();

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // ── Background ──
  const bgPath = firstExisting(BG_CANDIDATES);
  if (bgPath) {
    const bgImg = await loadImage(bgPath);
    drawCoverBackground(ctx, bgImg, WIDTH, HEIGHT);
  } else {
    // Fallback polos kalau benar-benar tidak ada file background sama sekali
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // ── Avatar ──
  let avatarImg;
  try {
    avatarImg = await loadImage(avatarBuffer || FALLBACK_AVATAR);
  } catch (_) {
    avatarImg = await loadImage(FALLBACK_AVATAR);
  }

  const isWelcome = type === 'welcome';
  const ringColor = isWelcome ? '#3B82F6' : '#EF4444'; // biru untuk welcome, merah untuk left (ganti sesuai selera)
  const titleColor = isWelcome ? '#22C55E' : '#EF4444'; // hijau untuk welcome, merah untuk goodbye

  drawAvatarCircle(ctx, avatarImg, WIDTH / 2, 190, 130, ringColor);

  // ── Judul besar ──
  const title = isWelcome ? 'WELCOME' : 'GOOD BYE';
  drawTitleText(ctx, title, WIDTH / 2, 400, titleColor, 72);

  // ── Nama di bawah judul ──
  const displayName = truncate(name || '-', 26);
  drawNameText(ctx, displayName, WIDTH / 2, 465, 34);

  return canvas.toBuffer('image/png');
}

module.exports = { renderWelcomeCard };
