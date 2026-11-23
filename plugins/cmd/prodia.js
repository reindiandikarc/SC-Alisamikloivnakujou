// Plugin: prodia
// Fixed: removed stale geminiai case comment, added UploadFileUgu/mess/BingAlya/AlyaAI to destructure
// Commands: bard, prodia

const path = require('path')

module.exports = {
  command: ["bard", "prodia"],
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
      waifuList, husbuList, pler, setting, user,
      mess, BingAlya, AlyaAI, UploadFileUgu
    } = ctx

    if (!text) return replyalya('mau buat gambar apa')
    reply(mess.wait)

    try {
      if (/image/.test(mime)) {
        const media = await alya.downloadAndSaveMediaMessage(quoted)
        let anuu = await UploadFileUgu(media)
        const data = await fetchJson(`https://btch.us.kg/bardimg?url=${anuu.url}&text=${encodeURIComponent(text)}`)
        const aimsg = data.result
        reply(`${aimsg}`)
      } else {
        const data = await fetchJson(`https://btch.us.kg/openai?text=${encodeURIComponent(text)}`)
        if (data && data.result) {
          reply(`${data.result}`)
        } else {
          AlyaAI(pushname, text)
        }
      }
    } catch (e) {
      reply('Terjadi error, coba lagi nanti.')
    }
  }
}
