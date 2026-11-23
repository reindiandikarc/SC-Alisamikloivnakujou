// Plugin: pushkontak
// Auto-generated from Alya V12
// Commands: pushkontak

const path = require('path')

module.exports = {
  command: ["pushkontak"],
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
    if (!m.isGroup) return replytolak(`Only for groups`)
    if (!text) return replyalya(`text?`)
    const cmiggc = await alya.groupMetadata(m.chat)
    let mem = cmiggc.participants.map(v => v.id)
    replyalya(`Otw push ke ${mem.length} member...`)
    for (let targetId of mem) {
    if (targetId === alya.user.id) continue;
    await alya.sendMessage(targetId, { text: q }).catch(() => {})
    await sleep(2000)
    }
    replyalya(`*[ Done ]*`)
  }
}
