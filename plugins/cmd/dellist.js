// Plugin: dellist
// Commands: dellist
// Deskripsi: Hapus item dari list respons per-grup
// Penggunaan: .dellist key

const path = require('path')

module.exports = {
  command: ['dellist'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user,
      db_respon_list, delResponList, isAlreadyResponList
    } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur Khusus Group!')
    if (!isAdmins) return replytolak('❌ Fitur Khusus Admin!')

    if (!text || !q) {
      return reply(
        `╔═══ 🗑️ *DELLIST* ═══╗\n` +
        `┃\n` +
        `┣ Cara pakai:\n` +
        `┣ *${prefix}dellist key*\n` +
        `┃\n` +
        `┣ Contoh:\n` +
        `┗ *${prefix}dellist tes*\n\n` +
        `💡 Lihat semua key yang ada: *${prefix}liststore*`
      )
    }

    if (db_respon_list.length === 0) {
      return reply(`📭 Belum ada list message di database.`)
    }

    const key = q.trim().toLowerCase()

    // Cek apakah key ada di grup INI (bukan grup lain)
    if (!isAlreadyResponList(m.chat, key, db_respon_list)) {
      return reply(
        `❌ Key *${key}* tidak ditemukan di grup ini!\n\n` +
        `Lihat daftar key yang ada: *${prefix}liststore*`
      )
    }

    try {
      delResponList(m.chat, key, db_respon_list)
      reply(
        `✅ *Berhasil hapus list!*\n\n` +
        `🗑️ Key *${key}* sudah dihapus dari grup ini.\n\n` +
        `_Sisa item: ${prefix}liststore_`
      )
    } catch (e) {
      console.error('[dellist] Error:', e)
      reply(`❌ Gagal menghapus list! Coba lagi.`)
    }
  }
}
