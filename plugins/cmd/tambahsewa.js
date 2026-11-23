// Plugin: tambahsewa
// Menambah/memperpanjang durasi sewa grup yang SUDAH terdaftar di database
// sewa.json. Berbeda dengan .addsewa (yang mendaftarkan grup BARU lewat
// link undangan + proses join grup), .tambahsewa murni menambah waktu ke
// entry sewa yang sudah ada — terintegrasi langsung dengan lib/sewa.js dan
// global.sewa, sumber data yang sama dipakai .ceksewa, .listsewa, .delsewa,
// serta auto-expire interval di index.js.
//
// Commands: tambahsewa

'use strict';

const fs = require('fs');
const { addDurationSewa, msToDate, getGcName } = require('../../lib/sewa');

module.exports = {
  command: ['tambahsewa'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { args, text, prefix, command, Ryuu, replyalya, replytolak, mess } = ctx;

    // ── Cek permission owner ────────────────────────────────────────────────
    if (!Ryuu) return replytolak(mess?.only?.owner || '❌ Fitur ini khusus Owner!');

    // ── Panduan jika argumen tidak lengkap ──────────────────────────────────
    // Format: .tambahsewa <id_grup|.> <durasi>
    //   id_grup boleh "." atau dikosongkan kalau dijalankan DI DALAM grup
    //   targetnya (artinya: grup ini sendiri).
    const parts = text ? text.trim().split(/\s+/).filter(Boolean) : [];

    if (parts.length === 0) {
      return replyalya(
        `╭━━━〔 📋 *PANDUAN TAMBAHSEWA* 〕━━━⬣\n` +
        `┃\n` +
        `┃ *Format:*\n` +
        `┃ ${prefix}${command} <id_grup|.> <durasi>\n` +
        `┃\n` +
        `┃ *Contoh (dari dalam grup target):*\n` +
        `┃ ${prefix}${command} . 7d\n` +
        `┃ ${prefix}${command} 30d   _(boleh tanpa id kalau di grup)_\n` +
        `┃\n` +
        `┃ *Contoh (sebut ID grup manual):*\n` +
        `┃ ${prefix}${command} 120363012345678901@g.us 30d\n` +
        `┃ ${prefix}${command} 120363012345678901@g.us PERMANENT\n` +
        `┃\n` +
        `┃ *Satuan Waktu:*\n` +
        `┃ s=detik  m=menit  h=jam\n` +
        `┃ d=hari   y=tahun  PERMANENT=selamanya\n` +
        `┃\n` +
        `┃ ⚠️ Grup HARUS sudah terdaftar sewa lebih dulu\n` +
        `┃    (pakai ${prefix}addsewa). Durasi akan DITAMBAHKAN\n` +
        `┃    ke sisa waktu yang masih berjalan, tidak menimpa.\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }

    // ── Tentukan target id grup & durasi ────────────────────────────────────
    // Dukung 2 bentuk:
    //   1 argumen  → durasi saja, target = grup saat ini (harus dijalankan di grup)
    //   2+ argumen → argumen pertama adalah id grup ATAU "." (grup saat ini)
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

    // ── Validasi durasi ──────────────────────────────────────────────────────
    if (waktu !== 'PERMANENT') {
      const durNum = parseInt(waktu);
      const unit = waktu[waktu.length - 1]?.toLowerCase();
      if (isNaN(durNum) || durNum <= 0 || !['s', 'm', 'h', 'd', 'y'].includes(unit)) {
        return replyalya(
          `❌ *Durasi tidak valid!* (\`${waktu}\`)\n\n` +
          `Contoh durasi yang benar:\n` +
          `• \`30d\` = 30 hari\n• \`1h\` = 1 jam\n• \`7d\` = 7 hari\n• \`1y\` = 1 tahun\n• \`PERMANENT\` = selamanya`
        );
      }
    }

    // ── Eksekusi penambahan durasi (pakai sumber data kanonik global.sewa) ──
    const sewa = global.sewa || [];
    const result = addDurationSewa(targetId, waktu, sewa, { allowCreate: false });

    if (!result.ok) {
      if (result.reason === 'NOT_FOUND') {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return replyalya(
          `❌ *Grup belum terdaftar sewa!*\n\n` +
          `🆔 ID: \`${targetId}\`\n\n` +
          `Daftarkan dulu lewat \`${prefix}addsewa <link_gc> <durasi>\`,\n` +
          `baru bisa ditambah durasinya lewat \`${prefix}${command}\`.`
        );
      }
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return replyalya(`❌ Gagal menambah durasi sewa: ${result.reason || 'unknown error'}`);
    }

    // ── Sinkron ulang global.sewa & file (defensif, addDurationSewa sudah
    //    menulis ke file, tapi kita pastikan global tetap konsisten) ────────
    global.sewa = sewa;

    const groupName = await getGcName(targetId);

    // ── Susun teks status before/after ──────────────────────────────────────
    const fmtExpired = (val) => {
      if (val === 'PERMANENT') return '♾️ PERMANENT';
      if (val === null) return '—';
      const sisa = val - Date.now();
      if (sisa <= 0) return '⚠️ SUDAH EXPIRED';
      return msToDate(sisa);
    };
    const fmtDate = (val) => {
      if (val === 'PERMANENT') return '♾️ Tidak ada batas';
      if (val === null) return '—';
      return new Date(val).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    };

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    if (result.noChange) {
      return replyalya(
        `ℹ️ *Sewa grup ini sudah PERMANENT*\n\n` +
        `🏷️ Nama : *${groupName}*\n` +
        `🆔 ID   : \`${targetId}\`\n\n` +
        `Tidak ada perubahan — durasi tidak berlaku untuk sewa PERMANENT.`
      );
    }

    return replyalya(
      `╭━━━〔 ✅ *DURASI SEWA DITAMBAH* 〕━━━⬣\n` +
      `┃\n` +
      `┃ 🏷️ Nama       : *${groupName}*\n` +
      `┃ 🆔 ID         : \`${targetId}\`\n` +
      `┃\n` +
      `┃ ➕ Ditambah   : *${waktu}*\n` +
      `┃\n` +
      `┃ ⏳ Sebelum    : ${fmtExpired(result.before)}\n` +
      `┃ ⏳ Sesudah    : *${fmtExpired(result.after)}*\n` +
      `┃ 🗓️ Tgl baru    : ${fmtDate(result.after)}\n` +
      `┃\n` +
      `┃ ✅ *Status sewa: AKTIF & DIPERPANJANG*\n` +
      `┃\n` +
      `┃ 💡 Cek sewa: \`${prefix}ceksewa\` (di grup)\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
    );
  },
};
