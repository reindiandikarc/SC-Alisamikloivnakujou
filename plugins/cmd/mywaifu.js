// Plugin: mywaifu
// Ported to Alya V13 from V10
// Commands: mywaifu, istriku

const path = require('path')

module.exports = {
  command: ["mywaifu", "istriku"],
  tags: ['fun'],
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
      mentionByTag, mentionByReply, participants
    } = ctx

    let users = global.db.users[m.sender]
    if (!users.waifu || !users.waifu.name) return replyalya("😔 Lu masih jomblo. Gacha sana di *.gachawaifu* terus nikahin!")

    let w = users.waifu
    let day = Math.floor((Date.now() - w.marriedAt) / (1000 * 60 * 60 * 24))

    let teks = `❤️ *PROFIL ISTRI TERSAYANG* ❤️\n\n`
    teks += `🌸 *Nama:* ${w.name}\n`
    teks += `📺 *Anime:* ${w.anime}\n`
    teks += `🏆 *Rarity:* ${w.rarity}\n`
    teks += `💞 *Affection:* ${w.affection || 0} Poin\n`
    teks += `⏳ *Usia Pernikahan:* ${day} Hari\n\n`
    teks += `Tetap setia ya sama dia!`

    replyalya(teks)
  }
}
