// lib/anigame.js
// Helper untuk fitur .anigame — notifier game/APK MOD baru dari an1.com
// (sumber publik, tidak ada klaim watermark/lisensi yang diklaim scraper ini).
//
// Tanggung jawab modul ini:
//   - Ambil daftar game terbaru dari an1.com/games/
//   - Cari game berdasarkan judul
//   - Simpan state (URL yang sudah pernah dikirim) supaya notifier tidak
//     mengirim ulang game yang sama
//   - Format caption notifikasi

'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE = 'https://an1.com';
const DIR_DATA = path.join(__dirname, '..', 'database');
const FILE_STATE = path.join(DIR_DATA, 'anigame_state.json');

if (!fs.existsSync(DIR_DATA)) fs.mkdirSync(DIR_DATA, { recursive: true });

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

// ── State (anti-duplikat notifikasi) ──────────────────────────────────────
function bacaState() {
  try {
    if (!fs.existsSync(FILE_STATE)) return { urlTerkirim: [], initialized: false };
    return JSON.parse(fs.readFileSync(FILE_STATE, 'utf8'));
  } catch {
    return { urlTerkirim: [], initialized: false };
  }
}

function simpanState(state) {
  try {
    fs.writeFileSync(FILE_STATE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[anigame] Gagal simpan state:', e?.message);
  }
}

function sudahDikirim(url) {
  const state = bacaState();
  return (state.urlTerkirim || []).includes(url);
}

function tandaiSudahKirim(url) {
  const state = bacaState();
  if (!state.urlTerkirim) state.urlTerkirim = [];
  if (!state.urlTerkirim.includes(url)) {
    state.urlTerkirim.unshift(url);
    if (state.urlTerkirim.length > 500) state.urlTerkirim = state.urlTerkirim.slice(0, 500);
    simpanState(state);
  }
}

// ── Ambil daftar game terbaru dari an1.com/games/ ─────────────────────────
async function getGamesList(page = 1) {
  const url = page > 1 ? `${BASE}/games/page/${page}/` : `${BASE}/games/`;
  const res = await axios.get(url, { headers: HEADERS, timeout: 30000 });
  const $ = cheerio.load(res.data);
  const results = [];
  const seen = new Set();

  $('.item, article, .story-short').each((_, el) => {
    const $el = $(el);
    const a = $el.find('a').first();
    const link = a.attr('href');
    if (!link || !link.includes('an1.com') || seen.has(link)) return;

    const img = $el.find('img').first();
    const title = (img.attr('alt') || a.text() || '').trim();
    if (!title) return;

    seen.add(link);
    results.push({
      title,
      url: link.startsWith('http') ? link : `${BASE}${link}`,
      image: img.attr('src') || img.attr('data-src') || '',
      developer: $el.find('.developer').text().trim() || ''
    });
  });

  return results;
}

// ── Cari game berdasarkan judul ────────────────────────────────────────────
async function searchGames(query) {
  const url = `${BASE}/?do=search&subaction=search&story=${encodeURIComponent(query.trim())}`;
  const res = await axios.get(url, { headers: HEADERS, timeout: 30000 });
  const $ = cheerio.load(res.data);
  const results = [];
  const seen = new Set();

  $('.item, article, .story-short').each((_, el) => {
    const $el = $(el);
    const a = $el.find('a').first();
    const link = a.attr('href');
    if (!link || !link.includes('an1.com') || seen.has(link)) return;

    const img = $el.find('img').first();
    const title = (img.attr('alt') || a.text() || '').trim();
    if (!title) return;

    seen.add(link);
    results.push({
      title,
      url: link.startsWith('http') ? link : `${BASE}${link}`,
      image: img.attr('src') || img.attr('data-src') || '',
      developer: $el.find('.developer').text().trim() || ''
    });
  });

  return results.slice(0, 10);
}

// ── Ambil detail singkat halaman game (untuk caption notifikasi) ──────────
async function fetchGameDetail(gameUrl) {
  try {
    const res = await axios.get(gameUrl, { headers: HEADERS, timeout: 30000 });
    const $ = cheerio.load(res.data);

    const fullTitle = $('h1').first().text().trim();
    const image = $('.box-file-img img, .item img').first().attr('src') || '';

    let version = '';
    let android = '';
    let size = '';
    $('li, p').each((_, el) => {
      const t = $(el).text().trim();
      if (!version && /^Version[:\s]/i.test(t)) version = t.replace(/^Version[:\s]*/i, '').trim();
      if (!android && /^Android[:\s]/i.test(t)) android = t.replace(/^Android[:\s]*/i, '').trim();
      if (!size && /^\d+(\.\d+)?\s*(Mb|Gb)/i.test(t)) size = t.trim();
    });

    const sinopsis = $('p').filter((_, el) => $(el).text().trim().length > 80).first().text().trim();

    return { fullTitle, image, version, android, size, sinopsis, url: gameUrl };
  } catch (e) {
    console.warn('[anigame] Gagal ambil detail:', e?.message);
    return { url: gameUrl };
  }
}

// ── Format caption notifikasi ───────────────────────────────────────────────
const SEP = '━━━━━━━━━━━━━━━━━━━';

function buatCaption(game, detail = {}) {
  const title = detail.fullTitle || game.title || '?';
  const dev = game.developer || '';

  const rows = [];
  if (detail.version) rows.push(`├ 📦 Versi   : ${detail.version}`);
  if (detail.android) rows.push(`├ 🤖 Android : ${detail.android}`);
  if (detail.size) rows.push(`├ 💾 Ukuran  : ${detail.size}`);
  if (rows.length) rows[rows.length - 1] = rows[rows.length - 1].replace(/^├/, '╰');

  return (
    `🎮 *GAME BARU DI AN1.COM!*\n` +
    `${SEP}\n` +
    `🕹️ *${title}*\n` +
    (dev ? `👤 _${dev}_\n` : '') +
    (detail.sinopsis ? `\n📖 ${detail.sinopsis}\n` : '') +
    (rows.length ? `\n${SEP}\n📋 *Info Game*\n${rows.join('\n')}\n` : '') +
    `\n${SEP}\n` +
    `🔗 ${game.url}\n` +
    `🌐 _Sumber: AN1.COM_`
  );
}

// ── Cek game baru (dipanggil oleh interval di index.js) ────────────────────
async function cekGameBaru() {
  const state = bacaState();
  const games = await getGamesList(1);
  if (!games.length) return [];

  // Inisialisasi pertama kali: tandai semua yang ada sekarang, jangan kirim
  if (!state.initialized) {
    state.initialized = true;
    state.urlTerkirim = games.map(g => g.url);
    simpanState(state);
    console.log(`[anigame] Inisialisasi: ${games.length} game ditandai sebagai baseline`);
    return [];
  }

  const baruList = games.filter(g => g.url && !sudahDikirim(g.url));
  return baruList.slice(0, 5); // batasi maksimal 5 per cek, supaya tidak spam
}

module.exports = {
  getGamesList,
  searchGames,
  fetchGameDetail,
  buatCaption,
  cekGameBaru,
  sudahDikirim,
  tandaiSudahKirim,
  bacaState,
  simpanState
};
