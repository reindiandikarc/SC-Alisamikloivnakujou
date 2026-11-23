// Plugin: tictactoe
// Ported to Alya V13 from V10
// Commands: tictactoe, ttt, ttc

const path = require('path')

module.exports = {
  command: ["tictactoe", "ttt", "ttc"],
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

    try {
      let TicTacToe = require('../../lib/tictactoe')
      if (!global.tttGames) global.tttGames = {}

      const games = global.tttGames
      const numMap = { '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣' }

      if (Object.values(games).find(g => g.id.startsWith('tictactoe') && [g.game.playerX, g.game.playerO].includes(sender))) {
        return replyalya('⚠️ Kamu masih dalam game yang aktif!')
      }

      let existing = Object.values(games).find(g => g.state === 'WAITING' && (text ? g.name === text : true))
      if (existing) {
        existing.o = m.chat
        existing.game.playerO = sender
        existing.state = 'PLAYING'
        const arr = existing.game.render().map(v => ({ X: '❌', O: '⭕', ...numMap })[v] || v)
        const str = `🎮 *TIC TAC TOE*\n\n${arr.slice(0,3).join('')}\n${arr.slice(3,6).join('')}\n${arr.slice(6).join('')}\n\nGiliran: @${existing.game.currentTurn.split('@')[0]}\n\n*Ketik nomor 1-9 untuk bermain atau surrender untuk menyerah*`
        if (existing.x !== existing.o) await alya.sendMessage(existing.x, { text: str, mentions: [existing.game.currentTurn] })
        await alya.sendMessage(existing.o, { text: str, mentions: [existing.game.currentTurn] }, { quoted: m })
      } else {
        const roomId = 'tictactoe-' + Date.now()
        const room = { id: roomId, x: m.chat, o: '', game: new TicTacToe(sender, 'o'), state: 'WAITING' }
        if (text) room.name = text
        games[roomId] = room
        replyalya(`🎮 *TIC TAC TOE*\nMenunggu lawan...${text ? `\nKetik: *${prefix}${command} ${text}*` : `\nKetik: *${prefix}${command}* untuk bergabung`}`)
      }
    } catch (e) {
      // Fallback: play vs bot if lib not available
      replyalya('🎮 *TIC TAC TOE*\n\nFitur ini membutuhkan library tictactoe. Pastikan file lib/tictactoe.js tersedia!')
    }
  }
}
