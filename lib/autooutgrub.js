/**
 * lib/autooutgrub.js
 * Handler untuk auto-keluar dari grup yang belum terdaftar sewa.
 *
 * Dipanggil dari group-participants.update di index.js.
 * Cek: jika bot ditambahkan ke grup (action === 'add' && participant === botJid)
 *       dan grup TIDAK ada di global.sewa → kirim warning → groupLeave
 */

'use strict';

const fs = require('fs');

const DB_PATH = './database/autooutgrub.json';

function isAutoOutGrubAktif() {
  // Prioritas: global flag (set saat runtime)
  if (typeof global.autooutgrub !== 'undefined') return global.autooutgrub === true;
  // Fallback: baca dari file (saat restart)
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      return data.aktif === true;
    }
  } catch {}
  return false;
}

function isGrupTerdaftarSewa(groupJid) {
  const sewa = global.sewa;
  if (!Array.isArray(sewa) || sewa.length === 0) return false;
  const now = Date.now();
  return sewa.some(x => {
    if (x.id !== groupJid) return false;
    if (x.expired === 'PERMANENT') return true;
    // Anggap terdaftar jika belum expired (termasuk status pending)
    return typeof x.expired === 'number' && x.expired > now;
  });
}

/**
 * Dipanggil dari group-participants.update
 * @param {object} alya  - baileys socket
 * @param {object} anu   - event object { id, participants, action }
 */
async function handleAutoOutGrub(alya, anu) {
  try {
    // Hanya proses jika fitur aktif
    if (!isAutoOutGrubAktif()) return;

    // Hanya proses event 'add' (ada member baru ditambahkan)
    if (anu.action !== 'add') return;

    // Ambil JID bot
    const botJid = alya.decodeJid(alya.user.id);

    // Cek apakah bot yang ditambahkan (bukan member lain)
    const botDitambahkan = anu.participants.some(p => {
      const pJid = typeof p === 'string' ? p : (p.jid || p.id || '');
      return alya.decodeJid(pJid) === botJid;
    });

    if (!botDitambahkan) return;

    const groupJid = anu.id;

    // Cek apakah grup sudah terdaftar sewa
    if (isGrupTerdaftarSewa(groupJid)) {
      console.log(`[AutoOutGrub] Grup ${groupJid} TERDAFTAR sewa. Bot tetap di grup.`);
      return;
    }

    // ── Grup belum sewa → kirim peringatan lalu keluar ──
    console.log(`[AutoOutGrub] Grup ${groupJid} TIDAK terdaftar sewa. Mengirim peringatan...`);

    // Ambil info grup untuk pesan yang lebih informatif
    let groupName = groupJid;
    try {
      const meta = await alya.groupMetadata(groupJid);
      groupName = meta.subject || groupJid;
    } catch {}

    const pesanPeringatan =
      `⚠️ *PERHATIAN — BOT BELUM DISEWA!* ⚠️\n\n` +
      `Halo! Bot ini tidak bisa digunakan secara gratis.\n\n` +
      `🚫 *Grup ini belum terdaftar dalam sistem sewa bot.*\n\n` +
      `Bot akan otomatis keluar dari grup ini dalam beberapa detik.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 *Cara menyewa bot:*\n` +
      `Hubungi owner bot untuk mendaftarkan grup ini.\n\n` +
      `👑 *Contact Owner:*\n` +
      `wa.me/${global.ownernomer || global.owner?.[0] || 'owner'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `_Jangan coba-coba menambahkan bot ke grup tanpa izin & tanpa sewa!_\n` +
      `_Bot akan selalu keluar otomatis dari grup yang tidak terdaftar._ 🤖`;

    // Kirim pesan peringatan
    try {
      await alya.sendMessage(groupJid, { text: pesanPeringatan });
    } catch (sendErr) {
      console.warn(`[AutoOutGrub] Gagal kirim pesan peringatan ke ${groupJid}:`, sendErr.message);
    }

    // Delay 3 detik sebelum keluar (agar pesan sempat terkirim & dibaca)
    await new Promise(r => setTimeout(r, 3000));

    // Keluar dari grup
    try {
      await alya.groupLeave(groupJid);
      console.log(`[AutoOutGrub] Bot berhasil keluar dari grup: ${groupName} (${groupJid})`);
    } catch (leaveErr) {
      console.warn(`[AutoOutGrub] Gagal keluar dari grup ${groupJid}:`, leaveErr.message);
    }

  } catch (e) {
    console.error('[AutoOutGrub] Error:', e.message);
  }
}

module.exports = { handleAutoOutGrub, isAutoOutGrubAktif, isGrupTerdaftarSewa };
