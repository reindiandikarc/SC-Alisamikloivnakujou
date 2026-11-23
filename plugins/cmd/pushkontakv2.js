// Plugin: pushkontakv2
// Auto-generated from Alya V12
// Commands: pushkontakv2

const path = require('path')

module.exports = {
  command: ["pushkontakv2"],
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
    if (!q) return replyalya(`Format: ${prefix+command} idgc|text`)
    reply(mess.wait)
    const metadata2 = await alya.groupMetadata(q.split("|")[0]).catch(e => {})
    if(!metadata2) return reply("Group not found")
    const halss = metadata2.participants
    for (let mem of halss) {
    if (mem.id === alya.user.id) continue;
    await alya.sendMessage(mem.id, { text: q.split("|")[1] }).catch(() => {})
    await sleep(5000)
    }
    replyalya(`Success`)
  }
}
