// Plugin: ulartangga
// Auto-generated from Alya V12
// Commands: ulartangga

const path = require('path')

module.exports = {
  command: ["ulartangga"],
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

        if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di grup!')

    class GameSession {
        constructor(id, sMsg) {
            alya.id = id
            alya.players = []
            alya.game = new SnakeAndLadderGame(sMsg)
        }
    }
    class SnakeAndLadderGame {
        constructor(sMsg) {
            alya.sendMsg = sMsg
            alya.players = []
            alya.boardSize = 100
            alya.snakesAndLadders = [
                { start: 29, end: 7 }, { start: 24, end: 12 }, { start: 15, end: 37 },
                { start: 23, end: 41 }, { start: 72, end: 36 }, { start: 49, end: 86 },
                { start: 90, end: 56 }, { start: 75, end: 64 }, { start: 74, end: 95 },
                { start: 91, end: 72 }, { start: 97, end: 78 }
            ]
            alya.currentPositions = {}
            alya.currentPlayerIndex = 0
            alya.bgImageUrl = 'https://i.pinimg.com/originals/2f/68/a7/2f68a7e1eee18556b055418f7305b3c0.jpg'
            alya.player1ImageUrl = 'https://i.pinimg.com/originals/75/33/22/7533227c53f6c270a96d364b595d6dd5.jpg'
            alya.player2ImageUrl = 'https://i.pinimg.com/originals/be/68/13/be6813a6086681070b0f886d33ca4df9.jpg'
            alya.bgImage = null
            alya.player1Image = null
            alya.player2Image = null
            alya.cellWidth = 40
            alya.cellHeight = 40
            alya.keyId = null
            alya.started = false
        }

        initializeGame() {
            for (const player of alya.players) {
                alya.currentPositions[player] = 1
            }
            alya.currentPlayerIndex = 0
            alya.started = true
        }

        rollDice() {
            return Math.floor(Math.random() * 6) + 1
        }

        async movePlayer(player, steps) {
            if (alya.players.length === 0) return
            const currentPosition = alya.currentPositions[player]
            let newPosition = currentPosition + steps
            for (const otherPlayer of alya.players) {
                if (otherPlayer !== player && alya.currentPositions[otherPlayer] === newPosition) {
                    const message = `😱 *Oh tidak!* @${player.split('@')[0]} *diinjak oleh* @${otherPlayer.split('@')[0]}.* Kembali ke awal cell.*`
                    await m.reply(message, null, { mentions: [player, otherPlayer] })
                    newPosition = 1
                }
            }
            const snakeOrLadder = alya.snakesAndLadders.find(s => s.start === newPosition)
            if (snakeOrLadder) newPosition = snakeOrLadder.end
            newPosition = Math.min(newPosition, alya.boardSize)
            alya.currentPositions[player] = newPosition
        }

        async fetchImage(url) {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' })
                return await Jimp.read(Buffer.from(response.data, 'binary'))
            } catch (error) {
                console.error(`Error fetching image from ${url}:`, error)
                throw error
            }
        }

        async getBoardBuffer() {
            const board = new Jimp(420, 420)
            alya.bgImage.resize(420, 420)
            board.composite(alya.bgImage, 0, 0)
            for (const player of alya.players) {
                const playerPosition = alya.currentPositions[player]
                const playerImage = player === alya.players[0] ? alya.player1Image : alya.player2Image
                const playerX = ((playerPosition - 1) % 10) * alya.cellWidth + 10
                const playerY = (9 - Math.floor((playerPosition - 1) / 10)) * alya.cellHeight + 10
                board.composite(playerImage.clone().resize(alya.cellWidth, alya.cellHeight), playerX, playerY)
            }
            return board.getBufferAsync(Jimp.MIME_PNG)
        }

        async startGame(m, player1Name, player2Name) {
            await m.reply(`🐍🎲 *Selamat datang di Permainan Ular Tangga!* 🎲🐍 \n\n@${player1Name.split('@')[0]} vs @${player2Name.split('@')[0]}`, null, { mentions: [player1Name, player2Name] })
            alya.players = [player1Name, player2Name]
            alya.initializeGame()
            if (!alya.bgImage) alya.bgImage = await alya.fetchImage(alya.bgImageUrl)
            if (!alya.player1Image) alya.player1Image = await alya.fetchImage(alya.player1ImageUrl)
            if (!alya.player2Image) alya.player2Image = await alya.fetchImage(alya.player2ImageUrl)
            const boardBuffer = await alya.getBoardBuffer()
            const { key } = await m.reply(boardBuffer)
            alya.keyId = key
        }

        async playTurn(m, player) {
            if (!alya.players.length) {
                await m.reply('🛑 *Tidak ada permainan aktif.* Gunakan "!snake start" untuk memulai permainan baru.')
                return
            }
            if (player !== alya.players[alya.currentPlayerIndex]) {
                await m.reply(`🕒 *Bukan giliranmu.* \n\nSekarang giliran @${alya.players[alya.currentPlayerIndex].split('@')[0]}`, null, { mentions: [alya.players[alya.currentPlayerIndex]] })
                return
            }
            const diceRoll = alya.rollDice()
            await m.reply(`🎲 @${player.split('@')[0]} *melempar dadu.*\n\n  - Dadu: *${diceRoll}*\n  - Dari kotak: *${alya.currentPositions[player]}*\n  - Ke kotak: *${alya.currentPositions[player] + diceRoll}*`, null, { mentions: [player] })
            if (diceRoll !== 6) {
                alya.movePlayer(player, diceRoll)
                const snakeOrLadder = alya.snakesAndLadders.find(s => s.start === alya.currentPositions[player])
                if (snakeOrLadder) {
                    const action = snakeOrLadder.end < snakeOrLadder.start ? 'Mundur' : 'Maju'
                    await m.reply(`🐍 @${player.split('@')[0]} menemukan ${action === 'Mundur' ? 'ular' : 'tangga'}! ${action} *ke kotak ${snakeOrLadder.end}.*`, null, { mentions: [player] })
                    alya.currentPositions[player] = snakeOrLadder.end
                }
            }
            if (diceRoll !== 6) {
                alya.switchPlayer()
            } else {
                await m.reply('🎲 Anda mendapat 6, jadi giliran Anda masih berlanjut.')
                alya.movePlayer(player, diceRoll)
            }
            if (alya.currentPositions[player] === alya.boardSize) {
                await m.reply(`🎉 @${player.split('@')[0]} menang! Selamat!`, null, { mentions: [player] })
                alya.resetSession()
            }
            const boardBuffer = await alya.getBoardBuffer()
            const sendMsg = alya.sendMsg
            await sendMsg.sendMessage(m.chat, { delete: alya.keyId })
            const { key } = await m.reply(boardBuffer)
            alya.keyId = key
            return
        }

        addPlayer(player) {
            if (alya.players.length < 2 && !alya.players.includes(player) && player !== '') {
                alya.players.push(player)
                return true
            } else {
                return false
            }
        }

        switchPlayer() {
            alya.currentPlayerIndex = 1 - alya.currentPlayerIndex
        }

        resetSession() {
            alya.players = []
            alya.currentPositions = {}
            alya.currentPlayerIndex = 0
            alya.started = false
        }

        isGameStarted() {
            return alya.started
        }
    }
        // Inisialisasi objek game jika belum ada
        alya.ulartangga = alya.ulartangga || {}
        const sessions = alya.ulartangga_ = alya.ulartangga_ || {}
        const sessionId = m.chat
        const session = sessions[sessionId] || (sessions[sessionId] = new GameSession(sessionId, alya))
        const game = session.game
        const { state } = alya.ulartangga[m.chat] || { state: false }

        switch (args[0]) {
            case 'join':
                if (state) return reply('🛑 *Permainan sudah dimulai.* Tidak dapat bergabung.')
                const playerName = m.sender
                const joinSuccess = game.addPlayer(playerName)
                joinSuccess
                    ? reply(`👋 @${playerName.split('@')[0]} *bergabung ke dalam permainan.*`, null, { mentions: [playerName] })
                    : reply('*Anda sudah bergabung atau permainan sudah penuh.* Tidak dapat bergabung.')
                break

            case 'start':
                if (state) return reply('🛑 *Permainan sudah dimulai.* Tidak dapat memulai ulang.')
                alya.ulartangga[m.chat] = { ...alya.ulartangga[m.chat], state: true }
                if (game.players.length === 2) {
                    await game.startGame(m, game.players[0], game.players[1])
                } else {
                    reply('👥 *Tidak cukup pemain untuk memulai permainan.* Diperlukan minimal 2 pemain.')
                }
                break

            case 'roll':
                if (!state) return reply('🛑 *Permainan belum dimulai.* Ketik "!snake start" untuk memulai.')
                if (game.isGameStarted()) {
                    const currentPlayer = game.players[game.currentPlayerIndex]
                    if (m.sender !== currentPlayer) {
                        reply(`🕒 *Bukan giliranmu.* \n\nSekarang giliran @${currentPlayer.split('@')[0]}`, null, { mentions: [currentPlayer] })
                    } else {
                        await game.playTurn(m, currentPlayer)
                    }
                } else {
                    reply('🛑 *Permainan belum dimulai.* Ketik "!snake start" untuk memulai.')
                }
                break

            case 'reset':
                alya.ulartangga[m.chat] = { ...alya.ulartangga[m.chat], state: false }
                session.game.resetSession()
                delete sessions[sessionId]
                reply('🔄 *Sesi permainan direset.*')
                break

            case 'help':
                reply(`🎲🐍 *Permainan Ular Tangga* 🐍🎲\n\n*Commands:*\n- ${prefix + command} join : Bergabung ke dalam permainan.\n- ${prefix + command} start : Memulai permainan.\n- ${prefix + command} roll : Melempar dadu untuk bergerak.\n- ${prefix + command} reset : Mereset sesi permainan.`)
                break

            default:
                reply(`❓ *Perintah tidak valid.* Gunakan ${prefix + command} help untuk melihat daftar perintah.`)
        }
  }
}
