// Plugin: investvip
// Auto-generated from Alya V12
// Commands: investvip

const path = require('path')

module.exports = {
  command: ["investvip"],
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
      let u = db.users[m.sender]

      const modal = 150_000_000
      if (u.money < modal)
        return replyalya('💸 Butuh 150 juta')

      u.money -= modal

      const markets = [
        {
          name: '💥 CRASH MARKET',
          chance: 0.15,
          min: -100,
          max: -40,
          reason: 'Pasar global runtuh'
        },
        {
          name: '📉 BEAR MARKET',
          chance: 0.25,
          min: -40,
          max: -5,
          reason: 'Tekanan jual besar-besaran'
        },
        {
          name: '➖ SIDEWAYS',
          chance: 0.20,
          min: -5,
          max: 10,
          reason: 'Market stagnan'
        },
        {
          name: '📈 BULL MARKET',
          chance: 0.30,
          min: 10,
          max: 60,
          reason: 'Sentimen investor positif'
        },
        {
          name: '🚀 TO THE MOON',
          chance: 0.10,
          min: 60,
          max: 200,
          reason: 'Euforia pasar & FOMO'
        }
      ]

      let roll = Math.random()
      let acc = 0
      let market

      for (const m of markets) {
        acc += m.chance
        if (roll <= acc) {
          market = m
          break
        }
      }

      let percent = Math.floor(
        Math.random() * (market.max - market.min + 1)
        + market.min
      )

      let hasil = Math.max(0, Math.floor(modal * (1 + percent / 100)))
      u.bank += hasil
      let pText = percent > 0 ? `+${percent}%` : `${percent}%`

      replyalya(`
    💎 *INVEST VIP*
    ${market.name}

    📊 Perubahan: ${pText}
    📰 Alasan: ${market.reason}

    💸 Modal: Rp 150.000.000
    🏦 Masuk Bank: Rp ${hasil.toLocaleString()}
    `)
  }
}
