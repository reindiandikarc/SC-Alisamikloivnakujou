// Plugin: gachahusbu
// Auto-generated from Alya V12
// Commands: gachahusbu

const path = require('path')

module.exports = {
  command: ["gachahusbu"],
  tags: ['romance'],
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

        let users = global.global.db.users[m.sender]
        const GACHA_PRICE = 1500000

        if (users.money < GACHA_PRICE) return replyalya(`💸 Saldo lu kurang! Butuh Rp ${GACHA_PRICE.toLocaleString()} buat sekali narik gacha husbu.`)

        users.money -= GACHA_PRICE

        let chance = Math.random()
        let raritySelected = ""
        if (chance <= 0.02) raritySelected = "MITOS"
        else if (chance <= 0.07) raritySelected = "LEGENDARY"
        else if (chance <= 0.30) raritySelected = "EPIC"
        else raritySelected = "COMMON"

        let pool = husbuList.filter(v => v.rarity === raritySelected)
        let result = pool[Math.floor(Math.random() * pool.length)]

        users.lastGachaHusbu = result

        let rarityDisplay = result.rarity === 'MITOS' ? '💀 MITOS' : result.rarity === 'LEGENDARY' ? '🌟 LEGENDARY' : result.rarity === 'EPIC' ? '💎 EPIC' : '⚪ COMMON'

        let caption = `✨ *HUSBU GACHA RESULT* ✨\n\n`
        caption += `🗡️ *Nama:* ${result.name}\n`
        caption += `📺 *Anime:* ${result.anime}\n`
        caption += `🏆 *Rarity:* ${rarityDisplay}\n\n`
        caption += `Ketik *.marry* jika ingin menjadikan dia suamimu.\n_(Butuh 1x Cincin Nikah)_`

        replyalya(caption)
  }
}
