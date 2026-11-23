// Plugin: kurangisewa
// Mengurangi durasi sewa grup yang SUDAH terdaftar di database sewa.json.
// Kebalikan dari .tambahsewa — terintegrasi dengan lib/sewa.js & global.sewa
// (sumber data yang sama dipakai .ceksewa, .listsewa, .delsewa, dan
// auto-expire interval 10 menit di index.js).
//
// Commands: kurangisewa

'use strict';

const { subtractDurationSewa, msToDate, getGcName } = require('../../lib/sewa');

module.exports = {
  command: ['kurangisewa'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, Ryuu, replyalya, replytolak, mess } = ctx;

    // ── Cek permission owner ────────────────────────────────────────────────
    if (!Ryuu) return replytolak(mess?.only?.owner || '❌ Fitur ini khusus Owner!');

    const parts = text ? text.trim().split(/\s+/).filter(Boolean) : [];

    if (parts.length === 0) {
      return replyalya(
        `╭━━━〔 📋 *PANDUAN KURANGISEWA* 〕━━━⬣\n` +
        `┃\n` +
        `┃ *Format:*\n` +
        `┃ ${prefix}${command} <id_grup|.> <durasi>\n` +
        `┃\n` +
        `┃ *Contoh (dari dalam grup target):*\n` +
        `┃ ${prefix}${command} . 7d\n` +
        `┃ ${prefix}${command} 7d   _(boleh tanpa id kalau di grup)_\n` +
        `┃\n` +
        `┃ *Contoh (sebut ID grup manual):*\n` +
        `┃ ${prefix}${command} 120363012345678901@g.us 7d\n` +
        `┃\n` +
        `┃ *Satuan Waktu:*\n` +
        `┃ s=detik  m=menit  h=jam\n` +
        `┃ d=hari   y=tahun\n` +
        `┃\n` +
        `┃ ⚠️ Grup HARUS sudah terdaftar sewa lebih dulu.\n` +
        `┃ ⚠️ Tidak bisa dipakai pada sewa PERMANENT.\n` +
        `┃ ⚠️ Kalau hasilnya melebihi sisa waktu, sewa\n` +
        `┃    langsung dianggap EXPIRED (bot auto keluar\n` +
        `┃    lewat pengecekan interval, paling lambat\n` +
        `┃    10 menit kemudian).\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }

    // ── Tentukan target id grup & durasi ────────────────────────────────────
    let targetId;
    let waktu;

    if (parts.length === 1) {
      if (!m.isGroup) {
        return replyalya(
          `❌ *Tidak ada ID grup yang disebutkan!*\n\n` +
          `Jalankan command ini DI DALAM grup target, atau sebutkan ID grup:\n` +
          `${prefix}${command} <id_grup> <durasi>`
        );
      }
      targetId = m.chat;
      waktu = parts[0];
    } else {
      const first = parts[0];
      waktu = parts[1];
      if (first === '.' || first === 'sini' || first === 'ini') {
        if (!m.isGroup) {
          return replyalya(`❌ Tidak bisa pakai "${first}" karena command ini tidak dijalankan di dalam grup.`);
        }
        targetId = m.chat;
      } else if (/^\d+@g\.us$/.test(first)) {
        targetId = first;
      } else {
        return replyalya(
          `❌ *ID grup tidak valid!* (\`${first}\`)\n\n` +
          `Gunakan "." untuk grup saat ini, atau format ID:\n` +
          `\`120363012345678901@g.us\``
        );
      }
    }

    // ── Validasi durasi (PERMANENT tidak relevan untuk pengurangan) ────────
    const durNum = parseInt(waktu);
    const unit = waktu[waktu.length - 1]?.toLowerCase();
    if (isNaN(durNum) || durNum <= 0 || !['s', 'm', 'h', 'd', 'y'].includes(unit)) {
      return replyalya(
        `❌ *Durasi tidak valid!* (\`${waktu}\`)\n\n` +
        `Contoh durasi yang benar:\n` +
        `• \`7d\` = 7 hari\n• \`1h\` = 1 jam\n• \`30m\` = 30 menit\n• \`1y\` = 1 tahun`
      );
    }

    // ── Eksekusi pengurangan durasi (pakai sumber data kanonik global.sewa) ─
    const sewa = global.sewa || [];
    const result = subtractDurationSewa(targetId, waktu, sewa);

    if (!result.ok) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      if (result.reason === 'NOT_FOUND') {
        return replyalya(
          `❌ *Grup belum terdaftar sewa!*\n\n` +
          `🆔 ID: \`${targetId}\`\n\n` +
          `Tidak ada yang bisa dikurangi karena grup ini belum punya data sewa.`
        );
      }
      if (result.reason === 'IS_PERMANENT') {
        return replyalya(
          `❌ *Sewa grup ini PERMANENT!*\n\n` +
          `🆔 ID: \`${targetId}\`\n\n` +
          `Tidak bisa mengurangi durasi dari sewa PERMANENT.\n` +
          `Kalau ingin mengubahnya jadi durasi terbatas, hapus dulu lewat\n` +
          `\`${prefix}delsewa\` lalu daftarkan ulang dengan \`${prefix}addsewa\`.`
        );
      }
      return replyalya(`❌ Gagal mengurangi durasi sewa: ${result.reason || 'unknown error'}`);
    }

    // ── Sinkron ulang global.sewa (defensif) ────────────────────────────────
    global.sewa = sewa;

    const groupName = await getGcName(targetId);
    const sisaSetelah = result.after - Date.now();
    const sudahExpired = sisaSetelah <= 0;

    const fmtExpired = (val) => {
      const sisa = val - Date.now();
      if (sisa <= 0) return '⚠️ SUDAH EXPIRED';
      return msToDate(sisa);
    };
    const fmtDate = (val) => new Date(val).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    await alya.sendMessage(m.chat, { react: { text: sudahExpired ? '⚠️' : '✅', key: m.key } });

    let warning = '';
    if (sudahExpired) {
      warning =
        `┃\n` +
        `┃ ⚠️ *PERHATIAN:* Sisa waktu sudah habis!\n` +
        `┃ Bot akan otomatis keluar dari grup ini\n` +
        `┃ pada pengecekan berikutnya (≤ 10 menit).\n`;
    }

    return replyalya(
      `╭━━━〔 ✅ *DURASI SEWA DIKURANGI* 〕━━━⬣\n` +
      `┃\n` +
      `┃ 🏷️ Nama       : *${groupName}*\n` +
      `┃ 🆔 ID         : \`${targetId}\`\n` +
      `┃\n` +
      `┃ ➖ Dikurangi  : *${waktu}*\n` +
      `┃\n` +
      `┃ ⏳ Sebelum    : ${fmtExpired(result.before)}\n` +
      `┃ ⏳ Sesudah    : *${fmtExpired(result.after)}*\n` +
      `┃ 🗓️ Tgl baru    : ${fmtDate(result.after)}\n` +
      warning +
      `┃\n` +
      `┃ 💡 Cek sewa: \`${prefix}ceksewa\` (di grup)\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
    );
  },
};
