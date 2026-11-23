import { CHAT } from '../../_runtime/core-shim.js'

const boardSymbols = {
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
}

class TicTacToe {
  constructor(playerX = 'x', playerO = 'o') {
    this.playerX = playerX
    this.playerO = playerO
    this._currentTurn = false
    this._x = 0
    this._o = 0
    this.turns = 0
  }

  get board() {
    return this._x | this._o
  }

  get currentTurn() {
    return this._currentTurn ? this.playerO : this.playerX
  }

  get enemyTurn() {
    return this._currentTurn ? this.playerX : this.playerO
  }

  static check(state) {
    for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
      if ((state & combo) === combo) return true
    return false
  }

  static toBinary(x = 0, y = 0) {
    if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error('invalid position')
    return 1 << (x + 3 * y)
  }

  turn(player = 0, x = 0, y) {
    if (this.board === 511) return -3
    let pos = 0
    if (y == null) {
      if (x < 0 || x > 8) return -1
      pos = 1 << x
    } else {
      if (x < 0 || x > 2 || y < 0 || y > 2) return -1
      pos = TicTacToe.toBinary(x, y)
    }
    if (this._currentTurn ^ player) return -2
    if (this.board & pos) return 0
    this[this._currentTurn ? '_o' : '_x'] |= pos
    this._currentTurn = !this._currentTurn
    this.turns++
    return 1
  }

  static render(boardX = 0, boardO = 0) {
    let x = parseInt(boardX.toString(2), 4)
    let y = parseInt(boardO.toString(2), 4) * 2
    return [...(x + y).toString(4).padStart(9, '0')]
      .reverse()
      .map((value, index) => (value == 1 ? 'X' : value == 2 ? 'O' : ++index))
  }

  render() {
    return TicTacToe.render(this._x, this._o)
  }

  get winner() {
    let x = TicTacToe.check(this._x)
    let o = TicTacToe.check(this._o)
    return x ? this.playerX : o ? this.playerO : false
  }
}

const tictactoeGames = new Map()
const WIN_REWARD = 1000
const SURRENDER_REWARD = 500

function renderBoard(arr) {
  const cells = arr.map((cell) => boardSymbols[String(cell)] || cell)
  return `┌───┬───┬───┐
│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │
├───┼───┼───┤
│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │
├───┼───┼───┤
│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │
└───┴───┴───┘`
}

function getPlayerRoom(sender) {
  for (const room of tictactoeGames.values()) {
    if (room.state === 'PLAYING' && [room.game.playerX, room.game.playerO].filter(Boolean).includes(sender)) {
      return room
    }
  }
  return null
}

async function creditCoins(moduleData, sender, amount) {
  const coins = (await moduleData.user.get(sender, 'coins')) || 0
  await moduleData.user.set(sender, 'coins', coins + amount)
}

async function handler(ctx) {
  const { sock, msg, chat, sender, senderName, moduleData } = ctx

  if (getPlayerRoom(sender)) {
    return sock.sendMessage(chat, {
      text: '❌ Kamu masih dalam game!\n\n> Selesaikan game kamu atau ketik *nyerah* untuk menyerah.'
    }, { quoted: msg })
  }

  const roomName = (ctx.args || []).join(' ').trim()

  let room = null
  for (const r of tictactoeGames.values()) {
    if (r.state === 'WAITING' && r.chat === chat && (roomName ? r.name === roomName : true)) {
      room = r
      break
    }
  }

  if (room) {
    room.game.playerO = sender
    room.state = 'PLAYING'
    // Pengirim yang baru gabung = pemain O, jadi nama ter-resolve milik dia.
    room.oName = senderName

    const board = renderBoard(room.game.render())
    const txt = [
      '🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*',
      '',
      'Partner ditemukan!',
      '',
      `❌ @${room.xName}`,
      `⭕ @${room.oName}`,
      '',
      board,
      '',
      `> Giliran: @${room.game.currentTurn === room.game.playerX ? room.xName : room.oName}`,
      '> Reply pesan ini dengan angka 1-9',
      '> Ketik *nyerah* untuk menyerah',
    ].join('\n')

    await sock.sendMessage(chat, { react: { text: '🎮', key: msg.key } })
    await sock.sendMessage(chat, { text: txt, mentions: [room.game.playerX, room.game.playerO] }, { quoted: msg })
  } else {
    const roomId = 'ttt_' + Date.now()
    const game = new TicTacToe(sender, null)

    tictactoeGames.set(roomId, {
      id: roomId,
      chat,
      name: roomName || null,
      game,
      // Nama tampilan disimpan per-room. X = pembuat room (nama sudah
      // di-resolve), O = yang join (lihat cabang `if (room)` di atas).
      xName: senderName,
      oName: null,
      state: 'WAITING',
      createdAt: Date.now(),
    })

    await sock.sendMessage(chat, { react: { text: '🕕', key: msg.key } })
    await sock.sendMessage(chat, {
      text: [
        '🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*',
        '',
        'Room dibuat! Menunggu partner...',
        '',
        `> Ketik \`.tictactoe${roomName ? ' ' + roomName : ''}\` untuk join`,
        '> Room akan expired dalam 5 menit',
      ].join('\n')
    }, { quoted: msg })

    setTimeout(() => {
      const current = tictactoeGames.get(roomId)
      if (current?.state === 'WAITING') tictactoeGames.delete(roomId)
    }, 300000)
  }
}

async function answerHandler(ctx) {
  const { sock, msg, chat, sender, text, moduleData } = ctx
  if (!text) return false
  const t = text.trim().toLowerCase()

  const room = getPlayerRoom(sender)
  if (!room || room.chat !== chat) return false

  if (t === 'nyerah' || t === 'surrender' || t === 'give up') {
    const winner = sender === room.game.playerX ? room.game.playerO : room.game.playerX
    const loser = sender

    await creditCoins(moduleData, winner, SURRENDER_REWARD)

    await sock.sendMessage(chat, { react: { text: '🏳️', key: msg.key } })
    await sock.sendMessage(chat, {
      text: [
        '🏳️ *MENYERAH!*',
        '',
        `@${loser === room.game.playerX ? room.xName : room.oName} menyerah!`,
        `@${winner === room.game.playerX ? room.xName : room.oName} menang! +Rp ${SURRENDER_REWARD}`,
      ].join('\n'),
      mentions: [winner, loser]
    })

    tictactoeGames.delete(room.id)
    return true
  }

  const move = parseInt(t, 10)
  if (isNaN(move) || move < 1 || move > 9) return false

  if (room.game.currentTurn !== sender) {
    await sock.sendMessage(chat, { text: '❌ Bukan giliranmu!' }, { quoted: msg })
    return true
  }

  const player = room.game.playerX === sender ? 0 : 1
  const result = room.game.turn(player, move - 1)

  if (result === 0) {
    await sock.sendMessage(chat, { text: '❌ Posisi sudah terisi!' }, { quoted: msg })
    return true
  }
  if (result === -1) {
    await sock.sendMessage(chat, { text: '❌ Posisi tidak valid!' }, { quoted: msg })
    return true
  }

  const board = renderBoard(room.game.render())
  const winner = room.game.winner
  const isTie = room.game.board === 511 && !winner

  if (winner) {
    const loser = winner === room.game.playerX ? room.game.playerO : room.game.playerX

    await creditCoins(moduleData, winner, WIN_REWARD)

    await sock.sendMessage(chat, { react: { text: '🎉', key: msg.key } })
    await sock.sendMessage(chat, {
      text: [
        '🎉 *GAME OVER!*',
        '',
        board,
        '',
        `🏆 @${winner === room.game.playerX ? room.xName : room.oName} menang! +Rp ${WIN_REWARD.toLocaleString()}`,
      ].join('\n'),
      mentions: [winner, loser]
    })

    tictactoeGames.delete(room.id)
    return true
  }

  if (isTie) {
    await sock.sendMessage(chat, { react: { text: '🤝', key: msg.key } })
    await sock.sendMessage(chat, {
      text: ['🤝 *SERI!*', '', board, '', '> Tidak ada pemenang!'].join('\n'),
      mentions: [room.game.playerX, room.game.playerO]
    })

    tictactoeGames.delete(room.id)
    return true
  }

  await sock.sendMessage(chat, {
    text: [
      '🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*',
      '',
      board,
      '',
      `> Giliran: @${room.game.currentTurn === room.game.playerX ? room.xName : room.oName}`,
    ].join('\n'),
    mentions: [room.game.currentTurn]
  })

  return true
}

export default {
  name: 'tictactoe',
  command: ['tictactoe', 'ttt', 'xo'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'game',
  description: 'Main TicTacToe dengan player lain',
  handle: handler,
  answerHandler,
}