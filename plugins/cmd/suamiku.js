// Plugin: suamiku
// Auto-generated from Alya V12
// Commands: suamiku

const path = require('path')

module.exports = {
  command: ["suamiku"],
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

        let users = global.db.users[m.sender]
        if (!users.husbu || !users.husbu.name) return replyalya("😔 Lu masih jomblo. Gacha sana di *.gachahusbu* terus nikahin!")

        let h = users.husbu
        let day = Math.floor((Date.now() - h.marriedAt) / (1000 * 60 * 60 * 24))
        let rarityDisplay = h.rarity === 'MITOS' ? '💀 MITOS' : h.rarity === 'LEGENDARY' ? '🌟 LEGENDARY' : h.rarity === 'EPIC' ? '💎 EPIC' : '⚪ COMMON'

        let teks = `❤️ *PROFIL SUAMI TERSAYANG* ❤️\n\n`
        teks += `🗡️ *Nama:* ${h.name}\n`
        teks += `📺 *Anime:* ${h.anime}\n`
        teks += `🏆 *Rarity:* ${rarityDisplay}\n`
        teks += `💞 *Affection:* ${h.affection || 0} Poin\n`
        teks += `⏳ *Usia Pernikahan:* ${day} Hari\n\n`
        teks += `Tetap setia ya sama suami tercinta!`

        replyalya(teks)
  }
}
