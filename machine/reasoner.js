// ============================================================
// Alya AI Reasoner — Bell (termai.cc) + Gemini Fallback
// ============================================================
// Alur:
//   1. Coba ai() → api.termai.cc (2x percobaan, timeout 12s/percobaan)
//   2. Kalau gagal / response tidak valid → fallback ke Gemini
//      (key diambil dari Supabase, sama seperti callGeminiDeep di
//      interactive_ai.js), dipaksa balas JSON dengan skema yang
//      SAMA PERSIS seperti termai (field: cmd, msg, cfg) supaya
//      switch-case di runAIInteractive tidak perlu diubah sama sekali.
//   3. Kalau Gemini juga gagal → return {} (caller sudah handle
//      kosong dengan aman, akan fallback ke reply teks biasa).
//
// PENTING soal Voice Note (kirim_suara):
//   Reasoner ini HANYA menentukan "mikir & pilih cmd" (teks).
//   Audio TTS voice note TIDAK lewat sini — itu ditangani terpisah
//   oleh generateVoice() di interactive_ai.js (ElevenLabs via termai
//   → endpoint alt → VoiceRSS → Google TTS). Gemini text API tidak
//   bisa menghasilkan audio, jadi reasoner fallback ini tidak
//   memengaruhi jalur suara sama sekali.
// ============================================================

'use strict';

const { askAI } = require('../lib/scraper-ai');

const TERMAI_KEY = process.env.TERMAI_KEY || 'Bell409';
const TERMAI_URL = 'https://api.termai.cc';

const TERMAI_TIMEOUT_MS   = 12000;
const TERMAI_MAX_ATTEMPTS = 2;
const TERMAI_RETRY_DELAY  = 900;

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function _log(...args) {
  console.log('[Reasoner]', ...args);
}
function _warn(...args) {
  console.warn('[Reasoner]', ...args);
}
function _err(...args) {
  console.error('[Reasoner]', ...args);
}

// ── Validasi hasil: harus punya minimal cmd ATAU msg yang berisi ──
function _isValidResult(data) {
  if (!data || typeof data !== 'object') return false;
  const cmd = data.cmd || data.data?.cmd;
  const msg = data.msg || data.message || data.reply || data.data?.msg;
  return !!(cmd || (msg && String(msg).trim().length > 0));
}

// Normalisasi bentuk hasil supaya selalu ada { data: { cmd, msg, cfg } }
// (runAIInteractive baca via _ai?.data)
function _normalize(raw) {
  if (!raw) return {};
  if (raw.data) return raw; // sudah dalam bentuk { data: {...} }
  // beberapa response termai kadang flat (cmd/msg langsung di root)
  if (raw.cmd || raw.msg) {
    return { data: { cmd: raw.cmd, msg: raw.msg, cfg: raw.cfg || {} } };
  }
  return raw;
}

// ── 1. Panggilan ke termai.cc dengan retry + timeout ───────────
async function _callTermai(body) {
  for (let attempt = 1; attempt <= TERMAI_MAX_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TERMAI_TIMEOUT_MS);

      const res = await fetch(`${TERMAI_URL}/api/chat/logic-bell?key=${TERMAI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        _warn(`termai.cc HTTP ${res.status} (percobaan ${attempt}/${TERMAI_MAX_ATTEMPTS})`);
        if (attempt < TERMAI_MAX_ATTEMPTS) { await _sleep(TERMAI_RETRY_DELAY); continue; }
        return null;
      }

      const json = await res.json();
      const normalized = _normalize(json);

      if (!_isValidResult(normalized.data ? normalized : { data: normalized })) {
        _warn(`termai.cc response tidak valid/kosong (percobaan ${attempt}/${TERMAI_MAX_ATTEMPTS}):`, JSON.stringify(json).slice(0, 200));
        if (attempt < TERMAI_MAX_ATTEMPTS) { await _sleep(TERMAI_RETRY_DELAY); continue; }
        return null;
      }

      _log(`termai.cc OK (percobaan ${attempt}) → cmd="${normalized.data?.cmd || '-'}"`);
      return normalized;
    } catch (e) {
      const reason = e.name === 'AbortError' ? `timeout ${TERMAI_TIMEOUT_MS}ms` : e.message;
      _warn(`termai.cc gagal (percobaan ${attempt}/${TERMAI_MAX_ATTEMPTS}): ${reason}`);
      if (attempt < TERMAI_MAX_ATTEMPTS) { await _sleep(TERMAI_RETRY_DELAY); continue; }
    }
  }
  return null;
}

// ── 2. Fallback Gemini — teks & pemilihan cmd, PLUS media (image/video) ──
// FIX (V20 SC Alisa Bell): sebelumnya fungsi ini punya logic rotasi-key
// Supabase sendiri (copy-paste dari interactive_ai.js). Sekarang dipusatkan
// lewat lib/scraper-ai.js supaya satu sumber kebenaran untuk ambil/rotasi/
// deactivate API key Gemini di seluruh project.
//
// Kalau body.image / body.video terisi (base64) — sama seperti yang
// dikirim ke logic-bell — fallback ini juga meneruskannya ke Gemini
// lewat inlineData, supaya media tetap terbaca walau termai.cc down.
async function _callGeminiFallback(body) {
  try {
    // Bangun daftar "commands" (function-calling schema) jadi teks instruksi
    const commandsList = Array.isArray(body.commands) ? body.commands : [];
    const cmdInstructions = commandsList.map((c, i) =>
      `${i + 1}. ${c.description}\n   → Jika cocok, balas JSON dengan bentuk: ${JSON.stringify(c.output)}`
    ).join('\n\n');

    const hasMedia = !!(body.image || body.video);
    const mediaNote = hasMedia
      ? `\n\nUser juga mengirim/reply sebuah ${body.image ? 'gambar' : 'video'} — lihat isinya baik-baik sebelum menjawab.`
      : '';

    const systemPrompt =
      `${body.custom_profile || ''}\n\n` +
      `═══════════════════════════════════════\n` +
      `ATURAN WAJIB — FORMAT OUTPUT:\n` +
      `Kamu HARUS membalas HANYA dalam JSON valid, TANPA teks lain, TANPA markdown code fence.\n` +
      `Bentuk default (kalau tidak ada command yang cocok):\n` +
      `{"cmd": null, "msg": "<balasan singkat Alya>"}\n\n` +
      `Command yang tersedia (pakai HANYA jika benar-benar cocok dengan permintaan user):\n` +
      `${cmdInstructions}\n\n` +
      `Field "cfg" isi dengan data konkret hasil ekstraksi dari chat user (jangan placeholder).\n` +
      `Field "msg" WAJIB selalu diisi kalimat tsundere singkat sesuai gaya Alya.${mediaNote}\n` +
      `═══════════════════════════════════════\n\n` +
      `Pesan dari ${body.senderName || 'user'}: "${body.text || ''}"`;

    let result;
    if (hasMedia) {
      const mimeType = body.image ? 'image/jpeg' : 'video/mp4';
      const mediaB64 = body.image || body.video;
      result = await askAI({
        parts: [
          { inlineData: { data: mediaB64, mimeType } },
          systemPrompt,
        ],
        jsonMode: true,
      });
    } else {
      result = await askAI({
        prompt: systemPrompt,
        model: 'gemini-flash-lite-latest',
        jsonMode: true, // paksa Gemini balas JSON murni — sama seperti sebelumnya
      });
    }

    if (!result.status) {
      _warn('Gemini fallback: askAI gagal —', result.error);
      return null;
    }
    if (!result.text) {
      _warn('Gemini fallback: response kosong');
      return null;
    }

    let parsed;
    try {
      parsed = JSON.parse(result.text.replace(/```json|```/g, '').trim());
    } catch {
      _warn('Gemini fallback: gagal parse JSON dari response');
      return null;
    }

    if (_isValidResult({ data: parsed })) {
      _log(`Gemini fallback OK → cmd="${parsed.cmd || '-'}"`);
      return { data: { cmd: parsed.cmd || null, msg: parsed.msg || '', cfg: parsed.cfg || {} } };
    }

    _warn('Gemini fallback: hasil tidak valid (tidak ada cmd/msg)');
    return null;
  } catch (e) {
    _err('Gemini fallback exception:', e.message);
    return null;
  }
}

// ── Entry point utama (dipakai runAIInteractive) ───────────────
async function ai(body) {
  const viaTermai = await _callTermai(body);
  if (viaTermai) return viaTermai;

  _warn('termai.cc gagal total setelah retry — mengalihkan ke Gemini fallback...');
  const viaGemini = await _callGeminiFallback(body);
  if (viaGemini) return viaGemini;

  _err('Semua sumber AI gagal (termai.cc + Gemini). Mengembalikan hasil kosong.');
  return {};
}

module.exports = { ai, TERMAI_KEY, TERMAI_URL };
