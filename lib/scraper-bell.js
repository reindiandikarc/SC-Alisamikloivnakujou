// lib/scraper-bell.js
// Modul AI terpusat — versi "apikey Bell" (api.termai.cc, key Bell409).
// Ini SAMA PERSIS dengan sumber yang dipakai command .ai/bard di SC
// Alisa-Bell asli (helpers/Events/ai.js → cmd: ['bard','ai']), bukan
// Gemini/Supabase. Dipakai sebagai jalur UTAMA untuk semua plugin AI
// text-chat (.ai, hitori-gotoh, gpt4, gemini.js plugin, dll).
//
// Kalau termai.cc gagal/down, otomatis fallback ke askAI() (Gemini via
// Supabase, lib/scraper-ai.js) supaya bot tetap bisa jawab.
//
// Cara pakai di command:
//   const { askBell } = require('../../lib/scraper-bell');
//   const result = await askBell({ prompt: 'halo' });
//   if (!result.status) return replyalya(result.error);
//   await m.reply(result.text);
//
// Untuk media (gambar), pakai askBellImage() — endpoint khusus
// img2txt/gemini-image milik termai.cc (dipakai command geminiimage
// di Bell asli). Untuk audio, pakai askBellAudio() — endpoint
// audioProcessing/transcribe.

'use strict';

const { askAI } = require('./scraper-ai');

const TERMAI_KEY = 'Bell409';
const TERMAI_URL = 'https://api.termai.cc';
const TERMAI_TIMEOUT_MS = 15000;

function _log(...args)  { console.log('[Bell]', ...args); }
function _warn(...args) { console.warn('[Bell]', ...args); }

/**
 * Chat teks biasa via api.termai.cc/api/chat/bard (apikey Bell409).
 * Fallback otomatis ke Gemini/Supabase (askAI) kalau termai.cc gagal.
 *
 * @param {Object} opts
 * @param {string} opts.prompt - Pertanyaan/prompt user.
 * @param {string} [opts.systemInstruction] - Instruksi sistem/persona, digabung di depan prompt.
 * @param {boolean} [opts.noFallback] - Kalau true, TIDAK fallback ke Gemini walau termai.cc gagal.
 * @returns {Promise<{status: boolean, text?: string, error?: string, source?: 'bell'|'gemini'}>}
 */
async function askBell({ prompt, systemInstruction, noFallback } = {}) {
  const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt || ''}` : (prompt || '');
  if (!finalPrompt.trim()) return { status: false, error: 'Prompt kosong.' };

  // ── 1. Coba api.termai.cc (apikey Bell409) ──────────────────
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TERMAI_TIMEOUT_MS);

    const res = await fetch(
      `${TERMAI_URL}/api/chat/bard?query=${encodeURIComponent(finalPrompt)}&key=${TERMAI_KEY}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const text = data?.chatUi || data?.response || data?.message || data?.msg || '';
      if (text && String(text).trim()) {
        _log('termai.cc OK (bard)');
        return { status: true, text: String(text).trim(), source: 'bell' };
      }
      _warn('termai.cc response kosong/tidak dikenali:', JSON.stringify(data).slice(0, 150));
    } else {
      _warn(`termai.cc HTTP ${res.status}`);
    }
  } catch (e) {
    const reason = e.name === 'AbortError' ? `timeout ${TERMAI_TIMEOUT_MS}ms` : e.message;
    _warn('termai.cc gagal:', reason);
  }

  if (noFallback) {
    return { status: false, error: 'api.termai.cc gagal dan fallback dinonaktifkan.' };
  }

  // ── 2. Fallback: Gemini via Supabase (askAI) ─────────────────
  _warn('Fallback ke Gemini/Supabase...');
  const viaGemini = await askAI({ prompt: finalPrompt });
  if (viaGemini.status) {
    return { status: true, text: viaGemini.text, source: 'gemini' };
  }

  return { status: false, error: `Bell gagal & fallback Gemini juga gagal: ${viaGemini.error}` };
}

/**
 * Analisa gambar via api.termai.cc/api/img2txt/gemini-image (apikey Bell409).
 * Fallback ke askAI({parts}) (Gemini/Supabase inlineData) kalau gagal.
 *
 * @param {Object} opts
 * @param {Buffer} opts.buffer - Buffer gambar.
 * @param {string} [opts.mimeType] - Mimetype gambar (dipakai kalau fallback ke Gemini).
 * @param {string} [opts.query] - Pertanyaan/instruksi soal gambar tsb.
 * @param {boolean} [opts.noFallback]
 * @returns {Promise<{status: boolean, text?: string, error?: string, source?: 'bell'|'gemini'}>}
 */
async function askBellImage({ buffer, mimeType, query, noFallback } = {}) {
  if (!buffer) return { status: false, error: 'Buffer gambar kosong.' };

  try {
    const base64Image = `data:${mimeType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TERMAI_TIMEOUT_MS);

    const res = await fetch(
      `${TERMAI_URL}/api/img2txt/gemini-image?key=${TERMAI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, query: query || '' }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const text = data?.response || data?.text || '';
      if (text && String(text).trim()) {
        _log('termai.cc OK (gemini-image)');
        return { status: true, text: String(text).trim(), source: 'bell' };
      }
      _warn('termai.cc img2txt response kosong:', JSON.stringify(data).slice(0, 150));
    } else {
      _warn(`termai.cc img2txt HTTP ${res.status}`);
    }
  } catch (e) {
    const reason = e.name === 'AbortError' ? `timeout ${TERMAI_TIMEOUT_MS}ms` : e.message;
    _warn('termai.cc img2txt gagal:', reason);
  }

  if (noFallback) {
    return { status: false, error: 'api.termai.cc (img2txt) gagal dan fallback dinonaktifkan.' };
  }

  _warn('Fallback ke Gemini/Supabase untuk gambar...');
  const viaGemini = await askAI({
    parts: [
      { inlineData: { data: buffer.toString('base64'), mimeType: mimeType || 'image/jpeg' } },
      query || 'Tolong analisa gambar ini.',
    ],
  });
  if (viaGemini.status) {
    return { status: true, text: viaGemini.text, source: 'gemini' };
  }
  return { status: false, error: `Bell gagal & fallback Gemini juga gagal: ${viaGemini.error}` };
}

/**
 * Transcribe/analisa audio via api.termai.cc/api/audioProcessing/transcribe
 * (apikey Bell409). Untuk video, tidak ada endpoint transcribe termai —
 * langsung pakai fallback Gemini (inlineData video).
 *
 * @param {Object} opts
 * @param {Buffer} opts.buffer - Buffer audio.
 * @param {string} [opts.mimeType]
 * @param {string} [opts.query] - Pertanyaan tambahan (dipakai kalau fallback Gemini).
 * @param {boolean} [opts.noFallback]
 * @returns {Promise<{status: boolean, text?: string, error?: string, source?: 'bell'|'gemini'}>}
 */
async function askBellAudio({ buffer, mimeType, query, noFallback } = {}) {
  if (!buffer) return { status: false, error: 'Buffer audio kosong.' };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TERMAI_TIMEOUT_MS);

    const res = await fetch(
      `${TERMAI_URL}/api/audioProcessing/transcribe?key=${TERMAI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: buffer,
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const text = data?.data || data?.text || '';
      if (text && String(text).trim() && text !== 'gagal!') {
        _log('termai.cc OK (transcribe)');
        return { status: true, text: String(text).trim(), source: 'bell' };
      }
      _warn('termai.cc transcribe kosong/gagal:', JSON.stringify(data).slice(0, 150));
    } else {
      _warn(`termai.cc transcribe HTTP ${res.status}`);
    }
  } catch (e) {
    const reason = e.name === 'AbortError' ? `timeout ${TERMAI_TIMEOUT_MS}ms` : e.message;
    _warn('termai.cc transcribe gagal:', reason);
  }

  if (noFallback) {
    return { status: false, error: 'api.termai.cc (transcribe) gagal dan fallback dinonaktifkan.' };
  }

  _warn('Fallback ke Gemini/Supabase untuk audio...');
  const viaGemini = await askAI({
    parts: [
      { inlineData: { data: buffer.toString('base64'), mimeType: mimeType || 'audio/ogg' } },
      query || 'Tolong dengarkan dan tanggapi audio ini.',
    ],
  });
  if (viaGemini.status) {
    return { status: true, text: viaGemini.text, source: 'gemini' };
  }
  return { status: false, error: `Bell gagal & fallback Gemini juga gagal: ${viaGemini.error}` };
}

module.exports = { askBell, askBellImage, askBellAudio, TERMAI_KEY, TERMAI_URL };
