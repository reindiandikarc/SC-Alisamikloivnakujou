// ╔══════════════════════════════════════════════════════════════════╗
// ║              RATING PLUGIN — ALYA V13 (Enhanced)               ║
// ║  Commands: .rating, .cekrating                                 ║
// ║  Storage  : global.db.users (local JSON, no Supabase needed)   ║
// ╚══════════════════════════════════════════════════════════════════╝

'use strict';

const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

// Nomor owner untuk komplain
const OWNER_NUMBER = '6285602845943';
const OWNER_WA     = `wa.me/${OWNER_NUMBER}`;

// ─── Respons berdasarkan nilai rating ────────────────────────────────────────
function getRatingReply(nilai, pushname, prefix) {
  // ★ Rating 10 — sangat puas
  if (nilai === 10) {
    return (
      `✨ *TERIMA KASIH, ${pushname}!* ✨\n\n` +
      `Wah, rating *10 ⭐ penuh*?! Alya sampai salto senang dengarnya! 🌸\n\n` +
      `Kepercayaan dan dukunganmu adalah bahan bakar Alya untuk terus berkembang.\n` +
      `Alya berjanji akan selalu menjadi bot yang *lebih hebat*, *lebih cerdas*, dan *lebih berguna* untukmu!\n\n` +
      `💪 Sampai jumpa di fitur-fitur keren berikutnya~\n` +
      `_(Alya sayang kamu! ♡)_`
    );
  }

  // ★ Rating 7–9 — puas, tapi ada ruang untuk berkembang
  if (nilai >= 7) {
    return (
      `🌟 *TERIMA KASIH, ${pushname}!*\n\n` +
      `Rating *${nilai} ⭐* dari kamu sangat berarti bagi Alya! 😊\n\n` +
      `Alya sangat senang kamu menikmati fitur-fiturnya.\n` +
      `Alya juga *terbuka untuk saran & masukan* darimu lho!\n\n` +
      `💬 Kalau ada hal yang bisa ditingkatkan, jangan sungkan untuk\n` +
      `hubungi owner langsung ya:\n` +
      `📱 *${OWNER_WA}*\n\n` +
      `_Setiap masukan adalah langkah Alya menuju yang lebih baik~ 🌸_`
    );
  }

  // ★ Rating 3–6 — kurang puas, anjurkan lapor ke owner
  if (nilai >= 3) {
    return (
      `🤔 *Hmm, Alya ingin jadi lebih baik!*\n\n` +
      `Rating *${nilai} ⭐* dari ${pushname} sudah diterima.\n` +
      `Alya mengerti ada yang belum sesuai harapanmu 😔\n\n` +
      `Agar Alya bisa segera diperbaiki, yuk ceritakan *apa yang kurang* atau *masalah yang kamu temui* langsung ke owner:\n\n` +
      `📱 *WhatsApp Owner:*\n` +
      `👉 ${OWNER_WA}\n\n` +
      `Dengan laporanmu, Alya bisa tumbuh jadi lebih baik untukmu! 🌱`
    );
  }

  // ★ Rating 1–2 — sangat tidak puas, Alya sedih
  return (
    `💔 *Alya... sedih sekali mendengarnya...*\n\n` +
    `Rating *${nilai} ⭐* dari ${pushname}...\n` +
    `Alya benar-benar minta maaf atas pengalaman buruk yang kamu rasakan 😢\n\n` +
    `Alya ingin sekali mendengar ceritamu — apa yang membuat kamu kecewa?\n` +
    `Setiap keluhan adalah kesempatan Alya untuk berbenah.\n\n` +
    `🙏 *Tolong ceritakan pengalamanmu ke owner ya:*\n` +
    `📱 ${OWNER_WA}\n\n` +
    `Owner siap mendengar dan membantu! Alya tidak mau kehilanganmu~ 🌸`
  );
}

// ─── Simpan rating ke local db (global.db.users) ─────────────────────────────
function saveRating(sender, nilai) {
  if (!global.db.users[sender]) global.db.users[sender] = {};
  global.db.users[sender].rating = nilai;
  global.db.users[sender].ratingAt = Date.now();
}

function getStoredRating(sender) {
  return global.db.users?.[sender]?.rating ?? null;
}

// ─── Kirim interactive rating list ───────────────────────────────────────────
async function sendRatingList(alya, m, prefix) {
  // 10 bintang = 10 baris, tampilkan dalam 2 section biar lebih rapi
  const rows1 = Array.from({ length: 5 }, (_, i) => ({
    header: '',
    title: `${'⭐'.repeat(i + 1)}  (${i + 1}/10)`,
    description: i === 0 ? 'Sangat tidak puas'
                : i === 1 ? 'Tidak puas'
                : i === 2 ? 'Kurang memuaskan'
                : i === 3 ? 'Di bawah ekspektasi'
                : 'Cukup',
    id: `${prefix}rating ${i + 1}`
  }));

  const rows2 = Array.from({ length: 5 }, (_, i) => ({
    header: '',
    title: `${'⭐'.repeat(i + 6)}  (${i + 6}/10)`,
    description: i === 0 ? 'Lumayan bagus'
                : i === 1 ? 'Bagus'
                : i === 2 ? 'Sangat bagus'
                : i === 3 ? 'Hampir sempurna'
                : '🏆 SEMPURNA!',
    id: `${prefix}rating ${i + 6}`
  }));

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: {
          header: {
            title: '⭐ Rating Alya Bot',
            hasMediaAttachment: false
          },
          body: {
            text:
              `🌸 *Hei! Alya butuh pendapatmu~*\n\n` +
              `Seberapa puas kamu dengan performa Alya?\n` +
              `Berikan rating *1–10* (10 = Terbaik) ya!\n\n` +
              `Setiap pendapatmu sangat berharga untuk Alya berkembang! ✨`
          },
          footer: { text: '⭐ Alya Rating System' },
          nativeFlowMessage: {
            buttons: [{
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '⭐ Pilih Rating (1–10)',
                sections: [
                  { title: '😔 Rating 1 – 5 (Kurang Puas)', rows: rows1 },
                  { title: '😊 Rating 6 – 10 (Puas)', rows: rows2 }
                ]
              })
            }]
          }
        }
      }
    }
  }, { quoted: m });

  await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

// ═════════════════════════════════════════════════════════════════════════════
// PLUGIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════
module.exports = {
  command: ['rating', 'cekrating'],
  tags: ['general'],

  run: async (alya, m, ctx) => {
    const { command, text, prefix, pushname, replyalya } = ctx;

    // ── .cekrating — statistik global rating ────────────────────────────────
    if (command === 'cekrating') {
      const allUsers = global.db.users || {};
      const ratingEntries = Object.values(allUsers)
        .filter(u => u?.rating != null)
        .map(u => u.rating);

      if (ratingEntries.length === 0) {
        return replyalya('📊 Belum ada pengguna yang memberikan rating.\nKetik `.rating` untuk menjadi yang pertama! ⭐');
      }

      const total     = ratingEntries.length;
      const sum       = ratingEntries.reduce((a, b) => a + b, 0);
      const avg       = (sum / total).toFixed(1);
      const dist      = Array.from({ length: 10 }, (_, i) =>
        ratingEntries.filter(r => r === i + 1).length
      );
      const starBar   = '⭐'.repeat(Math.round(parseFloat(avg)));

      let distTeks = '';
      for (let i = 9; i >= 0; i--) {
        const bar = '█'.repeat(Math.min(dist[i], 15)) || '░';
        distTeks += `${i + 1}⭐ ${bar} (${dist[i]})\n`;
      }

      return replyalya(
        `📊 *STATISTIK RATING ALYA*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${starBar}\n` +
        `⭐ *Rata-rata:* ${avg} / 10\n` +
        `👥 *Total Voter:* ${total} pengguna\n\n` +
        `📈 *Distribusi Rating:*\n${distTeks}` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `_Terima kasih atas dukungan kalian! 🌸_`
      );
    }

    // ── .rating — proses nilai atau tampilkan list ────────────────────────
    const nilai = parseInt((text || '').trim());

    if (!isNaN(nilai)) {
      // User memilih rating
      if (nilai < 1 || nilai > 10) {
        return replyalya('❌ Rating hanya boleh antara 1 – 10 ⭐');
      }

      // Cek apakah sudah pernah rating
      const existing = getStoredRating(m.sender);
      if (existing !== null) {
        return replyalya(
          `❌ Kamu sudah memberikan rating *${existing} ⭐* sebelumnya.\n` +
          `Terima kasih sudah menilai Alya! 🌸\n\n` +
          `Lihat statistik: *${prefix}cekrating*`
        );
      }

      // Simpan rating
      saveRating(m.sender, nilai);

      // Kirim balasan sesuai bintang
      const replyText = getRatingReply(nilai, pushname, prefix);
      const emoji = nilai >= 8 ? '✨' : nilai >= 5 ? '🌸' : nilai >= 3 ? '🤔' : '💔';

      await alya.sendMessage(m.chat, { react: { text: emoji, key: m.key } });

      // Kirim balasan sebagai interactiveMessage dengan tombol cek statistik
      const replyMsg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              header: {
                title: `Rating ${nilai} ⭐`,
                hasMediaAttachment: false
              },
              body: { text: replyText },
              footer: { text: '⭐ Alya Rating System' },
              nativeFlowMessage: {
                buttons: [{
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📊 Lihat Statistik Rating',
                    id: `${prefix}cekrating`
                  })
                }]
              }
            }
          }
        }
      }, { quoted: m });

      return alya.relayMessage(replyMsg.key.remoteJid, replyMsg.message, { messageId: replyMsg.key.id });
    }

    // Tidak ada angka → tampilkan list pilihan rating
    await alya.sendMessage(m.chat, { react: { text: '⭐', key: m.key } });
    await sendRatingList(alya, m, prefix);
  }
};
