// Plugin: delete / del
// Commands: del, delete, hapus
// Logic:
//   - Hapus pesan yang di-reply:
//     * Admin/Owner → bisa hapus pesan siapa saja (yang di-reply)
//     * Bukan admin  → hanya bisa hapus pesan diri sendiri (yang di-reply)
//   - Setelah hapus pesan target, pesan .del dari pengirim juga dihapus otomatis
//   - Bot harus admin di grup untuk bisa delete

'use strict';

module.exports = {
  command: ['del', 'delete', 'hapus'],
  tags   : ['general'],
  run    : async (alya, m, ctx) => {
    const {
      prefix, command,
      isGroup, isAdmins, Ryuu, isBotAdmins,
      quoted, replyalya, replytolak,
    } = ctx;

    // ── Harus reply ke sebuah pesan ──
    if (!quoted) {
      return replyalya(
        `╭─「 🗑️ *DELETE PESAN* 」\n│\n` +
        `│ *Cara pakai:*\n` +
        `│ Reply pesan yang ingin dihapus,\n` +
        `│ lalu kirim *${prefix}${command}*\n│\n` +
        `│ *Aturan:*\n` +
        `│ • Admin/Owner → hapus pesan siapapun\n` +
        `│ • Member biasa → hanya pesan sendiri\n` +
        `╰──────────────────`
      );
    }

    // ── Identifikasi ──
    const senderJid    = m.sender;                                           // yang nulis .del
    const botJid       = alya.user?.id?.replace(/:.*@/, '@') || alya.user?.id;
    const quotedSender = quoted.sender
      || quoted.key?.participant
      || quoted.key?.remoteJid;                                              // pemilik pesan yang di-reply

    const isOwnMessage   = quotedSender === senderJid               // sender nge-reply pesan sendiri
                        || quoted.key?.fromMe === true              // pesan dari bot sendiri
                        || quoted.fromMe === true;
    const isQuotedBot    = quotedSender === botJid
                        || m.quoted?.fromMe === true
                        || quoted.key?.fromMe === true;
    const isAdminOrOwner = isAdmins || Ryuu;

    // Helper: hapus pesan .del dari sender (cleanup)
    const deleteCommandMsg = async () => {
      try { await alya.sendMessage(m.chat, { delete: m.key }); } catch {}
    };

    // Helper: perlu bot admin di grup?
    const needBotAdmin = isGroup && !isBotAdmins;

    // ── Kasus 1: Pesan milik bot → siapapun boleh minta hapus ──
    if (isQuotedBot) {
      if (needBotAdmin) {
        return replyalya(
          `❌ *Bot harus menjadi admin* untuk bisa menghapus pesan di grup!\n\n` +
          `_Promote bot jadi admin dulu_`
        );
      }
      try {
        await alya.sendMessage(m.chat, { delete: quoted.key });
        await deleteCommandMsg();
      } catch (e) {
        console.error('[delete] Gagal hapus pesan bot:', e.message);
        replyalya('❌ Gagal menghapus pesan bot. Mungkin sudah terlalu lama.');
      }
      return;
    }

    // ── Kasus 2: Pesan milik pengirim sendiri → boleh ──
    if (isOwnMessage) {
      if (needBotAdmin) {
        return replyalya(
          `❌ *Bot harus menjadi admin* untuk bisa menghapus pesan di grup!\n\n` +
          `_Promote bot jadi admin dulu_`
        );
      }
      try {
        await alya.sendMessage(m.chat, { delete: quoted.key });
        await deleteCommandMsg();
      } catch (e) {
        console.error('[delete] Gagal hapus pesan sendiri:', e.message);
        replyalya(
          `❌ Gagal menghapus pesan!\n\n` +
          `Kemungkinan:\n` +
          `• Pesan sudah terlalu lama (>2 hari)\n` +
          `• Bot bukan admin grup\n\n` +
          `_Error: ${e.message}_`
        );
      }
      return;
    }

    // ── Kasus 3: Pesan milik orang lain → hanya admin/owner ──
    if (!isAdminOrOwner) {
      return replytolak(
        `❌ Kamu hanya bisa menghapus *pesan sendiri*!\n\n` +
        `_Hanya Admin atau Owner yang bisa hapus pesan orang lain._`
      );
    }

    // ── Admin/Owner hapus pesan orang lain ──
    if (needBotAdmin) {
      return replyalya(
        `❌ *Bot harus menjadi admin* untuk bisa menghapus pesan orang lain di grup!\n\n` +
        `_Promote bot jadi admin dulu_`
      );
    }

    try {
      await alya.sendMessage(m.chat, { delete: quoted.key });
      await deleteCommandMsg();
    } catch (e) {
      console.error('[delete] Gagal hapus pesan orang lain:', e.message);
      replyalya(
        `❌ Gagal menghapus pesan!\n\n` +
        `Kemungkinan penyebab:\n` +
        `• Pesan sudah terlalu lama (>2 hari)\n` +
        `• Bot bukan admin grup\n` +
        `• Pesan sudah dihapus\n\n` +
        `_Error: ${e.message}_`
      );
    }
  },
};
