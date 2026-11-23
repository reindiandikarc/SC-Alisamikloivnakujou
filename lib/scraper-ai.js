// lib/scraper-ai.js
// Modul AI terpusat untuk Alya.
// Menggantikan logic Supabase + rotasi key yang sebelumnya di-copy-paste
// di puluhan file plugins/cmd/*.js (cai.js, hitori-gotoh.js, bardai.js, dll).
//
// Cara pakai di command:
//   const { askAI } = require('../../lib/scraper-ai');
//   const result = await askAI({ prompt: 'halo' });
//   if (!result.status) return replyalya(result.error);
//   await m.reply(result.text);
//
// Untuk command yang butuh kirim media (gambar/video/dokumen), gunakan
// parameter `parts` alih-alih `prompt`:
//   const result = await askAI({ parts: [{ inlineData: {...} }, 'teks'] });

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_MODEL = 'gemini-flash-lite-latest';
const TABLE = 'gemini_keys';

let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient) {
    if (!global.supaurl || !global.supakey) {
      throw new Error('global.supaurl / global.supakey belum di-set (lihat settings.js)');
    }
    supabaseClient = createClient(global.supaurl, global.supakey);
  }
  return supabaseClient;
}

function isKeyDeadError(err) {
  const msg = (err && err.message ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('403') ||
    msg.includes('invalid') ||
    msg.includes('leaked') ||
    msg.includes('api key not valid') ||
    msg.includes('quota')
  );
}

/**
 * Ambil semua API key Gemini yang masih aktif dari Supabase.
 * @returns {Promise<{apikey: string}[]>}
 */
async function getActiveKeys() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select('apikey')
    .eq('is_active', true);

  if (error) throw new Error(`Gagal ambil API key dari Supabase: ${error.message}`);
  return data || [];
}

/**
 * Tandai satu API key sebagai tidak aktif (dipanggil saat key gagal/kena limit).
 * @param {string} apikey
 */
async function deactivateKey(apikey) {
  try {
    const supabase = getSupabase();
    await supabase.from(TABLE).update({ is_active: false }).eq('apikey', apikey);
  } catch {
    // best-effort, jangan sampai gagal deactivate menghentikan flow utama
  }
}

/**
 * Kirim prompt ke Gemini, dengan rotasi otomatis antar API key aktif.
 * Key yang error 403/invalid/leaked/quota akan otomatis dinonaktifkan di Supabase.
 *
 * @param {Object} opts
 * @param {string} [opts.prompt] - Teks prompt sederhana (dipakai kalau `parts` tidak diisi).
 * @param {Array}  [opts.parts]  - Content array mentah untuk generateContent (untuk kasus media).
 * @param {string} [opts.systemInstruction] - Instruksi sistem/persona, digabung di depan prompt.
 * @param {string} [opts.model] - Override model, default 'gemini-flash-lite-latest'.
 * @param {boolean} [opts.jsonMode] - Kalau true, paksa Gemini balas JSON murni (responseMimeType).
 * @returns {Promise<{status: boolean, text?: string, error?: string}>}
 */
async function askAI({ prompt, parts, systemInstruction, model, jsonMode } = {}) {
  let keysData;
  try {
    keysData = await getActiveKeys();
  } catch (err) {
    return { status: false, error: err.message };
  }

  if (!keysData || keysData.length === 0) {
    return { status: false, error: 'Tidak ada API Key aktif, hubungi owner.' };
  }

  let content;
  if (parts) {
    content = parts;
  } else {
    const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt || ''}` : (prompt || '');
    if (!finalPrompt) return { status: false, error: 'Prompt kosong.' };
    content = [finalPrompt];
  }

  const modelName = model || DEFAULT_MODEL;
  let lastError = 'Unknown Error';

  for (const k of keysData) {
    try {
      const genAI = new GoogleGenerativeAI(k.apikey);
      const genModel = genAI.getGenerativeModel({
        model: modelName,
        ...(jsonMode ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
      });
      const result = await genModel.generateContent(content);
      const text = result.response.text();
      return { status: true, text };
    } catch (err) {
      lastError = err.message || String(err);
      if (isKeyDeadError(err)) {
        await deactivateKey(k.apikey);
      }
      // lanjut coba key berikutnya
    }
  }

  return { status: false, error: lastError };
}

module.exports = { askAI, getActiveKeys, deactivateKey, DEFAULT_MODEL };
