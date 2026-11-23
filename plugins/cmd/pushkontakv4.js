// Plugin: pushkontakv4
// Auto-generated from Alya V12
// Commands: pushkontakv4

const path = require('path')

module.exports = {
  command: ["pushkontakv4"],
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
    if (!m.isGroup) return replytolak(mess.only.private)
    if (!text) return reply(`Format: ${prefix+command} jeda|teks`)
    await replyalya("Otw Boskuuu")
    let cmiggc = await alya.groupMetadata(m.chat)
    const halsss = cmiggc.participants.map(v => v.id)
    global.tekspushkonv4 = text.split("|")[1]
    for (let men of halsss) {
    if (men === alya.user.id) continue;
    if (/image/.test(mime)) {
    media = await alya.downloadAndSaveMediaMessage(quoted)
    mem = await uploadwidipe(media)
    await alya.sendMessage(men, { image: { url: mem }, caption: global.tekspushkonv4 }).catch(() => {})
    } else {
    await alya.sendMessage(men, { text: global.tekspushkonv4 }).catch(() => {})
    }
    await sleep(parseInt(text.split("|")[0]) || 2000)
    }
    replyalya("Succes Boss!")
  }
}
