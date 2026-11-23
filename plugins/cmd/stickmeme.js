// Plugin: stickmeme
// Auto-generated from Alya V12
// Commands: stickmeme

const path = require('path')

module.exports = {
  command: ["stickmeme"],
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
      UploadFileUgu, mess
    } = ctx

    const db = global.db
    const biaya = 1
    if (db.users[m.sender].limit < biaya) {
    return replyalya(`❌ Limit kamu tidak cukup!

    💳 Limit kamu : ${db.users[m.sender].limit}
    💰 Biaya fitur : ${biaya} limit`)
    }
    if (!/webp/.test(mime) && /image/.test(mime)) {
    if (!text) return replyalya(`Usage: ${prefix + command} text1|text2`)
    let atas = text.split('|')[0] ? text.split('|')[0] : '-'
    let bawah = text.split('|')[1] ? text.split('|')[1] : '-'
    let mee = await alya.downloadAndSaveMediaMessage(quoted)
    let mem = await UploadFileUgu(mee)
    let meme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${mem.url}`
    await alya.sendImageAsSticker(m.chat, meme, m, {
    packname: global.packname,
    author: global.author
    })
    db.users[m.sender].limit -= biaya
    replyalya(`✅ Sticker meme berhasil dibuat!

    💰 Biaya : ${biaya} limit
    📊 Sisa limit kamu : ${db.users[m.sender].limit}`)
    } else {
    replyalya(`Kirim/Balas Gambar Dengan Caption ${prefix + command} text1|text2`)
    }
  }
}
