// Plugin: masukgc
// Auto-generated from Alya V12
// Commands: joingc, masukgc

const path = require('path')

module.exports = {
  command: ["joingc", "masukgc"],
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

        if (!Ryuu) return replyalya('❌ Khusus owner!')

        if (!text) {
            return replyalya(`❌ Kirim link grup!\n\nContoh:\n${prefix + command} https://chat.whatsapp.com/xxxxx`)
        }
        let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
        let result = text.match(linkRegex)

        if (!result) {
            return replyalya('❌ Link grup tidak valid!')
        }

        let inviteCode = result[1]

        try {
            await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

            // Join grup
            let res = await alya.groupAcceptInvite(inviteCode)

            await replyalya(`✅ Berhasil masuk ke grup!\n\n🆔 ID Grup: ${res}`)

        } catch (err) {
            console.log(err)
            replyalya('❌ Gagal masuk grup! Pastikan link masih aktif.')
        }
  }
}
