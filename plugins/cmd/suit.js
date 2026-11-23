// Plugin: suit
// Ported to Alya V13 from V10
// Commands: suit, rps, rockpaperscissors

const path = require('path')

module.exports = {
  command: ["suit", "rps", "rockpaperscissors"],
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

    const choices = ['batu', 'kertas', 'gunting']
    const emoji = { batu: '🪨', kertas: '📄', gunting: '✂️' }
    const beats = { batu: 'gunting', gunting: 'kertas', kertas: 'batu' }

    if (!text) return replyalya(`✊ Mainkan Suit!\nKetik: *${prefix}suit batu/kertas/gunting*`)

    const input = text.toLowerCase().trim()
    if (!choices.includes(input)) return replyalya(`❌ Pilihan tidak valid!\nGunakan: *batu*, *kertas*, atau *gunting*`)

    const botChoice = choices[Math.floor(Math.random() * choices.length)]
    let result

    if (input === botChoice) {
      result = '🤝 *SERI!* Kita pilih yang sama!'
    } else if (beats[input] === botChoice) {
      result = '🎉 *KAMU MENANG!* Selamat!'
    } else {
      result = '😈 *KAMU KALAH!* Lebih baik lagi next time!'
    }

    replyalya(`✊✌️✋ *SUIT / ROCK PAPER SCISSORS*\n\n👤 Pilihanmu: ${emoji[input]} *${input.toUpperCase()}*\n🤖 Pilihan Bot: ${emoji[botChoice]} *${botChoice.toUpperCase()}*\n\n${result}`)
  }
}
