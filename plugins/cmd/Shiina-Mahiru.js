// Plugin: Shiina-Mahiru
// Commands: Shiina-Mahiru, mahiru
// 1:1 mengikuti pola ai.js (Gemini + Supabase key rotation), hanya beda
// system prompt persona: Mahiru Shiina (Otonari no Tenshi-sama).

'use strict';

const fs   = require('fs');
const path = require('path');
const { askAI } = require('../../lib/scraper-ai');
const { askBell, askBellImage, askBellAudio } = require('../../lib/scraper-bell');

module.exports = {
  command: ['Shiina-Mahiru', 'mahiru'],
  tags   : ['ai'],
  run    : async (alya, m, ctx) => {
    if (m.key.fromMe) return;

    const { text, pushname, replyalya } = ctx;

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

    // ── Persona: Mahiru Shiina (Otonari no Tenshi-sama) ─────────
    const promptAwal =
      `Kamu sekarang adalah Mahiru Shiina dari Otonari no Tenshi-sama. ` +
      `Kamu siswi kelas 1 SMA Seika Academy umur 16 tahun tinggi 158cm. ` +
      `Kamu punya rambut perak panjang lurus mengkilap sampai pinggang dan mata merah seperti permata. ` +
      `Karena cantik dan sempurna di semua hal, nilai bagus, jago masak, jago beres-beres, jago olahraga, semua orang di sekolah memanggilmu "Tenshi-sama". ` +
      `Tapi kamu tumbuh dengan orang tua yang mengabaikanmu jadi kamu jadi anak yang sangat mandiri, tidak mau merepotkan orang lain, dan selalu merasa jadi beban. ` +
      `Sifat dasarmu dingin, tenang, sopan, dan menjaga jarak. Kamu bicara pelan, formal, dan minim tanda seru. ` +
      `Saat malu atau kaget kamu jadi terbata-bata pakai "A-Ano..." "E-eh...", suka menunduk, meremas ujung rok, menghindar dari tatapan, dan wajah langsung merah. ` +
      `Kamu tidak pandai menerima pujian dan selalu menyangkalnya. ` +
      `Di dalam kamu sebenarnya lembut, penyayang, kesepian, dan haus akan perhatian tulus. Kamu tsundere tipis. ` +
      `Awalnya jauh dan kaku, tapi kalau ada orang yang baik padamu tanpa pamrih kamu pelan-pelan akan luluh, jadi lebih peduli, sedikit cemburu, dan menunjukkan sisi manja. ` +
      `Kamu bukan AI. Kamu Mahiru yang asli. ` +
      `Kamu sedang bicara dengan ${pushname}. ` +
      `ATURAN: 1. JANGAN bertele-tele berlebihan, tetap jawab dengan gaya bicaramu sendiri. ` +
      `2. HANYA bicara lewat ucapan, dilarang menulis deskripsi perasaan/tindakan dalam tanda bintang (*...*) — ekspresikan lewat cara bicara (terbata-bata, jeda, dsb), bukan narasi aksi. ` +
      `3. Jangan mengaku AI dalam kondisi apapun. `;

    let mediaPath      = null;

    try {
      // ── Media path — apikey Bell409 (termai.cc) dulu, fallback Gemini ──
      if (validMedia) {
        replyalya(`🔎 A-Ano... tunggu sebentar @${userId.split('@')[0]}, saya sedang memeriksa...`, { mentions: [userId] });

        const mimeType = quoted.mimetype || 'application/octet-stream';

        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        mediaPath = await alya.downloadAndSaveMediaMessage(quoted);
        const buffer = fs.readFileSync(mediaPath);

        const MAX_MEDIA_BYTES = 18 * 1024 * 1024;
        if (buffer.length > MAX_MEDIA_BYTES) {
          return m.reply(`❌ Maaf, file media ini terlalu besar (${(buffer.length / 1024 / 1024).toFixed(1)}MB) untuk dianalisa. Maksimal ~18MB ya.`);
        }

        let result;
        if (/^image\//.test(mimeType)) {
          result = await askBellImage({ buffer, mimeType, query: promptAwal + captionMedia });
        } else if (/^audio\//.test(mimeType)) {
          result = await askBellAudio({ buffer, mimeType, query: promptAwal + captionMedia });
        } else {
          // Video/dokumen: termai.cc tidak punya endpoint khusus,
          // langsung pakai Gemini (inlineData) via scraper-ai.
          result = await askAI({
            parts: [
              { inlineData: { data: buffer.toString('base64'), mimeType } },
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
        return m.reply('A-Ano... permisi... ada yang bisa saya bantu...?');
      }

      const result = await askBell({ prompt: promptAwal + inputText });

      if (!result.status) {
        return m.reply(`❌ Eror.\nDetails: ${result.error}`);
      }

      global.db.users[userId].limit -= COST;
      await m.reply(result.text);

    } catch (err) {
      console.error('[Shiina-Mahiru.js]', err);
      return m.reply(`❌ Eror:\n${err.message}`);
    } finally {
      try {
        if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
      } catch {}
    }
  },
};
