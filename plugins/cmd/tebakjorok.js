// ============================================================
//  Plugin: tebakjorok.js
//  Fungsi : Game tebak-tebakan jorok via Synox Cloud API
//  Author : Alya Bot V20
//  CMD    : .tebakjorok / .tebakjelek / .tj
//  FIX    : Converted from old-style fn export → {command, run}
//           conn → alya, tambah alias .tebakjelek
// ============================================================

'use strict'

// ── Penyimpanan soal aktif per grup/chat ───────────────────
const activeSoal = new Map();
// Format: chatId => { soal, jawaban, index, timeout }

module.exports = {
  command: ['tebakjorok', 'tebakjelek', 'tj'],
  tags: ['games'],
  help: ['tebakjorok'],
  owner: false,
  admin: false,
  group: false,
  private: false,
  premium: false,
  limit: false,
  register: false,

  run: async (alya, m, ctx) => {
    const {
      args,
      reply,
      fetchJson,
      prefix,
      command,
    } = ctx;

    const chatId = m.chat;
    const subCmd = (args[0] || '').toLowerCase();

    // ── Sub-command: jawab ─────────────────────────────────────
    if (subCmd === 'jawab' || subCmd === 'j') {
      const aktif = activeSoal.get(chatId);
      if (!aktif) {
        return reply(`❓ Belum ada soal aktif!\nKetik *${prefix}${command}* untuk mulai.`);
      }

      const tebakan = args.slice(1).join(' ').toLowerCase().trim();
      if (!tebakan) {
        return reply(`❓ Masukkan jawabanmu!\nContoh: *${prefix}${command} jawab [jawaban]*`);
      }

      const jawabanBenar = aktif.jawaban.toLowerCase().trim();

      if (tebakan === jawabanBenar || jawabanBenar.includes(tebakan)) {
        clearTimeout(aktif.timeout);
        activeSoal.delete(chatId);

        return reply(
          `🎉 *BENAR!*\n\n` +
          `✅ Jawaban: *${aktif.jawaban}*\n\n` +
          `Ketik *${prefix}${command}* untuk soal berikutnya~`
        );
      } else {
        return reply(`❌ Salah! Coba lagi atau ketik *${prefix}${command} skip* untuk skip.`);
      }
    }

    // ── Sub-command: skip / jawaban ────────────────────────────
    if (subCmd === 'skip' || subCmd === 'jawaban' || subCmd === 'jb') {
      const aktif = activeSoal.get(chatId);
      if (!aktif) {
        return reply(`❓ Belum ada soal aktif!\nKetik *${prefix}${command}* untuk mulai.`);
      }

      clearTimeout(aktif.timeout);
      activeSoal.delete(chatId);

      return reply(
        `🏳️ *SKIP!*\n\n` +
        `📌 Soal: _${aktif.soal}_\n` +
        `✅ Jawaban: *${aktif.jawaban}*\n\n` +
        `Ketik *${prefix}${command}* untuk soal baru~`
      );
    }

    // ── Cek soal aktif (jangan spam soal baru) ─────────────────
    if (activeSoal.has(chatId)) {
      const aktif = activeSoal.get(chatId);
      return reply(
        `⚠️ Masih ada soal yang belum dijawab!\n\n` +
        `📌 *${aktif.soal}*\n\n` +
        `• Jawab: *${prefix}${command} jawab [jawaban]*\n` +
        `• Skip : *${prefix}${command} skip*`
      );
    }

    // ── Fetch soal baru ────────────────────────────────────────
    let data;
    try {
      data = await fetchJson('https://api.synoxcloud.biz.id/games/tebak-jorok');
    } catch (err) {
      return reply(`❌ Gagal mengambil soal!\nAPI Synox sedang bermasalah, coba lagi nanti.`);
    }

    if (!data?.status || !data?.result?.soal) {
      return reply(`❌ Soal tidak tersedia saat ini, coba lagi nanti.`);
    }

    const { soal, jawaban, index } = data.result;

    // ── Auto-reveal jawaban setelah 60 detik ───────────────────
    const autoReveal = setTimeout(async () => {
      if (activeSoal.has(chatId)) {
        activeSoal.delete(chatId);
        try {
          await alya.sendMessage(chatId, {
            text:
              `⏰ *Waktu Habis!*\n\n` +
              `📌 Soal: _${soal}_\n` +
              `✅ Jawaban: *${jawaban}*\n\n` +
              `Ketik *${prefix}tebakjorok* untuk soal baru~`
          });
        } catch {}
      }
    }, 60_000);

    // ── Simpan soal aktif ──────────────────────────────────────
    activeSoal.set(chatId, { soal, jawaban, index, timeout: autoReveal });

    // ── Kirim soal ─────────────────────────────────────────────
    await reply(
      `🔞 *TEBAK-TEBAKAN JOROK*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `❓ *${soal}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Jawab : *${prefix}${command} jawab [jawaban]*\n` +
      `• Skip  : *${prefix}${command} skip*\n\n` +
      `⏰ Jawaban otomatis terungkap dalam *60 detik*!`
    );
  }
};
