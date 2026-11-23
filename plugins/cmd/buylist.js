// ╔══════════════════════════════════════════════════════════════╗
// ║               BUYLIST SYSTEM - Alya V13                     ║
// ║           by reindiandikarc                                  ║
// ╚══════════════════════════════════════════════════════════════╝
// Commands: buylist
// Flow:
//   1. User .buylist <isi> → bot reply info pesanan + instruksi transfer + gambar payment
//   2. User kirim gambar + .acc  → bot simpan bukti, notif user & kirim ke adminstore
//   3. Adminstore .doneorder <ID> → bot kirim invoice selesai ke grup asal

'use strict';

const path   = require('path');
const fs     = require('fs');
const moment = require('moment-timezone');

// ── Path Database ──────────────────────────────────────────────
const ORDERS_FILE  = path.join(__dirname, '../../database/orders.json');
const PAYMENT_FILE = path.join(__dirname, '../../database/paymentstore.json');
const ADMIN_FILE   = path.join(__dirname, '../../database/adminstore.json');

// ── Helper: baca/tulis JSON ────────────────────────────────────
function readJSON(file, def = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── Generate Order ID ─────────────────────────────────────────
function genOrderID() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ORD-${ts}-${rnd}`;
}

// ── Format tanggal Indonesia ───────────────────────────────────
function tglIndo(ms = Date.now()) {
  return moment(ms).tz('Asia/Jakarta').locale('id').format('dddd, DD MMMM YYYY HH:mm:ss [WIB]');
}

module.exports = {
  command: ['buylist'],
  tags: ['store'],
  run: async (alya, m, ctx) => {
    const {
      sender, from, pushname, text, q, prefix,
      isGroup, Ryuu,
      reply, replyalya, replytolak,
      mess
    } = ctx;

    // ── Wajib di grup ──────────────────────────────────────────
    if (!isGroup) return replytolak('Command ini hanya bisa digunakan di dalam grup!');

    // ── Wajib ada isi pesanan ──────────────────────────────────
    const isi = (text || '').trim();
    if (!isi) {
      return reply(
        `*📦 CARA PESAN*\n\n` +
        `Ketik: *${prefix}buylist <isi pesanan>*\n` +
        `Contoh: *${prefix}buylist 1x Premium 30 hari*\n\n` +
        `_Setelah itu kamu akan mendapat instruksi pembayaran._`
      );
    }

    // ── Baca data ──────────────────────────────────────────────
    const orders     = readJSON(ORDERS_FILE);
    const payments   = readJSON(PAYMENT_FILE);
    const adminStore = readJSON(ADMIN_FILE);

    // ── Ambil gambar payment untuk grup ini ───────────────────
    const payInfo = payments[from] || null;

    // ── Cek apakah user punya pesanan PENDING (belum .acc) ────
    const existing = Object.values(orders).find(o => {
      const oNum = o.senderJid.split('@')[0]
      const sNum = sender.split('@')[0]
      return oNum === sNum && o.groupJid === from && o.status === 'PENDING_PAYMENT'
    });
    if (existing) {
      return reply(
        `⚠️ Kamu sudah punya pesanan aktif!\n\n` +
        `🆔 ID: *${existing.orderId}*\n` +
        `📝 Item: ${existing.item}\n\n` +
        `Kirim bukti transfer gambar + *.acc* untuk konfirmasi,\n` +
        `atau minta admin hapus dulu dengan *.cancelorder ${existing.orderId}*`
      );
    }

    // ── Buat order baru ────────────────────────────────────────
    const orderId  = genOrderID();
    const orderObj = {
      orderId,
      senderJid:   sender.split('@')[0] + '@s.whatsapp.net',  // selalu simpan dalam format @s.whatsapp.net
      senderName:  pushname || sender.split('@')[0],
      senderNum:   sender.split('@')[0],
      groupJid:    from,
      item:        isi,
      status:      'PENDING_PAYMENT',   // PENDING_PAYMENT → WAITING_CONFIRM → DONE
      createdAt:   Date.now(),
      accAt:       null,
      doneAt:      null,
      buktiUrl:    null,
    };

    orders[orderId] = orderObj;
    writeJSON(ORDERS_FILE, orders);

    // ── Teks instruksi ─────────────────────────────────────────
    const instruksi =
      `╔═══════════════════════╗\n` +
      `║    📦 KONFIRMASI PESANAN    ║\n` +
      `╚═══════════════════════╝\n\n` +
      `👤 *Nama   :* ${pushname || '-'}\n` +
      `📞 *Nomor  :* ${sender.split('@')[0]}\n` +
      `🆔 *ID Pesanan :* \`${orderId}\`\n` +
      `🛒 *Item   :* ${isi}\n` +
      `📅 *Waktu  :* ${tglIndo()}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 *CARA PEMBAYARAN*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      (payInfo?.caption
        ? payInfo.caption + '\n\n'
        : `_Info pembayaran belum diset admin. Hubungi admin grup._\n\n`) +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📸 *LANGKAH SELANJUTNYA:*\n` +
      `Setelah transfer, kirim *foto bukti transfer* dengan caption:\n` +
      `➤ \`.acc\`\n\n` +
      `⚠️ Simpan ID Pesanan kamu: *${orderId}*`;

    // ── Kirim pesan: dengan gambar jika ada, teks saja jika tidak ──
    try {
      if (payInfo?.imageUrl) {
        // Kirim gambar payment + instruksi
        const isLocalFile = payInfo.imageUrl.startsWith('./') || payInfo.imageUrl.startsWith('/');
        let imageSource;
        if (isLocalFile && fs.existsSync(payInfo.imageUrl)) {
          imageSource = { image: fs.readFileSync(payInfo.imageUrl) };
        } else {
          imageSource = { image: { url: payInfo.imageUrl } };
        }
        await alya.sendMessage(from, {
          ...imageSource,
          caption: instruksi,
        }, { quoted: m });
      } else {
        await replyalya(instruksi);
      }
    } catch (err) {
      console.error('[buylist] send error:', err.message);
      await replyalya(instruksi);
    }
  }
};
