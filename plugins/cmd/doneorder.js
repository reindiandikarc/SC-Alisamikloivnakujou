// ╔══════════════════════════════════════════════════════════════╗
// ║         DONEORDER + REJECTORDER - Admin Store               ║
// ║           by reindiandikarc                                  ║
// ╚══════════════════════════════════════════════════════════════╝
// Commands: doneorder, rejectorder
// Admin DM bot: .doneorder <ID> → invoice ke grup pembeli
//               .rejectorder <ID> → notif ditolak ke pembeli

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

// ── Cek apakah sender adalah adminstore untuk grup terkait order ──
function isAdminOfOrder(senderJid, order, adminStore) {
  const adminJid = adminStore[order.groupJid];
  if (!adminJid) return false;
  // Bandingkan angka saja (toleransi format @lid vs @s.whatsapp.net)
  const sNum = senderJid.split('@')[0];
  const aNum = adminJid.split('@')[0];
  return sNum === aNum;
}

module.exports = [
  // ─────────────────────────────────────────────────────────────
  // .doneorder <ID>
  // ─────────────────────────────────────────────────────────────
  {
    command: ['doneorder'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        sender, from, pushname, text, q, prefix,
        Ryuu, isGroup,
        reply, replyalya,
      } = ctx;

      // ── Boleh dipakai dari DM maupun grup admin ────────────
      const orderId = (text || q || '').trim().toUpperCase();
      if (!orderId) {
        return reply(`Penggunaan: *${prefix}doneorder <ID_PESANAN>*\nContoh: *${prefix}doneorder ORD-ABC123-XY*`);
      }

      const orders     = readJSON(ORDERS_FILE);
      const adminStore = readJSON(ADMIN_FILE);
      const order      = orders[orderId];

      if (!order) return reply(`❌ Pesanan dengan ID *${orderId}* tidak ditemukan.`);

      // ── Validasi: hanya adminstore yang berhak atau owner ──
      if (!Ryuu && !isAdminOfOrder(sender, order, adminStore)) {
        return reply('⛔ Kamu bukan adminstore untuk pesanan ini!');
      }

      if (order.status === 'DONE') return reply(`✅ Pesanan *${orderId}* sudah selesai sebelumnya.`);
      if (order.status === 'REJECTED') return reply(`❌ Pesanan *${orderId}* sudah ditolak sebelumnya.`);
      if (order.status === 'PENDING_PAYMENT') {
        return reply(`⚠️ Pembeli belum upload bukti transfer untuk pesanan *${orderId}*`);
      }

      // ── Update status ─────────────────────────────────────
      const now = Date.now();
      orders[orderId].status = 'DONE';
      orders[orderId].doneAt = now;
      orders[orderId].confirmedBy = sender;
      writeJSON(ORDERS_FILE, orders);
      const o = orders[orderId];

      // ── Konfirmasi ke adminstore ────────────────────────────
      await alya.sendMessage(from, {
        text: `✅ Pesanan *${orderId}* berhasil dikonfirmasi!\nInvoice telah dikirim ke grup.`,
      }, { quoted: m });

      // ── Kirim INVOICE ke grup asal ─────────────────────────
      let groupName = '-';
      try {
        const meta = await alya.groupMetadata(o.groupJid);
        groupName  = meta.subject || o.groupJid;
      } catch (_) {}

      const invoice =
        `╔══════════════════════════╗\n` +
        `║   🧾  INVOICE PESANAN   ║\n` +
        `╚══════════════════════════╝\n\n` +
        `✅ *STATUS: PESANAN SELESAI*\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *ID Pesanan  :* \`${o.orderId}\`\n` +
        `🛒 *Item        :* ${o.item}\n` +
        `👤 *Nama        :* ${o.senderName}\n` +
        `📞 *Nomor       :* ${o.senderNum}\n` +
        `🏠 *Grup        :* ${groupName}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 *Pesanan dibuat  :* ${tglIndo(o.createdAt)}\n` +
        `📸 *Bukti dikirim   :* ${o.accAt ? tglIndo(o.accAt) : '-'}\n` +
        `✅ *Dikonfirmasi    :* ${tglIndo(now)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🎉 Terima kasih atas pembelian kamu @${o.senderNum}!\n` +
        `_Pesanan akan segera diproses. Terima kasih sudah berbelanja!_ 🛍️`;

      // Coba sertakan bukti transfer di invoice
      const imgPath = o.buktiPath || path.join(BUKTI_DIR, `${orderId}.jpg`);
      try {
        if (fs.existsSync(imgPath)) {
          await alya.sendMessage(o.groupJid, {
            image:   fs.readFileSync(imgPath),
            caption: invoice,
            mentions: [o.senderJid],
          });
        } else {
          await alya.sendMessage(o.groupJid, {
            text:     invoice,
            mentions: [o.senderJid],
          });
        }
      } catch (err) {
        console.error('[doneorder] kirim invoice error:', err.message);
        await alya.sendMessage(o.groupJid, {
          text:     invoice,
          mentions: [o.senderJid],
        });
      }
    }
  },

  // ─────────────────────────────────────────────────────────────
  // .rejectorder <ID>
  // ─────────────────────────────────────────────────────────────
  {
    command: ['rejectorder'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        sender, from, text, q, prefix,
        Ryuu,
        reply,
      } = ctx;

      const orderId = (text || q || '').trim().toUpperCase();
      if (!orderId) {
        return reply(`Penggunaan: *${prefix}rejectorder <ID_PESANAN>*`);
      }

      const orders     = readJSON(ORDERS_FILE);
      const adminStore = readJSON(ADMIN_FILE);
      const order      = orders[orderId];

      if (!order) return reply(`❌ Pesanan *${orderId}* tidak ditemukan.`);
      if (!Ryuu && !isAdminOfOrder(sender, order, adminStore)) {
        return reply('⛔ Kamu bukan adminstore untuk pesanan ini!');
      }
      if (['DONE', 'REJECTED'].includes(order.status)) {
        return reply(`Pesanan ini sudah berstatus *${order.status}*`);
      }

      orders[orderId].status     = 'REJECTED';
      orders[orderId].rejectedAt = Date.now();
      orders[orderId].rejectedBy = sender;
      writeJSON(ORDERS_FILE, orders);
      const o = orders[orderId];

      await alya.sendMessage(from, {
        text: `❌ Pesanan *${orderId}* berhasil ditolak.\nNotifikasi dikirim ke pembeli.`,
      }, { quoted: m });

      // Notif ke grup pembeli
      await alya.sendMessage(o.groupJid, {
        text:
          `❌ *PESANAN DITOLAK*\n\n` +
          `🆔 *ID    :* \`${o.orderId}\`\n` +
          `🛒 *Item  :* ${o.item}\n` +
          `👤 *Buyer :* @${o.senderNum}\n\n` +
          `Maaf, bukti transfer kamu tidak valid / tidak sesuai.\n` +
          `Silakan hubungi admin store untuk info lebih lanjut.`,
        mentions: [o.senderJid],
      });
    }
  },
];
