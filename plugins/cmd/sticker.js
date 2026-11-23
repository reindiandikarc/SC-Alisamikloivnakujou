// Plugin: sticker
// Auto-generated from Alya V12
// Commands: stiker, sticker

const path = require('path')

module.exports = {
  command: ["stiker", "sticker"],
  tags: ['sticker'],
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

      let biaya = 1
      let limitUser = global.db.users[m.sender].limit

      if (limitUser < biaya) {
        return replyalya(`❌ Limit kamu tidak cukup!

    💳 Limit dibutuhkan : ${biaya}
    📊 Limit kamu : ${limitUser}`)
      }

      if (!quoted) return reply(`Send/Reply Images/Videos/Gifs With Captions ${prefix+command}\nVideo Duration 1-9 Seconds`)

      try {

        if (/image/.test(mime)) {

          let media = await quoted.download()
          await alya.sendImageAsSticker(m.chat, media, m, {
            packname: global.packname,
            author: global.author
          })

          global.db.users[m.sender].limit -= biaya

        } else if (/video/.test(mime)) {

          if ((quoted.msg || quoted).seconds > 11) {
            return reply(`Send/Reply Images/Videos/Gifs With Captions ${prefix+command}\nVideo Duration 1-9 Seconds`)
          }

          let media = await quoted.download()
          await alya.sendVideoAsSticker(m.chat, media, m, {
            packname: global.packname,
            author: global.author
          })

          global.db.users[m.sender].limit -= biaya

        } else {
          reply(`Send/Reply Images/Videos/Gifs With Captions ${prefix+command}\nVideo Duration 1-9 Seconds`)
        }

      } catch (e) {
        replyalya('❌ Gagal membuat sticker')
      }
  }
}
