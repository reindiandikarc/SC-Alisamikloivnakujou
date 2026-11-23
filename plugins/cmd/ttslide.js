// Plugin: ttslide
// Auto-generated from Alya V12
// Commands: fstik, ttslide

const path = require('path')

module.exports = {
  command: ["fstik", "ttslide"],
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

    if (!text) return replyalya(`Gunakan dengan cara ${prefix+command} *url*\n\n_Contoh_\n\n${prefix+command} https://vt.tiktok.com/ZSL36LfEP/`)
    alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    try{
    let anu = await fetchJson(`https://btch.us.kg/download/tiktokslide?url=${encodeURIComponent(text)}`)
    for (let img of anu.result.images) {
      await alya.sendMessage(m.chat, { image: { url: img }, caption: anu.result.title }, { quoted: m })
    }
    await alya.sendMessage(m.chat, { react: { text: "☑️",key: m.key,}})
    } catch (error) {
    await alya.sendMessage(m.chat, { react: { text: "✖️",key: m.key,}})
    }
  }
}
