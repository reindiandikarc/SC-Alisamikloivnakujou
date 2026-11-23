// ╔══════════════════════════════════════════════════════════════╗
// ║        CANCELORDER + LISTORDER - Alya V13                   ║
// ║           by reindiandikarc                                  ║
// ╚══════════════════════════════════════════════════════════════╝
// Commands: cancelorder, listorder, cekorder

'use strict';

const path   = require('path');
const fs     = require('fs');
const moment = require('moment-timezone');

const ORDERS_FILE = path.join(__dirname, '../../database/orders.json');
const ADMIN_FILE  = path.join(__dirname, '../../database/adminstore.json');

function readJSON(file, def = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function tglShort(ms) {
  return moment(ms).tz('Asia/Jakarta').format('DD/MM/YY HH:mm');
}
function isAdminOfOrder(senderJid, order, adminStore) {
  const adminJid = adminStore[order.groupJid];
  if (!adminJid) return false;
  return senderJid.split('@')[0] === adminJid.split('@')[0];
}

const STATUS_EMOJI = {
  PENDING_PAYMENT: '⏳',
  WAITING_CONFIRM: '🕐',
  DONE:            '✅',
  REJECTED:        '❌',
  CANCELLED:       '🚫',
};

module.exports = [
  // ──────────────────────────────────────────────────────────────
  // .cancelorder <ID>  — user atau adminstore bisa cancel
  // ──────────────────────────────────────────────────────────────
  {
    command: ['cancelorder'],
    tags: ['store'],
    run: async (alya, m, ctx) => {
      const {
        sender, from, text, q, prefix,
        Ryuu, isGroupAdmins,
        reply, replyalya,
      } = ctx;

      const orderId = (text || q || '').trim().toUpperCase();
      if (!orderId) return reply(`Penggunaan: *${prefix}cancelorder <ID_PESANAN>*`);

      const orders     = readJSON(ORDERS_FILE);
      const adminStore = readJSON(ADMIN_FILE);
      const order      = orders[orderId];

      if (!order) return reply(`❌ Pesanan *${orderId}* tidak ditemukan.`);

      // Hanya: user pemilik order, adminstore, admin grup, atau owner bot
      const isMine    = order.senderJid === sender ||
                        order.senderJid.split('@')[0] === sender.split('@')[0];
      const isAdmin   = Ryuu || isGroupAdmins || isAdminOfOrder(sender, order, adminStore);

      if (!isMine && !isAdmin) {
        return reply('⛔ Kamu tidak punya akses untuk cancel pesanan ini!');
      }
      if (['DONE', 'CANCELLED'].includes(order.status)) {
        return reply(`Pesanan *${orderId}* sudah berstatus *${order.status}*, tidak bisa dicancel.`);
      }

      orders[orderId].status      = 'CANCELLED';
      orders[orderId].cancelledAt = Date.now();
      orders[orderId].cancelledBy = sender;
      writeJSON(ORDERS_FILE, orders);

      await replyalya(
        `🚫 *Pesanan Dibatalkan*\n\n` +
        `🆔 *ID   :* \`${orderId}\`\n` +
        `🛒 *Item :* ${order.item}\n` +
        `👤 *Oleh :* ${sender.split('@')[0]}`
      );
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .cekorder <ID>  — cek status satu pesanan
  // ──────────────────────────────────────────────────────────────
  {
    command: ['cekorder'],
    tags: ['store'],
    run: async (alya, m, ctx) => {
      const { text, q, prefix, reply, replyalya } = ctx;

      const orderId = (text || q || '').trim().toUpperCase();
      if (!orderId) return reply(`Penggunaan: *${prefix}cekorder <ID_PESANAN>*`);

      const orders = readJSON(ORDERS_FILE);
      const o      = orders[orderId];

      if (!o) return reply(`❌ Pesanan *${orderId}* tidak ditemukan.`);

      const em = STATUS_EMOJI[o.status] || '❓';
      await replyalya(
        `🔍 *STATUS PESANAN*\n\n` +
        `🆔 *ID      :* \`${o.orderId}\`\n` +
        `${em} *Status  :* ${o.status}\n` +
        `🛒 *Item    :* ${o.item}\n` +
        `👤 *Pembeli :* ${o.senderName} (${o.senderNum})\n` +
        `📅 *Dibuat  :* ${tglShort(o.createdAt)}\n` +
        (o.accAt     ? `📸 *ACC     :* ${tglShort(o.accAt)}\n`     : '') +
        (o.doneAt    ? `✅ *Selesai :* ${tglShort(o.doneAt)}\n`    : '') +
        (o.rejectedAt? `❌ *Ditolak :* ${tglShort(o.rejectedAt)}\n`: '') +
        (o.cancelledAt? `🚫 *Cancel  :* ${tglShort(o.cancelledAt)}\n`: '')
      );
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .listorder  — owner/adminstore lihat semua pesanan
  // ──────────────────────────────────────────────────────────────
  {
    command: ['listorder'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        sender, from, isGroup,
        Ryuu, isGroupAdmins,
        reply, replyalya, replytolak,
        text,
      } = ctx;

      const adminStore = readJSON(ADMIN_FILE);
      const isMyAdmin  = isAdminOfOrder(sender, { groupJid: from }, adminStore);

      if (!Ryuu && !isGroupAdmins && !isMyAdmin) {
        return replytolak('Hanya owner bot atau adminstore yang bisa melihat list order!');
      }

      const orders  = readJSON(ORDERS_FILE);
      // Filter: jika admin biasa (bukan owner), hanya tampilkan pesanan dari grup ybs
      const filter  = (text || '').trim().toLowerCase(); // bisa filter: 'pending', 'done', dll
      let list = Object.values(orders);

      if (!Ryuu) {
        list = list.filter(o => o.groupJid === from);
      }
      if (filter) {
        list = list.filter(o => o.status.toLowerCase().includes(filter));
      }

      if (list.length === 0) {
        return reply(`📭 Tidak ada pesanan${filter ? ` dengan status "${filter}"` : ''}.`);
      }

      // Sort: terbaru di atas
      list.sort((a, b) => b.createdAt - a.createdAt);

      let teks  = `*📋 DAFTAR PESANAN*`;
      if (filter) teks += ` (filter: ${filter.toUpperCase()})`;
      teks += `\nTotal: ${list.length}\n\n`;

      for (const o of list.slice(0, 20)) { // max 20 baris
        const em = STATUS_EMOJI[o.status] || '❓';
        teks +=
          `${em} *${o.orderId}*\n` +
          `   👤 ${o.senderName}  🛒 ${o.item.slice(0, 30)}${o.item.length > 30 ? '…' : ''}\n` +
          `   📅 ${tglShort(o.createdAt)}\n\n`;
      }
      if (list.length > 20) teks += `_... dan ${list.length - 20} pesanan lainnya_\n`;

      await reply(teks.trim());
    }
  },
];
