// Plugin: delidup
// Auto-generated from Alya V12
// Commands: delgrup, delidup

const path = require('path')

module.exports = {
  command: ["delgrup", "delidup"],
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
      waifuList, husbuList, pler, setting, user
    } = ctx

        // Hapus grup dari idgrup.json
        if (!Ryuu) return replytolak('❌ Hanya owner yang bisa menggunakan perintah ini.')

        const targetGrup = text?.trim() || m.chat

        if (!pler.includes(targetGrup)) {
            return replyalya(
    `⚠️ Grup tidak ditemukan di database!

    🆔 *ID:* ${targetGrup}

    Gunakan *.listgrup* untuk melihat daftar grup terdaftar.`)
        }

        const idxGrup = pler.indexOf(targetGrup)
        pler.splice(idxGrup, 1)
        saveIdgrup()

        replyalya(
    `╔══════════════════════════╗
    ║  🗑️ *GRUP BERHASIL DIHAPUS!*  ║
    ╚══════════════════════════╝

    Grup telah dihapus dari database bot.
    Premium member tidak lagi bisa menggunakan *.upswgc* di grup ini.

    🆔 *ID Dihapus:* ${targetGrup}
    📊 *Sisa Grup Terdaftar:* ${pler.length} grup`)
  }
}
