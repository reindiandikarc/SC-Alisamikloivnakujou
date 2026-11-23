// Plugin: swm
// Auto-generated from Alya V12
// Commands: swm

const path = require('path')

module.exports = {
  command: ["swm"],
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

    const db = global.db
      let userAlt = db.users[m.sender]
      let cost = 3

      if (!user) return reply('User tidak terdaftar')
      if (userAlt.limit < cost) return reply(`❌ Limit kamu kurang!\nButuh ${cost} limit untuk fitur ini.\nSisa limit: ${userAlt.limit}`)

      if (!quoted) return reply('Reply gambar/video/gif untuk dijadikan sticker!')

      const getRandom = (ext) => {
        return `${Math.floor(Math.random() * 10000)}${ext}`
      }

      let ahuh = args.join(' ').split('|')
      let satu = ahuh[0] !== '' ? ahuh[0] : `Ryuu`
      let dua = typeof ahuh[1] !== 'undefined' ? ahuh[1] : ``

      let { Sticker, StickerTypes } = require('wa-sticker-formatter')

      let media = await alya.downloadAndSaveMediaMessage(quoted)

      let jancok = new Sticker(media, {
        pack: satu,
        author: dua,
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        id: '12345',
        quality: 70,
        background: '#FFFFFF00'
      })

      let stok = getRandom(".webp")
      let nono = await jancok.toFile(stok)
      let nah = fs.readFileSync(nono)

      await alya.sendMessage(from, { sticker: nah }, { quoted: m })

      userAlt.limit -= cost

      reply(`✅ Berhasil membuat sticker!

    📊 Detail Penggunaan:
    - Limit terpakai: ${cost}
    - Sisa limit kamu: ${userAlt.limit}
    `)

      await fs.unlinkSync(stok)
      await fs.unlinkSync(media)
  }
}
