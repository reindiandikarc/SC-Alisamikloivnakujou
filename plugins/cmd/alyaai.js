// Plugin: alyaai
// Auto-generated from Alya V12
// Commands: alyaai
// ─────────────────────────────────────────────────────────────
// FIX (V20 SC Alisa Bell): file sebelumnya punya extra closing
// brace di tengah `run()` sehingga sisa kode (komentar .setrole)
// jadi dead code di luar module.exports. Struktur diperbaiki
// tanpa mengubah behavior asli. Command .setrole sendiri sudah
// ada terpisah di plugins/cmd/setroleuser.js — tidak perlu
// diduplikasi di sini.
// ─────────────────────────────────────────────────────────────

'use strict';

module.exports = {
  command: ['alyaai'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix,
      botNumber,
      Ryuu,
      replyalya, replytolak,
    } = ctx;

    if (!Ryuu) return replytolak('❌ Fitur ini hanya untuk *Owner* bot!');

    // Pastikan key tersedia
    if (!global.db.settings[botNumber]) global.db.settings[botNumber] = {};
    if (!('alyaai_global' in global.db.settings[botNumber])) {
      global.db.settings[botNumber].alyaai_global = true;
    }

    const currentState = global.db.settings[botNumber].alyaai_global !== false;

    if (args[0] === 'on') {
      if (currentState) return replyalya(`A-aku sudah aktif dari tadi! Makanya dengerin kalau aku ngomong! 😤`);
      global.db.settings[botNumber].alyaai_global = true;
      saveDB(global.db);
      return replyalya(`✅ *Alya AI Chat — AKTIF GLOBAL!*\n\nB-bukan berarti aku senang dipanggil ya! Hmph! 😤\nSekarang aku bakal balas pesan di *semua chat*, baik grup maupun pribadi.\n\n*Cara manggil aku:*\n• Ketik *alya* di awal pesan\n• Reply pesan aku\n• Tag/mention aku\n• Chat pribadi (selalu aktif)`);
    }

    if (args[0] === 'off') {
      if (!currentState) return replyalya(`A-aku memang sudah nonaktif dari tadi... Kamu ga perhatiin aku sama sekali! 😤`);
      global.db.settings[botNumber].alyaai_global = false;
      saveDB(global.db);
      return replyalya(`❌ *Alya AI Chat — NONAKTIF GLOBAL!*\n\nFine! Kalau gitu aku diam total dulu! Hmph! 😤\nAku tidak akan balas pesan siapapun — di grup maupun pribadi.\n\nKetik *${prefix}alyaai on* kalau mau aku balik lagi.`);
    }

    return replyalya(`*🌸 Alya AI Chat — Global Toggle*\n\n*Status Sekarang:* ${currentState ? '✅ Aktif' : '❌ Nonaktif'}\n\n*Perintah (Owner Only):*\n• ${prefix}alyaai on — Hidupkan AI chat di SEMUA chat\n• ${prefix}alyaai off — Matikan AI chat di SEMUA chat\n\n_Berbeda dengan ${prefix}ai on/off yang hanya per-grup,_\n_${prefix}alyaai mengontrol AI secara global!_`);
  },
};
