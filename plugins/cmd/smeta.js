// Plugin: smeta
// Auto-generated from Alya V12
// Commands: smeta

const path = require('path')

module.exports = {
  command: ["smeta"],
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

    if (!/webp/.test(mime)) return replyalya('Reply sticker!')
      var stiker = false
        try {
            let [packname, ...author] = q.split('|')
                //var author = (author  []).join('|')
                    let mime = m.quoted.mimetype || ''
                            //let img = await q.download()
                                let img = await alya.downloadAndSaveMediaMessage(quoted, makeid(5))
                                    if (!img) return replyalya('Reply a sticker!')
                                        var stiker = await addExifAvatar(img, `Made by`, `${botname}`)
                                          } catch (e) {
                                              console.error(e)
                                                  if (Buffer.isBuffer(e)) stiker = e
                                                    } finally {
                                                        if (stiker) alya.sendMessage(m.chat, {
                                                              sticker: stiker
                                                                  }, {
                                                                        quoted: m
                                                                            })
                                                                                else return replyalya('reply sticker')
                                                                                  }
                                                                                  }
}
