// ============================================================
//  Plugin: claudeai.js
//  Fungsi : Chat AI persona "Claude" via Synox Cloud API
//  Author : Alya Bot V20
//  CMD    : .claude / .claudeai / .opus / .cl
//
//  FIX    : Tidak lagi pakai API resmi Anthropic (claudeApiKey
//           dihapus total). Sekarang proxy ke endpoint Synox
//           Cloud, format POST sesuai permintaan owner.
//
//  CATATAN: Endpoint ini API pihak ketiga (bukan endpoint resmi
//           Anthropic), jadi nama model "claude-opus-4.8" di URL
//           cuma label dari provider tsb, bukan model Anthropic
//           yang sebenarnya terhubung di baliknya.
// ============================================================

'use strict';

const axios = require('axios');

const API_URL = 'https://api.synoxcloud.xyz/ai-chat/claude-opus-4.8';

const HEADERS_BASE = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};

async function askClaude(text, systemPrompt) {
  const errors = [];

  // ── Attempt 1: POST application/json (format utama) ──────────
  try {
    const res = await axios.post(
      API_URL,
      { text, prompt: text, system: systemPrompt },
      {
        headers: { ...HEADERS_BASE, 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );
    const answer = res.data?.result?.text || res.data?.result || res.data?.response || res.data?.answer || res.data?.message;
    if ((res.data?.status === true || res.data?.status === undefined) && answer) {
      return typeof answer === 'string' ? answer : JSON.stringify(answer);
    }
    errors.push(`JSON: ${res.data?.message || 'no result'}`);
  } catch (e) { errors.push(`JSON: ${e.message}`); }

  // ── Attempt 2: POST application/x-www-form-urlencoded (fallback) ──
  try {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('prompt', text);
    if (systemPrompt) params.append('system', systemPrompt);
    const res = await axios.post(API_URL, params.toString(), {
      headers: { ...HEADERS_BASE, 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000
    });
    const answer = res.data?.result?.text || res.data?.result || res.data?.response || res.data?.answer || res.data?.message;
    if ((res.data?.status === true || res.data?.status === undefined) && answer) {
      return typeof answer === 'string' ? answer : JSON.stringify(answer);
    }
    errors.push(`URLEncoded: ${res.data?.message || 'no result'}`);
  } catch (e) { errors.push(`URLEncoded: ${e.message}`); }

  throw new Error(errors.join(' | '));
}

module.exports = {
  command: ['claude', 'claudeai', 'opus', 'cl'],
  tags: ['ai'],
  help: ['claude <teks> - Chat dengan AI persona Claude'],
  owner: false,
  admin: false,
  group: false,
  private: false,
  premium: false,
  limit: true,
  register: false,

  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) {
      return replyalya(
        `🤖 *Claude AI*\n\n` +
        `• *Contoh:* ${prefix}${command} Siapakah pencipta WhatsApp?\n\n` +
        `_💡 Powered by Synox Cloud API_`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

    const systemPrompt =
      `Nama kamu adalah Alya Mikhailovna Kujou, biasa dipanggil Alya. ` +
      `Kamu adalah asisten AI cerdas dalam bot WhatsApp milik ${global.ownername || 'Owner'}. ` +
      `Jawab dengan bahasa Indonesia yang natural dan ramah. ` +
      `Jika diminta format, gunakan tanda bintang (*teks*) untuk bold. ` +
      `Kamu sedang membantu pengguna bernama ${pushname}.`;

    try {
      const answer = await askClaude(text, systemPrompt);

      if (answer.length > 4000) {
        const chunks = answer.match(/.{1,4000}/gs) || [];
        for (let i = 0; i < chunks.length; i++) {
          await reply(i === 0 ? `🤖 *Alya AI:*\n\n${chunks[i]}` : `📄 *Lanjutan (${i + 1}/${chunks.length})*\n${chunks[i]}`);
        }
      } else {
        await reply(`🤖 *Alya AI:*\n\n${answer}`);
      }

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});

    } catch (e) {
      console.error('[claudeai]', e.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      reply(
        `❌ *Gagal menghubungi Claude AI!*\n\n` +
        `• API mungkin sedang down\n` +
        `• Coba lagi beberapa saat\n\n` +
        `Detail: _${e.message.split(' | ')[0]}_`
      );
    }
  }
};
