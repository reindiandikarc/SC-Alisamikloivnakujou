// lib/aioDownloader.js
// Core untuk fitur AIO Downloader (.aio) — manual command & auto-detect link.
// API: https://api.azbry.com/api/download/allinonev2
//
// Menyediakan:
//  - fetchAio(url)            -> ambil data hasil parse dari API
//  - sendAioResult(alya, m, data) -> kirim hasil (image/video/audio) ke chat
//  - URL_PATTERNS             -> daftar regex untuk auto-detect link di pesan biasa
//  - extractUrl(text)         -> ambil URL pertama yang dikenali dari teks bebas
//  - isAutoDlEnabled(chatId)  -> cek toggle on/off (per-chat)
//  - setAutoDl(chatId, bool)  -> set toggle on/off (per-chat)
//  - checkDedupGuard(key)     -> true kalau key (chat+url) belum diproses dalam 60 detik terakhir

'use strict';

const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.azbry.com/api/download/allinonev2';
const DB_PATH = path.join(process.cwd(), 'database', 'aio_autodl.json');

// ── Toggle on/off per-chat (array JSON, pola sama dengan antinsfw.js) ───────
function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]');
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (_) {
    /* gagal simpan, diamkan — fitur tetap jalan di memori sampai restart */
  }
}

function isAutoDlEnabled(chatId) {
  return loadDB().includes(chatId);
}

function setAutoDl(chatId, enabled) {
  let list = loadDB();
  if (enabled) {
    if (!list.includes(chatId)) list.push(chatId);
  } else {
    list = list.filter((id) => id !== chatId);
  }
  saveDB(list);
  return enabled;
}

// ── Dedup guard: cegah link yang sama diproses berkali-kali dalam jeda singkat ──
const _seen = new Map();
const DEDUP_WINDOW_MS = 60_000;

function checkDedupGuard(key) {
  const now = Date.now();
  const last = _seen.get(key);

  // bersihkan entry lama sesekali biar Map tidak membesar terus
  if (_seen.size > 500) {
    for (const [k, t] of _seen) {
      if (now - t > DEDUP_WINDOW_MS) _seen.delete(k);
    }
  }

  if (last && now - last < DEDUP_WINDOW_MS) return false;
  _seen.set(key, now);
  return true;
}

// ── Pola URL yang dikenali untuk auto-detect ────────────────────────────────
// Mengikuti platform yang umum didukung oleh API all-in-one downloader.
const URL_PATTERNS = [
  /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|tv|stories)\/\S+/i,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/i,
  /https?:\/\/fb\.watch\/\S+/i,
  /https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/)\S+/i,
  /https?:\/\/youtu\.be\/\S+/i,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+\/status\/\d+\S*/i,
  /https?:\/\/(?:www\.)?x\.com\/\S+\/status\/\d+\S*/i,
  /https?:\/\/(?:www\.)?(?:vt\.)?capcut\.com\/\S+/i,
  /https?:\/\/(?:www\.)?pinterest\.(?:com|[a-z]{2})\/pin\/\S+/i,
  /https?:\/\/pin\.it\/\S+/i,
  /https?:\/\/(?:www\.)?threads\.net\/\S+/i,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/i,
  /https?:\/\/(?:www\.)?likee\.video\/\S+/i,
  /https?:\/\/(?:www\.)?[\w-]*\.?soundcloud\.com\/\S+/i,
  /https?:\/\/(?:www\.)?spotify\.com\/track\/\S+/i,
  /https?:\/\/(?:www\.)?bilibili\.com\/\S+/i,
  /https?:\/\/(?:www\.)?reddit\.com\/r\/\S+/i,
];

/**
 * Cari URL pertama dalam teks bebas yang cocok salah satu pattern di atas.
 * @param {string} text
 * @returns {string|null}
 */
function extractUrl(text) {
  if (!text) return null;
  for (const pattern of URL_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

// ── Pemanggilan API ──────────────────────────────────────────────────────────
async function fetchAio(url) {
  const axios = require('axios');
  const { data: json } = await axios.get(API_URL, {
    params: { url },
    timeout: 60_000,
  });

  if (!json?.status || !json?.result) {
    throw new Error(json?.message || 'Gagal mendapatkan data dari API Downloader.');
  }

  const data = json.result;
  const downloads = data.downloads || [];

  let images = data.images || [];
  if (images.length === 0 && downloads.length > 0) {
    images = downloads
      .filter((d) => d.label && d.label.toLowerCase().includes('image'))
      .map((d) => d.url);
  }

  const videoObj = downloads.find(
    (d) =>
      d.label &&
      (d.label.includes('hd_no_watermark') ||
        d.label.includes('watermark') ||
        d.label.toLowerCase().includes('video'))
  );
  const mp3Obj = downloads.find(
    (d) => d.label && (d.label.includes('MP3') || d.label.toLowerCase().includes('audio'))
  );

  return {
    title: data.title || 'No Title',
    owner: data.owner || 'Unknown',
    thumbnail: data.thumbnail || null,
    images,
    videoObj,
    mp3Obj,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Kirim hasil parsing AIO ke chat (gambar/video/audio + caption info).
 * @param {object} alya - instance socket bot
 * @param {object} m - pesan yang di-reply
 * @param {object} data - hasil dari fetchAio()
 */
async function sendAioResult(alya, m, data) {
  const { title, owner, images, videoObj, mp3Obj, thumbnail } = data;

  const capInfo =
    `┌˚₊ ๑│ ᴀ ɪ ᴏ  ᴅ ʟ │๑˚₊ 🎬\n┇ \n` +
    `│ 📌 *Title:* ${title}\n` +
    `│ 👤 *Owner:* ${owner}\n` +
    `┇ \n` +
    `└˚₊ ๑ ────────────── ๑˚₊`;

  if (images && images.length > 0) {
    for (const imgUrl of images) {
      await alya.sendMessage(m.chat, { image: { url: imgUrl } }, { quoted: m });
      await delay(2000);
    }
    await alya.sendMessage(m.chat, { text: capInfo }, { quoted: m });
  } else if (videoObj && videoObj.url) {
    await alya.sendMessage(
      m.chat,
      { video: { url: videoObj.url }, caption: capInfo },
      { quoted: m }
    );
    await delay(1500);
  } else if (thumbnail && !mp3Obj) {
    await alya.sendMessage(
      m.chat,
      { image: { url: thumbnail }, caption: capInfo },
      { quoted: m }
    );
    await delay(1500);
  }

  if (mp3Obj && mp3Obj.url) {
    await alya.sendMessage(
      m.chat,
      { audio: { url: mp3Obj.url }, mimetype: 'audio/mpeg', ptt: false },
      { quoted: m }
    );
  }
}

module.exports = {
  fetchAio,
  sendAioResult,
  URL_PATTERNS,
  extractUrl,
  isAutoDlEnabled,
  setAutoDl,
  checkDedupGuard,
};
