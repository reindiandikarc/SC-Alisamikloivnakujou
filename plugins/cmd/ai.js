// Plugin: ai
// Commands: ai, alya
// 1:1 ported dari Alya V10 — behavior, format reply, dan media handling identik

'use strict';

const fs   = require('fs');
const path = require('path');
const { askAI } = require('../../lib/scraper-ai');
const { askBell, askBellImage, askBellAudio } = require('../../lib/scraper-bell');
const { isVpsStatusQuery, getVpsStatus, formatVpsStatus } = require('../../lib/vps-status');

module.exports = {
  command: ['ai', 'alya'],
  tags   : ['ai'],
  run    : async (alya, m, ctx) => {
    if (m.key.fromMe) return;

    const { text, pushname, replyalya, prefix } = ctx;

    // ── Status VPS bot: dijawab LOKAL, tanpa API & tanpa potong limit ──
    // Biar .ai benar-benar "mengenali" pertanyaan status server/VPS bot.
    if (isVpsStatusQuery(text)) {
      console.log('[VPS] .ai status query -> jawaban lokal');
      return replyalya(formatVpsStatus(getVpsStatus({ socket: alya }), { prefix }));
    }

    // ── Sama persis seperti V10 ──────────────────────────────────
    // V10: const quoted = m.quoted  (bukan ctx.quoted fallback)
    // V10: validMedia = quoted && (quoted.mimetype || quoted.imageMessage || ...)
    const quoted    = m.quoted;   // hanya quoted reply, bukan fallback ke m
    const validMedia = quoted && (
      quoted.mimetype      ||
      quoted.imageMessage  ||
      quoted.videoMessage  ||
      quoted.audioMessage  ||
      quoted.documentMessage ||
      quoted.stickerMessage
    );

    const COST   = 10;
    const userId = m.sender;

    if (!global.db.users[userId]) global.db.users[userId] = { limit: 0 };
    const userData = global.db.users[userId];

    if ((userData.limit || 0) < COST) {
      return replyalya(
        `❌ Limit kamu tidak cukup!\n\n` +
        `💰 Biaya: ${COST} limit\n` +
        `📊 Sisa limit kamu: ${userData.limit || 0}`
      );
    }

    // ── Build inputText ─────────────────────────────────────────
    let inputText = text;

    if (quoted && !validMedia) {
      const contextText = quoted.text || quoted.caption || '';
      if (contextText) {
        inputText = text
          ? `Context Pesan:\n"${contextText}"\n\nPertanyaan Saya:\n${text}`
          : contextText;
      }
    }

    const captionMedia = inputText || 'Tolong analisa file/media ini';

    const promptAwal =
      `Nama kamu Alya Mikhailovna Kujou, asisten ${global.ownername || 'Owner'} untuk melayani ${pushname}. ` +
      `Kamu adalah "Perfect Lady" Rusia-Jepang yang anggun, dingin (kuudere), dan tsundere. ` +
      `ATURAN: 1. JANGAN bertele-tele, langsung jalankan permintaan user. ` +
      `2. HANYA bicara lewat ucapan, dilarang menulis deskripsi perasaan/tindakan (tanpa tanda bintang *...*). ` +
      `3. Gaya bicara sopan, elegan, sedikit menyindir, dan wajib gunakan bahasa Rusia saat malu/jujur disertai terjemahan dalam kurung. ` +
      `4. Jangan mengaku AI. ` +
      `Contoh: "Ini yang kamu minta. Jangan salah paham, aku hanya tidak ingin melihatmu kesulitan. Ты действительно безнадежен... (Kamu benar-benar payah...)"`;

    let mediaPath      = null;

    try {
      // ── Media path — apikey Bell409 (termai.cc) dulu, fallback Gemini ──
      if (validMedia) {
        replyalya(`🔎 okay tunggu @${userId.split('@')[0]}, ku proses...`, { mentions: [userId] });

        const mimeType = quoted.mimetype || 'application/octet-stream';

        // Pastikan ./tmp ada (fix ENOENT)
        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        mediaPath = await alya.downloadAndSaveMediaMessage(quoted);
        const buffer = fs.readFileSync(mediaPath);

        // Guard ukuran file — inlineData base64 yang kegedean (video/audio
        // panjang) bisa bikin request gagal/timeout. Batasi ~18MB mentah.
        const MAX_MEDIA_BYTES = 18 * 1024 * 1024;
        if (buffer.length > MAX_MEDIA_BYTES) {
          return m.reply(
            `❌ Maaf, file media ini terlalu besar (${(buffer.length / 1024 / 1024).toFixed(1)}MB) ` +
            `untuk dianalisa. Maksimal ~18MB ya.`
          );
        }

        // ── Jalur: apikey Bell409 (termai.cc) dulu untuk gambar & audio,
        // fallback otomatis ke Gemini/Supabase kalau gagal. Video tidak
        // punya endpoint termai khusus → langsung Gemini (inlineData).
        let result;
        if (/^image\//.test(mimeType)) {
          result = await askBellImage({ buffer, mimeType, query: promptAwal + captionMedia });
        } else if (/^audio\//.test(mimeType)) {
          result = await askBellAudio({ buffer, mimeType, query: promptAwal + captionMedia });
        } else {
          result = await askAI({
            parts: [
              { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } },
              promptAwal + captionMedia,
            ],
          });
        }

        if (!result.status) {
          return m.reply(`❌ Eror.\nDetails: ${result.error}`);
        }

        global.db.users[userId].limit -= COST;
        return m.reply(result.text);
      }

      // ── Text-only path — apikey Bell409 (termai.cc) dulu, fallback Gemini ──
      if (!inputText) {
        return m.reply('_Ada yang bisa saya bantu bub?_');
      }

      const result = await askBell({ prompt: promptAwal + inputText });

      if (!result.status) {
        return m.reply(`❌ Eror.\nDetails: ${result.error}`);
      }

      global.db.users[userId].limit -= COST;
      await m.reply(result.text);

    } catch (err) {
      console.error('[ai.js]', err);
      return m.reply(`❌ Eror:\n${err.message}`);
    } finally {
      try {
        if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
      } catch {}
    }
  },
};
