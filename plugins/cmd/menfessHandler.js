// Plugin: menfessHandler
// Commands: sendmenfess, terimamenfess, tolakmenfess, balasmenfess, stopmenfess
// Alya V13 — Sistem Menfess Profesional & Kreatif
'use strict';

// ═══════════════════════════════════════════════════════════════
// STORAGE MENFESS (In-memory, reset saat bot restart)
// ═══════════════════════════════════════════════════════════════
if (!global._menfessDB) {
  global._menfessDB = {
    pending: {},   // { id: { sender, target, pesan, timestamp, id } }
    active: {},    // { id: { sender, target, timestamp, id } }  ← sesi chat aktif
    cooldown: {}   // { jid: timestamp }
  };
}
const DB = global._menfessDB;

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function genId() {
  return 'MF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function formatJid(nomor) {
  let n = nomor.replace(/[^0-9]/g, '');
  if (!n.startsWith('62') && n.startsWith('0')) n = '62' + n.slice(1);
  if (!n.startsWith('62')) n = '62' + n;
  return n + '@s.whatsapp.net';
}

function findActiveSessionBySender(jid) {
  return Object.values(DB.active).find(s => s.sender === jid || s.target === jid) || null;
}

function findPendingByTarget(jid) {
  return Object.values(DB.pending).filter(p => p.target === jid);
}

function findPendingById(id) {
  return DB.pending[id] || null;
}

const COOL = 60_000; // 60 detik cooldown send menfess
const BANNER = `╭━━━「 💌 *MENFESS BOT* 」━━━╮`;
const FOOTER = `╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleSendMenfess(alya, m, ctx) {
  const { text, prefix, reply, replyalya, senderNumber } = ctx;
  const sender = m.sender;

  if (!text || !text.includes('|')) {
    return replyalya(
      `${BANNER}\n┃\n` +
      `┃ 💌 *KIRIM MENFESS ANONIM*\n┃\n` +
      `┃ 📌 *Format:*\n` +
      `┃ *${prefix}sendmenfess <pesan>|<nomor target>*\n┃\n` +
      `┃ 📌 *Contoh:*\n` +
      `┃ ${prefix}sendmenfess Aku suka kamu|628xxxxxxxxx\n┃\n` +
      `┃ ⚠️ *Catatan:*\n` +
      `┃ • Identitasmu dijaga RAHASIA 🔒\n` +
      `┃ • Target bisa terima/tolak menfessmu\n` +
      `┃ • Jika diterima, kalian bisa chat anon\n` +
      `${FOOTER}`
    );
  }

  // Cooldown check
  const now = Date.now();
  if (DB.cooldown[sender] && now < DB.cooldown[sender]) {
    const sisa = Math.ceil((DB.cooldown[sender] - now) / 1000);
    return replyalya(`⏳ *Sabar dulu!*\n\nKamu bisa kirim menfess lagi dalam *${sisa} detik*.`);
  }

  // Cek sudah ada sesi aktif
  if (findActiveSessionBySender(sender)) {
    return replyalya(`⚠️ *Kamu sedang dalam sesi menfess aktif!*\n\nKetik *${prefix}stopmenfess* dulu untuk mengakhiri sesi.`);
  }

  const parts = text.split('|');
  const pesan = parts.slice(0, -1).join('|').trim();
  const nomorRaw = parts[parts.length - 1].trim();

  if (!pesan) return replyalya(`❌ Pesan tidak boleh kosong!`);
  if (!nomorRaw || !/^\d+$/.test(nomorRaw.replace(/[+\s-]/g, ''))) {
    return replyalya(`❌ *Nomor target tidak valid!*\n\nContoh: 628123456789`);
  }

  const targetJid = formatJid(nomorRaw);

  // Jangan kirim ke diri sendiri
  if (targetJid === sender) return replyalya(`❌ Kamu tidak bisa kirim menfess ke diri sendiri!`);

  // Cek pending sudah ada ke target ini dari sender ini
  const existingPending = Object.values(DB.pending).find(p => p.sender === sender && p.target === targetJid);
  if (existingPending) {
    return replyalya(`⏳ *Menfessmu sebelumnya masih menunggu balasan!*\n\nID: \`${existingPending.id}\`\nTunggu target merespons dulu.`);
  }

  const mfId = genId();
  DB.pending[mfId] = {
    id: mfId,
    sender,
    target: targetJid,
    pesan,
    timestamp: now
  };

  DB.cooldown[sender] = now + COOL;

  // Notif ke sender
  await replyalya(
    `${BANNER}\n┃\n` +
    `┃ ✅ *MENFESS BERHASIL DIKIRIM!*\n┃\n` +
    `┃ 📬 Menfessmu sudah dikirim ke target.\n` +
    `┃ 🔒 Identitasmu tetap rahasia.\n` +
    `┃ 🆔 ID Menfess: \`${mfId}\`\n┃\n` +
    `┃ ⏳ Menunggu respons dari target...\n` +
    `┃ _Jika diterima, kamu bisa chat langsung!_ 💫\n` +
    `${FOOTER}`
  );

  // Kirim ke target
  await alya.sendMessage(targetJid, {
    text:
      `${BANNER}\n┃\n` +
      `┃ 💌 *KAMU MENDAPAT MENFESS!*\n┃\n` +
      `┃ 📝 *Pesan:*\n` +
      `┃ _"${pesan}"_\n┃\n` +
      `┃ 🕐 Diterima: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n┃\n` +
      `┃ 📌 *Apa yang ingin kamu lakukan?*\n` +
      `┃ • Ketik *${prefix}terimamenfess ${mfId}* → Terima & chat\n` +
      `┃ • Ketik *${prefix}tolakmenfess ${mfId}* → Tolak menfess\n┃\n` +
      `┃ ⚠️ Identitas pengirim akan terungkap\n` +
      `┃    hanya jika kamu *menerima* menfess ini.\n` +
      `${FOOTER}`
  });
}

async function handleTerimaMenfess(alya, m, ctx) {
  const { text, prefix, reply, replyalya } = ctx;
  const sender = m.sender;
  const mfId = (text || '').trim().toUpperCase();

  if (!mfId) {
    return replyalya(
      `📌 *Format:* *${prefix}terimamenfess <ID>*\n\n` +
      `ID menfess ada di pesan yang kamu terima.\n` +
      `Contoh: \`${prefix}terimamenfess MF123ABC\``
    );
  }

  const mf = findPendingById(mfId);
  if (!mf) {
    return replyalya(`❌ *Menfess tidak ditemukan!*\n\nID \`${mfId}\` tidak ada atau sudah kadaluarsa.`);
  }
  if (mf.target !== sender) {
    return replyalya(`⛔ Menfess ini bukan untukmu!`);
  }

  // Cek sudah ada sesi aktif
  if (findActiveSessionBySender(sender)) {
    return replyalya(`⚠️ Kamu sedang dalam sesi menfess lain! Ketik *${prefix}stopmenfess* dulu.`);
  }

  // Buat sesi aktif
  const sessionId = genId();
  DB.active[sessionId] = {
    id: sessionId,
    sender: mf.sender,
    target: sender,
    timestamp: Date.now()
  };

  // Hapus dari pending
  delete DB.pending[mfId];

  // Notif ke target (yang menerima)
  await replyalya(
    `${BANNER}\n┃\n` +
    `┃ 💚 *MENFESS DITERIMA!*\n┃\n` +
    `┃ 🎉 Selamat! Kamu menerima menfess ini.\n` +
    `┃ 💬 Sekarang kamu bisa chat anonim!\n┃\n` +
    `┃ 📌 *Cara menggunakan:*\n` +
    `┃ • Kirim pesan biasa → diteruskan ke pengirim\n` +
    `┃ • Ketik *${prefix}balasmenfess <pesan>* → balas formal\n` +
    `┃ • Ketik *${prefix}stopmenfess* → akhiri sesi\n┃\n` +
    `┃ ⚠️ Identitas kalian berdua tetap ANONIM\n` +
    `┃ 🔒 selama sesi berlangsung.\n` +
    `${FOOTER}`
  );

  // Notif ke pengirim
  await alya.sendMessage(mf.sender, {
    text:
      `${BANNER}\n┃\n` +
      `┃ 💚 *MENFESSMU DITERIMA!* 🎊\n┃\n` +
      `┃ 🎉 Hore! Orang itu menerima menfessmu!\n` +
      `┃ 💬 Sekarang kalian bisa chat anonim!\n┃\n` +
      `┃ 📌 *Cara menggunakan:*\n` +
      `┃ • Kirim pesan biasa → diteruskan ke target\n` +
      `┃ • Ketik *${prefix}balasmenfess <pesan>* → balas formal\n` +
      `┃ • Ketik *${prefix}stopmenfess* → akhiri sesi\n┃\n` +
      `┃ ⚠️ Identitas kalian berdua tetap ANONIM\n` +
      `┃ 🔒 selama sesi berlangsung.\n` +
      `${FOOTER}`
  });
}

async function handleTolakMenfess(alya, m, ctx) {
  const { text, prefix, reply, replyalya } = ctx;
  const sender = m.sender;
  const mfId = (text || '').trim().toUpperCase();

  if (!mfId) {
    return replyalya(`📌 *Format:* *${prefix}tolakmenfess <ID>*\n\nContoh: \`${prefix}tolakmenfess MF123ABC\``);
  }

  const mf = findPendingById(mfId);
  if (!mf) {
    return replyalya(`❌ *Menfess tidak ditemukan!*\n\nID \`${mfId}\` tidak ada atau sudah kadaluarsa.`);
  }
  if (mf.target !== sender) {
    return replyalya(`⛔ Menfess ini bukan untukmu!`);
  }

  delete DB.pending[mfId];

  // Notif ke target (yang menolak)
  await replyalya(
    `${BANNER}\n┃\n` +
    `┃ 🚫 *MENFESS DITOLAK*\n┃\n` +
    `┃ Kamu telah menolak menfess dengan\n` +
    `┃ ID \`${mfId}\`.\n┃\n` +
    `┃ Pengirim akan mendapat notifikasi\n` +
    `┃ bahwa menfessnya ditolak. 💔\n` +
    `${FOOTER}`
  );

  // Notif ke pengirim
  await alya.sendMessage(mf.sender, {
    text:
      `${BANNER}\n┃\n` +
      `┃ 💔 *MENFESSMU DITOLAK*\n┃\n` +
      `┃ Maaf, orang itu menolak menfessmu.\n┃\n` +
      `┃ 💡 *Tips:*\n` +
      `┃ • Jangan menyerah! Coba lagi lain kali\n` +
      `┃ • Pastikan pesanmu tulus & sopan\n` +
      `┃ • Tetap semangat! 💪\n┃\n` +
      `┃ _"Penolakan bukan akhir, tapi awal\n` +
      `┃ dari sesuatu yang lebih baik."_ ✨\n` +
      `${FOOTER}`
  });
}

async function handleBalasMenfess(alya, m, ctx) {
  const { text, prefix, reply, replyalya } = ctx;
  const sender = m.sender;

  if (!text) {
    return replyalya(
      `📌 *Format:* *${prefix}balasmenfess <pesan>*\n\n` +
      `Kirim pesan formal ke pasangan menfessmu.\n` +
      `Identitas tetap anonim! 🔒`
    );
  }

  const sesi = findActiveSessionBySender(sender);
  if (!sesi) {
    return replyalya(
      `❌ *Kamu tidak sedang dalam sesi menfess!*\n\n` +
      `Belum ada menfess yang aktif. Gunakan:\n` +
      `• *${prefix}sendmenfess* → Kirim menfess baru\n` +
      `• *${prefix}terimamenfess <ID>* → Terima menfess`
    );
  }

  const other = sesi.sender === sender ? sesi.target : sesi.sender;
  const role = sesi.sender === sender ? '💌 *Pengirim Menfess*' : '💚 *Penerima Menfess*';

  // Kirim pesan ke pihak lain dengan formatting cantik
  await alya.sendMessage(other, {
    text:
      `╭━「 💬 *PESAN MENFESS* 」━╮\n` +
      `┃\n` +
      `┃ 👤 ${role}\n` +
      `┃\n` +
      `┃ 💬 *Pesan:*\n` +
      `┃ _"${text}"_\n` +
      `┃\n` +
      `┃ 🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
      `┃\n` +
      `┃ 📌 Balas: *${prefix}balasmenfess <pesan>*\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯`
  });

  await replyalya(`✅ *Pesanmu berhasil dikirim!*\n🔒 Identitasmu tetap anonim.`);
}

async function handleStopMenfess(alya, m, ctx) {
  const { prefix, replyalya } = ctx;
  const sender = m.sender;

  // Cek di pending (yang belum dijawab)
  const myPending = Object.values(DB.pending).filter(p => p.sender === sender || p.target === sender);
  const sesi = findActiveSessionBySender(sender);

  if (!sesi && myPending.length === 0) {
    return replyalya(`❌ Kamu tidak sedang dalam sesi atau menunggu menfess apapun.`);
  }

  // Hapus sesi aktif
  if (sesi) {
    const other = sesi.sender === sender ? sesi.target : sesi.sender;
    delete DB.active[sesi.id];

    await replyalya(
      `${BANNER}\n┃\n` +
      `┃ 🔚 *SESI MENFESS DIAKHIRI*\n┃\n` +
      `┃ Sesi chat anonim kamu telah berakhir.\n` +
      `┃ Semoga percakapannya berkesan! 💫\n` +
      `${FOOTER}`
    );

    await alya.sendMessage(other, {
      text:
        `${BANNER}\n┃\n` +
        `┃ 🔚 *SESI MENFESS DIAKHIRI*\n┃\n` +
        `┃ Pasanganmu telah mengakhiri sesi.\n` +
        `┃ Chat anonim telah selesai. 👋\n┃\n` +
        `┃ _Terima kasih sudah menggunakan\n` +
        `┃ fitur menfess!_ 💌\n` +
        `${FOOTER}`
    });
  }

  // Batalkan pending menfess dari sender ini
  let canceledCount = 0;
  for (const [id, p] of Object.entries(DB.pending)) {
    if (p.sender === sender) {
      delete DB.pending[id];
      canceledCount++;
    }
  }

  if (canceledCount > 0 && !sesi) {
    await replyalya(`✅ *${canceledCount} menfess pending kamu berhasil dibatalkan.*`);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT — multi-command handler
// ═══════════════════════════════════════════════════════════════
module.exports = [
  {
    command: ['sendmenfess'],
    tags: ['menfess'],
    run: handleSendMenfess
  },
  {
    command: ['terimamenfess'],
    tags: ['menfess'],
    run: handleTerimaMenfess
  },
  {
    command: ['tolakmenfess'],
    tags: ['menfess'],
    run: handleTolakMenfess
  },
  {
    command: ['balasmenfess'],
    tags: ['menfess'],
    run: handleBalasMenfess
  },
  {
    command: ['stopmenfess'],
    tags: ['menfess'],
    run: handleStopMenfess
  }
];
