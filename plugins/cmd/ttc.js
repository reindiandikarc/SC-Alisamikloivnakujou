// Plugin: ttc
// Auto-generated from Alya V12
// Commands: ttc

const path = require('path')

module.exports = {
  command: ["ttc"],
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

                let TicTacToe = require("./lib/tictactoe")
                this.game = this.game ? this.game : {}
                if (Object.values(this.game).find(room13 => room13.id.startsWith('tictactoe') && [room13.game.playerX, room13.game.playerO].includes(m.sender))) return replyalya(`You Are Still In The Game`)
                let room13 = Object.values(this.game).find(room13 => room13.state === 'WAITING' && (text ? room13.name === text : true))
                if (room13) {
                room13.o = m.chat
                room13.game.playerO = m.sender
                room13.state = 'PLAYING'
                let arr = room13.game.render().map(v => {
                return {
                X: '❌',
                O: '⭕',
                1: '1️⃣',
                2: '2️⃣',
                3: '3️⃣',
                4: '4️⃣',
                5: '5️⃣',
                6: '6️⃣',
                7: '7️⃣',
                8: '8️⃣',
                9: '9️⃣',
                }[v]
                })
                let str = `room13 ID: ${room13.id}

    ${arr.slice(0, 3).join('')}
    ${arr.slice(3, 6).join('')}
    ${arr.slice(6).join('')}

    Waiting @${room13.game.currentTurn.split('@')[0]}

    Type *surrender* to surrender and admit defeat`
                if (room13.x !== room13.o) await alya.sendText(room13.x, str, m, { mentions: parseMention(str) } )
                await alya.sendText(room13.o, str, m, { mentions: parseMention(str) } )
                } else {
                room13 = {
                id: 'tictactoe-' + (+new Date),
                x: m.chat,
                o: '',
                game: new TicTacToe(m.sender, 'o'),
                state: 'WAITING'
                }
                if (text) room13.name = text
                replyalya('Waiting For Partner' + (text ? ` Type The Command Below ${prefix}${command} ${text}` : ''))
                this.game[room13.id] = room13
                }
//                 case 'suitpvp':case 'rps': case 'rockpaperscissors':case 'suit': {
                this.suit = this.suit ? this.suit : {}
                let poin = 10
                let poin_lose = 10
                let timeout = 60000
                if (Object.values(this.suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(m.sender))) replyalya(`Complete your previous game`)
    	    if (m.mentionedJid[0] === m.sender) return replyalya(`Can't play with myself !`)
                if (!m.mentionedJid[0]) return replyalya(`_Who do you want to challenge?_\nTag the person..\n\nExample : ${prefix}suit @${owner}`, m.chat, { mentions: [owner[1] + '@s.whatsapp.net'] })
                if (Object.values(this.suit).find(roof => roof.id.startsWith('suit') && [roof.p, roof.p2].includes(m.mentionedJid[0]))) return replyalya(`Orang yang Anda tantang sedang bermain sesuai dengan orang lain :(`)
                let id = 'suit_' + new Date() * 1
                let caption = `_*SUIT PvP*_

    @${m.sender.split`@`[0]} *Challenged* @${m.mentionedJid[0].split`@`[0]} *to play suit*

    *Hi* @${m.mentionedJid[0].split`@`[0]} *Silahkan ketik accept untuk menerima atau ketik reject untuk menolak`
                this.suit[id] = {
                chat: await alya.sendText(m.chat, caption, m, { mentions: parseMention(caption) }),
                id: id,
                p: m.sender,
                p2: m.mentionedJid[0],
                status: 'wait',
                waktu: setTimeout(() => {
                if (this.suit[id]) alya.sendText(m.chat, `_suit waktu habis_`, m)
                delete this.suit[id]
                }, 60000), poin, poin_lose, timeout
                }
  }
}
