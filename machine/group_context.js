// ============================================================
// group_context.js — Alya V19
// Sistem riwayat chat grup untuk AI Alya
//
// Fitur:
//   ✅ Simpan N pesan terakhir per grup (in-memory, non-persistent)
//   ✅ Ekstrak URL/link dari pesan (untuk download request)
//   ✅ Ekstrak Pinterest/pin link
//   ✅ Bantu AI memahami konteks "link tadi", "foto tadi", dll.
//   ✅ Deteksi intent: download, pin/pinterest, convert
// ============================================================

'use strict';

// ── Config ────────────────────────────────────────────────────
const MAX_LOG_PER_GROUP  = 30;   // max pesan tersimpan per grup
const LOG_TTL_MS         = 30 * 60 * 1000; // hapus log > 30 menit

// ── In-memory store ──────────────────────────────────────────
// { [groupId]: [ { sender, name, text, timestamp, urls: [] }, ... ] }
const _groupLogs = {};

// ── Regex patterns ───────────────────────────────────────────
const URL_REGEX      = /(https?:\/\/[^\s\n\r"'<>]+)/gi;
const MEGA_REGEX     = /https?:\/\/mega\.nz\/[^\s"'<>]+/gi;
const PINTEREST_REGEX = /https?:\/\/(www\.)?(pin\.it|pinterest\.com)\/[^\s"'<>]+/gi;
const DESUSTREAM_REGEX = /https?:\/\/desustream\.com\/[^\s"'<>]+/gi;
const YOUTUBE_REGEX  = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s"'<>]+/gi;
const TIKTOK_REGEX   = /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s"'<>]+/gi;
const INSTAGRAM_REGEX = /https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/gi;

/**
 * Tambahkan pesan ke log grup
 */
function logGroupMessage({ groupId, sender, pushname, text }) {
  if (!groupId || !text) return;

  if (!_groupLogs[groupId]) _groupLogs[groupId] = [];

  // Ekstrak URLs dari teks
  const urls = (text.match(URL_REGEX) || []).map(u => u.trim());

  _groupLogs[groupId].push({
    sender: sender || 'unknown',
    name:   pushname || 'User',
    text:   text.slice(0, 500), // batasi panjang teks tersimpan
    timestamp: Date.now(),
    urls,
  });

  // Trim ke MAX_LOG_PER_GROUP
  if (_groupLogs[groupId].length > MAX_LOG_PER_GROUP) {
    _groupLogs[groupId] = _groupLogs[groupId].slice(-MAX_LOG_PER_GROUP);
  }

  // Hapus entri lama
  _cleanupOldLogs(groupId);
}

function _cleanupOldLogs(groupId) {
  const now = Date.now();
  const logs = _groupLogs[groupId];
  if (!logs) return;
  _groupLogs[groupId] = logs.filter(e => (now - e.timestamp) < LOG_TTL_MS);
}

/**
 * Ambil N pesan terakhir di grup
 */
function getRecentMessages(groupId, n = 10) {
  if (!_groupLogs[groupId]) return [];
  const logs = _groupLogs[groupId];
  return logs.slice(-n);
}

/**
 * Cari link terakhir yang pernah dikirim di grup
 * filterFn opsional untuk filter jenis link (mega, pinterest, dll)
 */
function findLastLink(groupId, filterFn = null) {
  const logs = getRecentMessages(groupId, MAX_LOG_PER_GROUP);

  // Cari dari paling baru
  for (let i = logs.length - 1; i >= 0; i--) {
    const entry = logs[i];
    if (!entry.urls.length) continue;

    for (let j = entry.urls.length - 1; j >= 0; j--) {
      const url = entry.urls[j];
      if (!filterFn || filterFn(url)) {
        return { url, sender: entry.sender, name: entry.name, timestamp: entry.timestamp };
      }
    }
  }
  return null;
}

/**
 * Cari semua link dari N pesan terakhir
 */
function findAllLinks(groupId, filterFn = null) {
  const logs  = getRecentMessages(groupId, MAX_LOG_PER_GROUP);
  const found = [];

  for (const entry of logs) {
    for (const url of entry.urls) {
      if (!filterFn || filterFn(url)) {
        found.push({ url, sender: entry.sender, name: entry.name, timestamp: entry.timestamp });
      }
    }
  }
  return found;
}

// ── Intent Detector ──────────────────────────────────────────
const DOWNLOAD_INTENT = [
  /tolong\s*download/i,
  /download\s*(?:kan|ini|dong|itu|link|file|video|foto|gambar)/i,
  /dl\s*(?:kan|ini|dong|itu)/i,
  /unduh(?:kan)?/i,
  /cariin\s*(?:dong|donk)?\s*video/i,
  /kirim(?:in)?\s*(?:dong|donk)?\s*(?:filenya|videonya|animenya)/i,
  /bisa\s*download/i,
  /minta\s*(?:file|video|anime|link)/i,
];

const PINTEREST_INTENT = [
  /cari(?:kan)?\s*(?:foto|gambar|wallpaper|image)/i,
  /pin(?:teres)?\s*(?:nya|ini|itu|dong)/i,
  /foto\s*(?:dari)?\s*pin/i,
  /gambar\s*(?:pin|pint)/i,
  /cariin\s*(?:gambar|foto|wall)/i,
];

const ALLDL_INTENT = [
  /download\s*(?:video|link)\s*(?:ini|tadi|itu|tersebut)/i,
  /dl\s*(?:link|video)\s*(?:ini|tadi|itu)/i,
  /tolong\s*(?:dong|donk)?\s*(?:download|dl)/i,
  /bisa\s*(?:dong|donk)?\s*(?:download|dl)/i,
  /(?:bisa|tolong|minta|coba)\s*(?:download|dl|unduh)/i,
];

/**
 * Deteksi intent dari teks pesan
 */
function detectIntent(text) {
  if (!text) return null;

  const t = text.trim();

  // Cek download intent
  if (DOWNLOAD_INTENT.some(rx => rx.test(t)) || ALLDL_INTENT.some(rx => rx.test(t))) {
    return 'download';
  }

  // Cek pinterest intent
  if (PINTEREST_INTENT.some(rx => rx.test(t))) {
    return 'pinterest_search';
  }

  return null;
}

/**
 * Build context string untuk dikirim ke AI Alya
 * Berisi ringkasan pesan grup terbaru (nama + teks singkat)
 */
function buildGroupContext(groupId, requestText) {
  const logs = getRecentMessages(groupId, 10);
  if (!logs.length) return '';

  const intent = detectIntent(requestText);
  const lines  = [];

  lines.push('[Riwayat chat grup (10 pesan terakhir):');
  for (const entry of logs) {
    const timeAgo = _timeAgo(entry.timestamp);
    let txt = entry.text.slice(0, 100);
    if (entry.urls.length) txt += ` [link: ${entry.urls[0].slice(0, 60)}]`;
    lines.push(`  ${entry.name}: ${txt} (${timeAgo})`);
  }
  lines.push(']');

  // Tambahkan konteks intent jika ada
  if (intent === 'download') {
    const lastLink = findLastLink(groupId);
    if (lastLink) {
      const timeAgo = _timeAgo(lastLink.timestamp);
      lines.push(
        `[User tampaknya meminta download. ` +
        `Link terakhir di grup: ${lastLink.url} ` +
        `(dikirim ${lastLink.name}, ${timeAgo})]`
      );
    }
  } else if (intent === 'pinterest_search') {
    const lastPin = findLastLink(groupId, u => PINTEREST_REGEX.test(u));
    if (lastPin) {
      lines.push(
        `[User tampaknya meminta foto/gambar Pinterest. ` +
        `Link Pinterest terakhir: ${lastPin.url} ` +
        `(dikirim ${lastPin.name})]`
      );
    }
  }

  return '\n\n' + lines.join('\n');
}

/**
 * Resolve konteks + cari link yang relevan untuk perintah "download link tadi"
 * Returns: { url, type, sender, name } | null
 */
function resolveDownloadRequest(groupId, requestText) {
  const intent = detectIntent(requestText);
  if (!intent) return null;

  // Cek apakah ada link langsung di teks request itu sendiri
  const directLinks = (requestText.match(URL_REGEX) || []);
  if (directLinks.length > 0) {
    return { url: directLinks[0], type: _classifyUrl(directLinks[0]), source: 'direct' };
  }

  // Cari link terakhir di grup
  const lastLink = findLastLink(groupId);
  if (lastLink) {
    return {
      url: lastLink.url,
      type: _classifyUrl(lastLink.url),
      sender: lastLink.sender,
      name: lastLink.name,
      source: 'group_log',
    };
  }

  return null;
}

/**
 * Cari keyword Pinterest dari request teks atau log grup
 * Untuk digunakan dengan .pin command
 */
function resolvePinterestRequest(groupId, requestText) {
  // Cek apakah ada link Pinterest di teks langsung
  const directPins = (requestText.match(PINTEREST_REGEX) || []);
  if (directPins.length > 0) {
    return { type: 'url', value: directPins[0] };
  }

  // Cari link Pinterest di log grup
  const lastPin = findLastLink(groupId, u => PINTEREST_REGEX.test(u));
  if (lastPin) return { type: 'url', value: lastPin.url };

  // Ekstrak keyword dari teks (setelah kata "cari", "foto", "gambar", dsb)
  const kwMatch = requestText.match(
    /(?:cari(?:kan)?|foto|gambar|wallpaper|image|pin)\s+(.+?)(?:\s+(?:dong|donk|ya|yuk|yo))?$/i
  );
  if (kwMatch) return { type: 'keyword', value: kwMatch[1].trim() };

  return null;
}

// ── Helpers ───────────────────────────────────────────────────
function _classifyUrl(url) {
  if (!url) return 'unknown';
  if (MEGA_REGEX.test(url))       return 'mega';
  if (DESUSTREAM_REGEX.test(url)) return 'desustream';
  if (YOUTUBE_REGEX.test(url))    return 'youtube';
  if (TIKTOK_REGEX.test(url))     return 'tiktok';
  if (INSTAGRAM_REGEX.test(url))  return 'instagram';
  if (PINTEREST_REGEX.test(url))  return 'pinterest';
  return 'other';
}

function _timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const sec  = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}d lalu`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m lalu`;
  return `${Math.floor(min / 60)}j lalu`;
}

// ── Exports ───────────────────────────────────────────────────
module.exports = {
  logGroupMessage,
  getRecentMessages,
  findLastLink,
  findAllLinks,
  buildGroupContext,
  detectIntent,
  resolveDownloadRequest,
  resolvePinterestRequest,
  URL_REGEX,
  MEGA_REGEX,
  PINTEREST_REGEX,
  DESUSTREAM_REGEX,
  YOUTUBE_REGEX,
  TIKTOK_REGEX,
  INSTAGRAM_REGEX,
};
