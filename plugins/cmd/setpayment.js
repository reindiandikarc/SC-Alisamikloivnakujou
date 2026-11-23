// ╔══════════════════════════════════════════════════════════════╗
// ║        SETPAYMENT - Set Gambar Pembayaran Per Grup          ║
// ║           by reindiandikarc                                  ║
// ╚══════════════════════════════════════════════════════════════╝
// Commands: setpayment, cekpayment, delpayment
// Admin grup/owner set gambar + caption pembayaran untuk grup ini
// Gambar ini akan muncul otomatis saat user .buylist

'use strict';

const path   = require('path');
const fs     = require('fs');

const PAYMENT_FILE  = path.join(__dirname, '../../database/paymentstore.json');
const PAYMENT_IMG   = path.join(__dirname, '../../database/payment_images');

function readJSON(file, def = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = [
  // ──────────────────────────────────────────────────────────────
  // .setpayment [caption opsional]
  // Reply gambar QR/transfer + .setpayment [info rekening]
  // ──────────────────────────────────────────────────────────────
  {
    command: ['setpayment'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        sender, from, text, q, prefix,
        isGroup, Ryuu, isGroupAdmins,
        isImage, mime, quoted,
        groupName,
        reply, replyalya, replytolak,
      } = ctx;

      if (!isGroup) return replytolak('Command ini hanya bisa dipakai di dalam grup!');
      if (!Ryuu && !isGroupAdmins) return replytolak('Hanya admin grup atau owner yang bisa set payment!');

      // Cek apakah ada gambar (langsung atau quoted)
      const isDirectImage = isImage || /image/.test(mime || '');
      const isQuotedImg   = quoted && /image/.test(quoted.mtype || '');

      if (!isDirectImage && !isQuotedImg) {
        // Tampilkan cara pakai
        const payments = readJSON(PAYMENT_FILE);
        const existing = payments[from];
        return reply(
          `*💳 CARA SET PAYMENT*\n\n` +
          `Kirim foto QR/barcode/info rekening dengan caption:\n` +
          `*${prefix}setpayment <info rekening opsional>*\n\n` +
          `Contoh:\n` +
          `*${prefix}setpayment DANA: 08123456789 a/n Toko Alya*\n\n` +
          (existing
            ? `ℹ️ Grup ini sudah punya payment info.\nGunakan *${prefix}cekpayment* untuk melihat.`
            : `ℹ️ Grup ini belum punya payment info.`)
        );
      }

      // Download gambar
      let imgBuffer;
      try {
        const msgToDownload = isDirectImage ? m : quoted;
        imgBuffer = await alya.downloadMediaMessage(msgToDownload);
      } catch (err) {
        return reply('❌ Gagal mengunduh gambar. Coba lagi!');
      }

      // Simpan gambar ke disk
      if (!fs.existsSync(PAYMENT_IMG)) fs.mkdirSync(PAYMENT_IMG, { recursive: true });
      const imgPath = path.join(PAYMENT_IMG, `${from.replace(/[^a-z0-9]/gi, '_')}.jpg`);
      fs.writeFileSync(imgPath, imgBuffer);

      // Simpan ke JSON
      const caption   = (text || q || '').trim() || '';
      const payments  = readJSON(PAYMENT_FILE);
      payments[from]  = {
        imageUrl: imgPath,
        caption:  caption || null,
        setBy:    sender,
        setAt:    Date.now(),
      };
      writeJSON(PAYMENT_FILE, payments);

      await replyalya(
        `✅ *Payment info berhasil disimpan!*\n\n` +
        `🏠 *Grup    :* ${groupName}\n` +
        `💬 *Caption :* ${caption || '_(kosong)_'}\n\n` +
        `_Gambar ini akan otomatis muncul saat user melakukan .buylist di grup ini._`
      );
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .cekpayment
  // Lihat payment info grup ini
  // ──────────────────────────────────────────────────────────────
  {
    command: ['cekpayment'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        from, isGroup, groupName,
        reply, replyalya, replytolak,
      } = ctx;

      if (!isGroup) return replytolak('Command ini hanya bisa dipakai di dalam grup!');

      const payments = readJSON(PAYMENT_FILE);
      const info     = payments[from];

      if (!info) {
        return replyalya(
          `ℹ️ Grup *${groupName}* belum punya payment info.\n\n` +
          `Admin bisa set dengan: *.setpayment*`
        );
      }

      const caption =
        `💳 *Payment Info Grup Ini*\n\n` +
        `🏠 *Grup    :* ${groupName}\n` +
        `💬 *Caption :* ${info.caption || '_(kosong)_'}\n` +
        `📅 *Di-set  :* ${new Date(info.setAt).toLocaleDateString('id-ID')}\n`;

      try {
        if (info.imageUrl && fs.existsSync(info.imageUrl)) {
          await alya.sendMessage(from, {
            image:   fs.readFileSync(info.imageUrl),
            caption: caption,
          }, { quoted: m });
        } else if (info.imageUrl?.startsWith('http')) {
          await alya.sendMessage(from, {
            image:   { url: info.imageUrl },
            caption: caption,
          }, { quoted: m });
        } else {
          await replyalya(caption + '\n⚠️ _File gambar tidak ditemukan di server._');
        }
      } catch (err) {
        await replyalya(caption);
      }
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .delpayment
  // Hapus payment info grup ini
  // ──────────────────────────────────────────────────────────────
  {
    command: ['delpayment'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        from, isGroup, Ryuu, isGroupAdmins, groupName,
        reply, replyalya, replytolak,
      } = ctx;

      if (!isGroup) return replytolak('Command ini hanya bisa dipakai di dalam grup!');
      if (!Ryuu && !isGroupAdmins) return replytolak('Hanya admin grup atau owner!');

      const payments = readJSON(PAYMENT_FILE);
      if (!payments[from]) return reply(`Grup *${groupName}* belum punya payment info.`);

      // Hapus file gambar jika ada
      const info = payments[from];
      if (info.imageUrl && !info.imageUrl.startsWith('http')) {
        try { if (fs.existsSync(info.imageUrl)) fs.unlinkSync(info.imageUrl); } catch (_) {}
      }

      delete payments[from];
      writeJSON(PAYMENT_FILE, payments);

      await replyalya(`🗑️ Payment info grup *${groupName}* berhasil dihapus.`);
    }
  },
];
