// Plugin: addidup
// Auto-generated from Alya V12
// Commands: addgrup, addidup

const path = require('path')

module.exports = {
  command: ["addgrup", "addidup"],
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

        // Daftarkan grup ke idgrup.json agar premium bisa pakai .upswgc di sini
        if (!Ryuu) return replytolak('❌ Hanya owner yang bisa menggunakan perintah ini.')
        if (!m.isGroup) return replyalya('❌ Perintah ini hanya bisa digunakan di dalam grup.')

        const targetGrup = text?.trim() || m.chat

        if (pler.includes(targetGrup)) {
            return replyalya(
    `⚠️ Grup ini sudah terdaftar di database!

    🆔 *ID:* ${targetGrup}
    📊 Total terdaftar: ${pler.length} grup`)
        }

        pler.push(targetGrup)
        saveIdgrup()

        replyalya(
    `╔══════════════════════════╗
    ║  ✅ *GRUP BERHASIL DIDAFTARKAN!*  ║
    ╚══════════════════════════╝

    📌 Grup ini sekarang terdaftar di database bot.
    💎 Premium member dapat menggunakan *.upswgc* di grup ini tanpa kena denda.

    🆔 *ID Grup:* ${targetGrup}
    📊 *Total Grup Terdaftar:* ${pler.length} grup

    ⚠️ Ingat: Premium yang broadcast ke grup TIDAK terdaftar = *DENDA 50.000 LIMIT!*`)
  }
}
