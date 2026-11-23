// Plugin: mute / unmute
// Commands: mute, unmute, mutelist
// Fungsi: Admin/owner bisa mute member grup — semua pesan dari member yang
//         di-mute akan otomatis dihapus bot selama mute aktif.
// Penyimpanan: ./database/mute_users.json
//   Format: { "groupJid": ["userJid1", "userJid2", ...] }

'use strict';

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join('./database', 'mute_users.json');

// ─── Load / save DB ──────────────────────────────────────────────────────────
function loadMuteDB() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {}
  return {};
}

function saveMuteDB(data) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); } catch {}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isMutedUser(groupJid, userJid) {
  const db = loadMuteDB();
  return Array.isArray(db[groupJid]) && db[groupJid].includes(userJid);
}

function muteUser(groupJid, userJid) {
  const db = loadMuteDB();
  if (!Array.isArray(db[groupJid])) db[groupJid] = [];
  if (!db[groupJid].includes(userJid)) db[groupJid].push(userJid);
  saveMuteDB(db);
}

function unmuteUser(groupJid, userJid) {
  const db = loadMuteDB();
  if (!Array.isArray(db[groupJid])) return false;
  const before = db[groupJid].length;
  db[groupJid] = db[groupJid].filter(j => j !== userJid);
  if (db[groupJid].length === 0) delete db[groupJid];
  saveMuteDB(db);
  return db[groupJid]?.length !== before || before > 0;
}

function getMutedList(groupJid) {
  const db = loadMuteDB();
  return Array.isArray(db[groupJid]) ? db[groupJid] : [];
}

// Expose ke global agar alya.js bisa akses tanpa require ulang
global._muteDB = { isMutedUser, muteUser, unmuteUser, getMutedList };

// ─── PLUGIN EXPORT ───────────────────────────────────────────────────────────
module.exports = {
  command: ['mute', 'unmute', 'mutelist'],
  tags   : ['group'],
  run    : async (alya, m, ctx) => {
    const {
      command, prefix, args,
      isGroup, isAdmins, isAdminOrOwner, isBotAdmins,
      Ryuu, groupAdmins,
      quoted, replyalya, replytolak,
    } = ctx;

    // ── Guard: hanya di grup ──
    if (!isGroup) return replyalya('❌ Fitur ini hanya bisa digunakan di dalam grup!');

    // ── .mutelist — tampilkan daftar member yang di-mute ──
    if (command === 'mutelist') {
      const list = getMutedList(m.chat);
      if (!list.length) return replyalya('✅ Tidak ada member yang sedang di-mute di grup ini.');

      const items = list.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`).join('\n');
      return alya.sendMessage(m.chat, {
        text    : `🔇 *DAFTAR MEMBER MUTE*\n\n${items}\n\n_Total: ${list.length} member_`,
        mentions: list,
      }, { quoted: m });
    }

    // ── Guard: hanya admin/owner untuk mute & unmute ──
    if (!isAdmins && !Ryuu) {
      return replytolak('❌ Hanya *admin* atau *owner* yang bisa menggunakan perintah ini!');
    }

    // ── Tentukan target ──────────────────────────────────────────────────────
    // Prioritas: reply ke pesan member > mention > argumen nomor
    let targetJid = null;

    if (m.quoted && m.quoted.sender) {
      // Reply ke pesan member
      targetJid = m.quoted.sender;
    } else if (ctx.mentions && ctx.mentions.length > 0) {
      targetJid = ctx.mentions[0];
    } else if (args[0]) {
      // Nomor langsung, misal: .mute 628xxx
      const num = args[0].replace(/[^0-9]/g, '');
      if (num) targetJid = num + '@s.whatsapp.net';
    }

    if (!targetJid) {
      return replyalya(
        `📋 *Cara pakai:*\n\n` +
        `• *${prefix}mute* — reply pesan member\n` +
        `• *${prefix}mute @tag* — mention member\n` +
        `• *${prefix}unmute* — reply/mention untuk buka mute\n` +
        `• *${prefix}mutelist* — lihat daftar mute\n\n` +
        `_Semua pesan member yang di-mute akan dihapus bot secara otomatis._`
      );
    }

    const targetNum = targetJid.split('@')[0];

    // Jangan mute bot sendiri atau owner
    if (targetJid === alya.user?.id?.replace(/:.*$/, '') + '@s.whatsapp.net') {
      return replyalya('❌ Tidak bisa mute bot sendiri!');
    }
    if (global.owner?.includes(targetNum)) {
      return replyalya('❌ Tidak bisa mute owner bot!');
    }
    // Admin tidak bisa mute admin lain (kecuali Ryuu/owner)
    if (!Ryuu && groupAdmins && groupAdmins.includes(targetJid)) {
      return replyalya('❌ Tidak bisa mute sesama admin!');
    }

    // ── .mute ────────────────────────────────────────────────────────────────
    if (command === 'mute') {
      if (isMutedUser(m.chat, targetJid)) {
        return replyalya(`🔇 @${targetNum} sudah dalam keadaan di-mute.`, { mentions: [targetJid] });
      }

      muteUser(m.chat, targetJid);

      return alya.sendMessage(m.chat, {
        text    : `🔇 *MEMBER DIMUTE*\n\n@${targetNum} tidak bisa mengirim pesan.\n_Semua pesannya akan otomatis dihapus._\n\nGunakan *${prefix}unmute* untuk membuka mute.`,
        mentions: [targetJid],
      }, { quoted: m });
    }

    // ── .unmute ──────────────────────────────────────────────────────────────
    if (command === 'unmute') {
      if (!isMutedUser(m.chat, targetJid)) {
        return replyalya(`✅ @${targetNum} tidak sedang di-mute.`, { mentions: [targetJid] });
      }

      unmuteUser(m.chat, targetJid);

      return alya.sendMessage(m.chat, {
        text    : `🔔 *MUTE DIBUKA*\n\n@${targetNum} sekarang bisa mengirim pesan lagi.`,
        mentions: [targetJid],
      }, { quoted: m });
    }
  },
};
