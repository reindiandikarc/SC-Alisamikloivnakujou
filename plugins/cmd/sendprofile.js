// Plugin: sendprofile
// Auto-generated from Alya V12
// Commands: sendprofile

const path = require('path')

module.exports = {
  command: ["sendprofile"],
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

    if (m.isGroup) return reply('Fitur Tidak Dapat Digunakan Untuk Group!')
    this.anonymous = this.anonymous ? this.anonymous : {}
    let romoe = Object.values(this.anonymous).find(room => room.check(m.sender))
    if (!romoe) {
    reply(`⚠️ Kamu belum pernah memulai chat!\n\n${prefix}start -- _Mencari partner_`)
    //var teks = `⚠️ Kamu belum pernah memulai chat!`
    //await alya.sendMessage(m.chat, { text: teks, footer: footxt, templateButtons: but })
    return false
    } else {
    let rms = Object.values(this.anonymous).find(room => [room.a, room.b].includes(m.sender) && room.state == "CHATTING")
    var partnerJID = rms.other(m.sender)
    var rees = await alya.sendContact(partnerJID, [m.sender.split("@")[0]])
    alya.sendMessage(m.chat, { text: '✅ Berhasil mengirim profil ke teman chat anda!' }, { quoted: m })
    alya.sendMessage(partnerJID, { text: '👨👩 Teman chat kamu memberikan kontak profil nya!' }, { quoted: rees })
    }
    //=========================================\\======
  }
}
