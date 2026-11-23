// ╔══════════════════════════════════════════════════════════════╗
// ║           ACC - Kirim Bukti Transfer                        ║
// ║           by reindiandikarc                                  ║
// ╚══════════════════════════════════════════════════════════════╝
// Commands: acc
// User kirim gambar + .acc → bot simpan, forward ke adminstore, konfirmasi user

'use strict';

const path   = require('path');
const fs     = require('fs');
const moment = require('moment-timezone');

const ORDERS_FILE  = path.join(__dirname, '../../database/orders.json');
const ADMIN_FILE   = path.join(__dirname, '../../database/adminstore.json');
const BUKTI_DIR    = path.join(__dirname, '../../database/bukti_transfer');

function readJSON(file, def = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function tglIndo(ms = Date.now()) {
  return moment(ms).tz('Asia/Jakarta').locale('id').format('dddd, DD MMMM YYYY HH:mm:ss [WIB]');
}

module.exports = {
  command: ['acc'],
  tags: ['store'],
  run: async (alya, m, ctx) => {
    const {
      sender, from, pushname,
      isGroup, isImage, isMedia, mime,
      quoted,
      reply, replyalya, replytolak,
    } = ctx;

    if (!isGroup) return replytolak('Command ini hanya bisa digunakan di dalam grup!');

    // ── Cari pesanan PENDING milik user ini di grup ini ────────
    const orders = readJSON(ORDERS_FILE);
    const order  = Object.values(orders).find(
      o => {
        const oNum = o.senderJid.split('@')[0]
        const sNum = sender.split('@')[0]
        return oNum === sNum && o.groupJid === from && o.status === 'PENDING_PAYMENT'
      }
    );

    if (!order) {
      return reply(
        `❌ Tidak ada pesanan aktif untuk kamu di grup ini.\n\n` +
        `Buat pesanan dulu dengan: *.buylist <isi pesanan>*`
      );
    }

    // ── Harus kirim gambar (sebagai media langsung atau reply gambar) ──
    const isDirectImage  = isImage || /image/.test(mime || '');
    const isQuotedImg    = quoted && /image/.test(quoted.mtype || '');

    if (!isDirectImage && !isQuotedImg) {
      return reply(
        `📸 Kirim *foto bukti transfer* bersamaan dengan command *.acc*\n\n` +
        `Cara: kirim foto lalu di caption tulis *.acc*\n` +
        `Atau: reply foto dengan *.acc*\n\n` +
        `🆔 ID Pesanan kamu: *${order.orderId}*`
      );
    }

    // ── Download gambar ────────────────────────────────────────
    let imgBuffer;
    try {
      const msgToDownload = isDirectImage ? m : quoted;
      imgBuffer = await alya.downloadMediaMessage(msgToDownload);
    } catch (err) {
      console.error('[acc] download error:', err.message);
      return reply('❌ Gagal mengunduh gambar. Coba lagi ya!');
    }

    // ── Simpan gambar ke disk ──────────────────────────────────
    if (!fs.existsSync(BUKTI_DIR)) fs.mkdirSync(BUKTI_DIR, { recursive: true });
    const imgPath = path.join(BUKTI_DIR, `${order.orderId}.jpg`);
    fs.writeFileSync(imgPath, imgBuffer);

    // ── Update status order ────────────────────────────────────
    orders[order.orderId].status    = 'WAITING_CONFIRM';
    orders[order.orderId].accAt     = Date.now();
    orders[order.orderId].buktiPath = imgPath;
    writeJSON(ORDERS_FILE, orders);

    const updated = orders[order.orderId];

    // ── Reply ke user: tunggu konfirmasi ──────────────────────
    await alya.sendMessage(from, {
      text:
        `✅ *Bukti transfer diterima!*\n\n` +
        `🆔 *ID Pesanan :* \`${updated.orderId}\`\n` +
        `🛒 *Item       :* ${updated.item}\n` +
        `📅 *ACC pada   :* ${tglIndo(updated.accAt)}\n\n` +
        `⏳ Pesanan kamu sedang dalam *proses konfirmasi* oleh admin store.\n` +
        `Harap tunggu ya~ Kamu akan mendapat notifikasi di grup ini saat pesanan disetujui.\n\n` +
        `_Jangan tutup/keluar dari grup ya!_`,
    }, { quoted: m });

    // ── Kirim notifikasi + bukti ke adminstore ─────────────────
    const adminStore = readJSON(ADMIN_FILE);
    const adminJid   = adminStore[from]; // format: "628xxx@s.whatsapp.net"

    if (!adminJid) {
      // Tidak ada admin store untuk grup ini → kirim ke owner sebagai fallback
      const ownerList = readJSON(path.join(__dirname, '../../database/owner.json'), []);
      const fallbackJid = Array.isArray(ownerList) && ownerList.length > 0
        ? (ownerList[0].includes('@') ? ownerList[0] : ownerList[0] + '@s.whatsapp.net')
        : null;

      if (fallbackJid) {
        await _sendAdminNotif(alya, fallbackJid, updated, imgBuffer, from);
      }
      return;
    }

    await _sendAdminNotif(alya, adminJid, updated, imgBuffer, from);
  }
};

// ── Helper: kirim notif ke adminstore ─────────────────────────
async function _sendAdminNotif(alya, adminJid, order, imgBuffer, groupJid) {
  try {
    let groupName = '-';
    try {
      const meta  = await alya.groupMetadata(groupJid);
      groupName   = meta.subject || groupJid;
    } catch (_) {}

    const teks =
      `🔔 *PESANAN MASUK - BUTUH KONFIRMASI*\n\n` +
      `🆔 *ID Pesanan :* \`${order.orderId}\`\n` +
      `👤 *Pembeli    :* ${order.senderName}\n` +
      `📞 *Nomor      :* ${order.senderNum}\n` +
      `🛒 *Item       :* ${order.item}\n` +
      `🏠 *Dari Grup  :* ${groupName}\n` +
      `📅 *ACC pada   :* ${moment(order.accAt).tz('Asia/Jakarta').locale('id').format('DD/MM/YYYY HH:mm')} WIB\n\n` +
      `📸 *Bukti transfer terlampir di atas.*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ Ketik *.doneorder ${order.orderId}*\n` +
      `   → untuk SETUJUI & kirim invoice ke pembeli\n\n` +
      `❌ Ketik *.rejectorder ${order.orderId}*\n` +
      `   → untuk TOLAK pesanan ini`;

    await alya.sendMessage(adminJid, {
      image:   imgBuffer,
      caption: teks,
    });
  } catch (err) {
    console.error('[acc] adminstore notify error:', err.message);
  }
}
