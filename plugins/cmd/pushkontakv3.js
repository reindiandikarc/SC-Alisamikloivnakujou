// Plugin: pushkontakv3
// Auto-generated from Alya V12
// Commands: pushkontakv3

const path = require('path')

module.exports = {
  command: ["pushkontakv3"],
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
    if (!text) return reply(`Format: ${prefix+command} idgroup|jeda|teks`)
    await replyalya("Otw Boskuuu")
    const groupMetadataa = await alya.groupMetadata(`${q.split("|")[0]}`).catch(e => {})
    if (!groupMetadataa) return reply("Metadata Gagal")
    const halls = groupMetadataa.participants.map(v => v.id)
    global.tekspushkonv3 = q.split("|")[2]
    for (let mem of halls) {
    if (mem === alya.user.id) continue;
    if (/image/.test(mime)) {
    media = await alya.downloadAndSaveMediaMessage(quoted)
    memk = await uploadwidipe(media)
    await alya.sendMessage(mem, { image: { url: memk }, caption: global.tekspushkonv3 }).catch(() => {})
    } else {
    await alya.sendMessage(mem, { text: global.tekspushkonv3 }).catch(() => {})
    }
    await sleep(parseInt(q.split("|")[1]) || 2000)
    }
    replyalya("Succes Boss!")
  }
}
