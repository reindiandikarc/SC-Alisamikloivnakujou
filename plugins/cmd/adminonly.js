// Plugin: adminonly
// Commands: adminonly
// Alya V13 — Toggle mode grup WhatsApp native: hanya admin yang bisa KIRIM CHAT di grup
// (Ini mengunci chat WA itu sendiri via groupSettingUpdate 'announcement'.
//  Untuk membatasi pemakaian BOT/command saja ke admin, gunakan .onlyadmin)
// Fixed: status dibaca dari groupMetadata.announce (sumber asli WA), bukan
//        cache in-memory yang hilang saat bot restart.
'use strict';

module.exports = {
  command: ['adminonly'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix,
      reply, replyalya, replytolak,
      isGroup, isAdmins, isBotAdmins, Ryuu,
      groupMetadata, groupName
    } = ctx;

    // ── Guard: harus di grup
    if (!isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di dalam grup!');

    // ── Guard: hanya admin / owner bot
    if (!isAdmins && !Ryuu) {
      return replyalya(
        '🚫 *Akses Ditolak!*\n\n' +
        'Hanya *Admin Grup* atau *Owner Bot* yang bisa menggunakan perintah ini.\n\n' +
        '_Ty nikto... (Kamu bukan siapa-siapa...)_'
      );
    }

    // ── Guard: bot harus admin
    if (!isBotAdmins) {
      return replyalya(
        '⚠️ *Bot Bukan Admin!*\n\n' +
        'Jadikan bot sebagai admin grup terlebih dahulu agar bisa mengunci / membuka grup.'
      );
    }

    const arg = (args[0] || '').toLowerCase();
    // ✅ FIX: baca status asli dari metadata WA (akurat & tidak hilang saat restart)
    const isCurrentlyLocked = groupMetadata?.announce === true;

    // ── Tampilkan status jika tanpa argumen
    if (!arg) {
      const status = isCurrentlyLocked ? '🔒 *TERKUNCI* (Hanya Admin)' : '🔓 *TERBUKA* (Semua Member)';
      return replyalya(
        `╭─「 👑 *ADMIN ONLY* 」\n` +
        `│\n` +
        `│ 📌 *Grup   :* ${groupName}\n` +
        `│ 📊 *Status :* ${status}\n` +
        `│\n` +
        `│ ℹ️ Fitur ini mengunci CHAT WhatsApp\n` +
        `│    grup (native), bukan command bot.\n` +
        `│    Pakai *${prefix}onlyadmin* kalau mau\n` +
        `│    batasi pemakaian BOT ke admin saja.\n` +
        `│\n` +
        `│ 📝 *Cara Pakai:*\n` +
        `│ • ${prefix}${command} on  → Kunci grup\n` +
        `│ • ${prefix}${command} off → Buka grup\n` +
        `╰──────────────────`
      );
    }

    if (arg === 'on') {
      if (isCurrentlyLocked) {
        return replyalya(
          '🔒 Grup sudah dalam mode *Admin Only*!\n\n' +
          `_Gunakan *${prefix}${command} off* untuk membukanya._`
        );
      }

      try {
        await alya.groupSettingUpdate(m.chat, 'announcement');

        await alya.sendMessage(m.chat, { react: { text: '🔒', key: m.key } });

        return replyalya(
          `╭─「 🔒 *GRUP DIKUNCI* 」\n` +
          `│\n` +
          `│ 📌 *Grup   :* ${groupName}\n` +
          `│ 👑 *Mode   :* Admin Only\n` +
          `│ ⚡ *Oleh   :* @${m.sender.split('@')[0]}\n` +
          `│\n` +
          `│ ℹ️ Sekarang hanya *Admin Grup*\n` +
          `│    yang bisa mengirim pesan.\n` +
          `╰──────────────────`
        );
      } catch (e) {
        console.error('[adminonly ON] Error:', e.message);
        return replyalya(`❌ Gagal mengunci grup!\n\n🔍 Error: ${e.message}`);
      }

    } else if (arg === 'off') {
      if (!isCurrentlyLocked) {
        return replyalya(
          '🔓 Grup sudah dalam mode *Terbuka* (semua member bisa kirim pesan)!\n\n' +
          `_Gunakan *${prefix}${command} on* untuk menguncinya._`
        );
      }

      try {
        await alya.groupSettingUpdate(m.chat, 'not_announcement');

        await alya.sendMessage(m.chat, { react: { text: '🔓', key: m.key } });

        return replyalya(
          `╭─「 🔓 *GRUP DIBUKA* 」\n` +
          `│\n` +
          `│ 📌 *Grup   :* ${groupName}\n` +
          `│ 👥 *Mode   :* Semua Member\n` +
          `│ ⚡ *Oleh   :* @${m.sender.split('@')[0]}\n` +
          `│\n` +
          `│ ℹ️ Sekarang semua member\n` +
          `│    bisa mengirim pesan.\n` +
          `╰──────────────────`
        );
      } catch (e) {
        console.error('[adminonly OFF] Error:', e.message);
        return replyalya(`❌ Gagal membuka grup!\n\n🔍 Error: ${e.message}`);
      }

    } else {
      return replyalya(
        `⚠️ *Argumen tidak valid!*\n\n` +
        `📝 Gunakan:\n` +
        `• *${prefix}${command} on*  → Kunci grup (admin only)\n` +
        `• *${prefix}${command} off* → Buka grup (semua member)\n` +
        `• *${prefix}${command}*     → Cek status`
      );
    }
  }
};
