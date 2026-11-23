// Plugin: gc
// Auto-generated from Alya V12
// Commands: group, gc

const path = require('path')

module.exports = {
  command: ["group", "gc"],
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

      if (!m.isGroup) return replytolak(mess.only.group)
      if (!isAdmins && !Ryuu) return reply('Perintah ini hanya untuk admin grup.')
      if (!isBotAdmins) return replytolak('Bot harus menjadi admin untuk mengatur grup.')

      if (!q) {
        return reply(
    `Format perintah:
    ${prefix + command} open  → Membuka grup
    ${prefix + command} close → Menutup grup

    Contoh:
    ${prefix + command} close`
        )
      }

      if (args[0] === 'close') {

        await alya.groupSettingUpdate(from, 'announcement')

        replyalya(
    `[ GRUP DITUTUP ]

    Hanya admin yang dapat mengirim pesan.
    Silakan hubungi admin jika ada keperluan penting.`
        )

      } else if (args[0] === 'open') {

        await alya.groupSettingUpdate(from, 'not_announcement')

        replyalya(
    `[ GRUP DIBUKA ]

    Semua anggota kini dapat mengirim pesan.
    Mohon tetap menjaga ketertiban dan aturan grup.`
        )

      } else {
        reply(`Opsi tidak tersedia.\nGunakan: ${prefix + command} open / close`)
      }
  }
}
