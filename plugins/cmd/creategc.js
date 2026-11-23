// Plugin: creategc
// Auto-generated from Alya V12
// Commands: creategc

const path = require('path')

module.exports = {
  command: ["creategc"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!args.join(" ")) return replyalya(`Use ${prefix+command} groupname`)
    try {
    let cret = await alya.groupCreate(args.join(" "), [])
    let response = await alya.groupInviteCode(cret.id)
    teks = `     「 Create Group 」

    ▸ Name : ${cret.subject}
    ▸ Owner : @${cret.owner.split("@")[0]}
    ▸ Creation : ${moment(cret.creation * 1000).tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss")}

    https://chat.whatsapp.com/${response}
           `
    alya.sendMessage(m.chat, { text:teks, mentions: await alya.parseMention(teks)}, {quoted:m})
    } catch {
    reply('yah Error kak laporankan ke owner agar di perbaiki')
    }
  }
}
