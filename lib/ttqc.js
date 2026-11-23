// lib/ttqc.js
// Generator gambar "TikTok Quote Chat" (.ttqc)
// Adaptasi CJS dari skrip canvas yang diberikan owner — pakai `canvas` (node-canvas)
// karena project ini sudah punya dependency tersebut (bukan @napi-rs/canvas).
// Asset (template + font) di-download sekali lalu di-cache di media/ttqc/.

'use strict';

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const https = require('https');
const http = require('http');

const ASSETS_DIR = path.join(process.cwd(), 'media', 'ttqc');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');
const TEMPLATE_PATH = path.join(ASSETS_DIR, 'template.png');
const TEMPLATE_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/qyzwa.png';

const FONT_ASSETS = [
  { file: 'PlusJakartaSans-Regular.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Regular.ttf', family: 'TTQCSans', weight: 'normal' },
  { file: 'PlusJakartaSans-Medium.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Medium.ttf', family: 'TTQCSans', weight: '500' },
  { file: 'PlusJakartaSans-Bold.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Bold.ttf', family: 'TTQCSans', weight: 'bold' },
  { file: 'fa-solid-900.ttf', url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/fa-solid-900.ttf', family: 'TTQCIcons', weight: 'normal' },
];

const MENU_ICONS = [
  { unicode: '\uf3e5', text: 'Balas', color: '#000000' },
  { unicode: '\uf064', text: 'Teruskan', color: '#000000' },
  { unicode: '\uf0c5', text: 'Salin', color: '#000000' },
  { unicode: '\uf1ab', text: 'Terjemahkan', color: '#000000' },
  { unicode: '\uf2ed', text: 'Hapus untuk saya', color: '#000000' },
  { unicode: '\uf024', text: 'Laporkan', color: '#ea4335' },
];

const config = {
  topPPX: 183, topPPY: 83, topPPRadius: 42,
  topNameX: 250, topNameY: 82, topNameSize: 34,
  chatPPX: 75, chatPPRadius: 38,
  textX: 175, textY: 962,
  bubbleWidth: 520, textSize: 30,
  bubbleBgColor: '#ffffff', textColor: '#161823',
};

let canvasLib = null;
let fontsRegistered = false;

function loadCanvasLib() {
  if (canvasLib) return canvasLib;
  // eslint-disable-next-line global-require
  canvasLib = require('canvas');
  return canvasLib;
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} -> ${url}`));
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

async function ensureAssets() {
  await fsp.mkdir(FONTS_DIR, { recursive: true });

  if (!fs.existsSync(TEMPLATE_PATH)) {
    const buf = await fetchBuffer(TEMPLATE_URL);
    await fsp.writeFile(TEMPLATE_PATH, buf);
  }

  const { registerFont } = loadCanvasLib();

  for (const font of FONT_ASSETS) {
    const dest = path.join(FONTS_DIR, font.file);
    if (!fs.existsSync(dest)) {
      const buf = await fetchBuffer(font.url);
      await fsp.writeFile(dest, buf);
    }
    if (!fontsRegistered) {
      try {
        registerFont(dest, { family: font.family, weight: font.weight });
      } catch (_) {
        /* font gagal register, render tetap lanjut pakai fallback */
      }
    }
  }
  fontsRegistered = true;
}

async function loadImageSmart(src) {
  const { loadImage } = loadCanvasLib();
  if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
    return loadImage(await fetchBuffer(src));
  }
  if (Buffer.isBuffer(src)) {
    return loadImage(src);
  }
  return loadImage(src);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/(\s+)/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if (word.trim() === '' && currentLine === '') continue;

    const testLine = currentLine + word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine !== '') {
        lines.push(currentLine.trimEnd());
        currentLine = word.trimStart();
      } else {
        lines.push(testLine);
        currentLine = '';
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trimEnd());
  }
  return lines;
}

function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke, shadow) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.05)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
  }
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCircleImage(ctx, img, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/**
 * Render gambar "TikTok Quote Chat".
 * @param {object} opts
 * @param {string} opts.username - Nama yang tampil di header chat.
 * @param {string} opts.chatText - Isi teks bubble chat.
 * @param {string|Buffer} opts.avatarSrc - URL atau Buffer foto profil.
 * @returns {Promise<Buffer>} Buffer PNG hasil render.
 */
async function renderTtqc({ username, chatText, avatarSrc } = {}) {
  await ensureAssets();
  const { createCanvas, loadImage } = loadCanvasLib();

  const USERNAME = username || 'Ditzzx';
  const CHAT_TEXT = chatText || 'Just friend kok cemburu 😂😂';
  const AVATAR_SRC =
    avatarSrc ||
    'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/6b71d84a580f385bd7ee36402df5341ead4770a0/Image/artworks-gWLRE6HyPH3DgVMG-ZFFxtg-t500x500.jpg';

  const templateImage = await loadImage(TEMPLATE_PATH);
  const avatarImage = await loadImageSmart(AVATAR_SRC);

  const canvas = createCanvas(1080 * 2, 2280 * 2);
  const ctx = canvas.getContext('2d');

  ctx.scale(2, 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.clearRect(0, 0, 1080, 2280);
  ctx.drawImage(templateImage, 0, 0, 1080, 2280);

  drawCircleImage(ctx, avatarImage, config.topPPX, config.topPPY, config.topPPRadius);

  ctx.font = `bold ${config.topNameSize}px TTQCSans`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(USERNAME, config.topNameX, config.topNameY);

  ctx.font = `500 ${config.textSize}px TTQCSans`;

  const lines = wrapText(ctx, CHAT_TEXT, config.bubbleWidth - 52);
  const lineH = config.textSize * 1.45;

  let maxW = 0;
  for (const l of lines) {
    const w = ctx.measureText(l).width;
    if (w > maxW) maxW = w;
  }

  const padX = 30, padY = 24;
  const bubbleW = Math.max(maxW + padX * 2, 180);
  const bubbleH = lines.length * lineH + padY * 2;
  const bubbleX = config.textX - padX;
  const bubbleY = config.textY - padY;

  drawCircleImage(ctx, avatarImage, config.chatPPX, bubbleY + bubbleH / 2, config.chatPPRadius);
  drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 35, config.bubbleBgColor);

  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  lines.forEach((line, i) => {
    const lineY = config.textY + i * lineH + config.textSize / 2;
    ctx.fillText(line, config.textX, lineY);
  });

  const menuX = 90, menuY = bubbleY + bubbleH + 28;
  drawRoundedRect(ctx, menuX, menuY, 565, 580, 40, '#ffffff', 'rgba(0,0,0,0.02)', true);

  const itemH = 90, iconX = menuX + 60, labelX = menuX + 130;
  MENU_ICONS.forEach((item, i) => {
    const cy = menuY + 25 + i * itemH + itemH / 2;
    ctx.fillStyle = item.color;
    ctx.font = `34px TTQCIcons`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.unicode, iconX, cy);
    ctx.font = `500 34px TTQCSans`;
    ctx.textAlign = 'left';
    ctx.fillText(item.text, labelX, cy);
  });

  ctx.restore();

  return canvas.toBuffer('image/png');
}

module.exports = { renderTtqc };
