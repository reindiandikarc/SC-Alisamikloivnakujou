import { CHAT, peekName } from '../../_runtime/core-shim.js'

const TIMEOUT = 90000
const WIN_REWARD = 1000

const suites = new Map()

const EMOJI = {
  batu: '✊',
  gunting: '✌️',
  kertas: '✋',
}

function getPlayerRoom(sender) {
  for (const room of suites.values()) {
    if ([room.p, room.p2].includes(sender)) return room
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
      text: '❌ Kamu masih dalam game suit!\n\n> Selesaikan game kamu dulu.'
    }, { quoted: msg })
  }

  const contextInfo = msg?.message?.extendedTextMessage?.contextInfo || msg?.message?.imageMessage?.contextInfo || {}
  let target = null
  if (contextInfo.participant) {
    target = contextInfo.participant
  } else if (contextInfo.mentionedJid?.[0]) {
    target = contextInfo.mentionedJid[0]
  }

  if (!target) {
    return sock.sendMessage(chat, {
      text: [
        '✊✌️✋ *sᴜɪᴛ ᴘᴠᴘ*',
        '',
        '> Tag orang yang mau kamu tantang!',
        '',
        '*Contoh:*',
        '> `.suit @628xxx`',
      ].join('\n')
    }, { quoted: msg })
  }

  if (target === sender) {
    return sock.sendMessage(chat, { text: '❌ Tidak bisa menantang diri sendiri!' }, { quoted: msg })
  }

  if (getPlayerRoom(target)) {
    return sock.sendMessage(chat, { text: '❌ Orang itu sedang bermain suit dengan orang lain!' }, { quoted: msg })
  }

  const roomId = 'suit_' + Date.now()

  suites.set(roomId, {
    id: roomId,
    chat,
    p: sender,
    p2: target,
    // Nama tampilan disimpan di room. `p` adalah pengirim perintah ini jadi
    // namanya sudah di-resolve (ctx.senderName); `p2` cuma di-mention, jadi
    // namanya baru diketahui saat dia menekan "terima" (lihat answerHandler).
    pName: senderName,
    p2Name: null,
    status: 'waiting',
    pilih: null,
    pilih2: null,
    createdAt: Date.now(),
    timeout: setTimeout(() => {
      if (suites.has(roomId)) {
        sock.sendMessage(chat, {
          text: `⏱️ *TIMEOUT!*\n\n@${suites.get(roomId)?.p2Name || peekName([target]) || target.split('@')[0]} tidak merespon!\nSuit dibatalkan.`,
          mentions: [target]
        })
        suites.delete(roomId)
      }
    }, TIMEOUT),
  })

  await sock.sendMessage(chat, { react: { text: '✊', key: msg.key } })
  await sock.sendMessage(chat, {
    text: [
      `Kamu menantang @${peekName([target]) || target.split('@')[0]} untuk adu suit`,
      '',
      '╭┈┈⬡「 💬 *ʀᴇsᴘᴏɴ* 」',
      '┃ ✅ Ketik *terima* / *gas* / *ok*',
      '┃ ❌ Ketik *tolak* / *gabisa*',
      '╰┈┈┈┈┈┈┈┈⬡',
      '',
      'Waktu: 90 detik',
    ].join('\n'),
    mentions: [target]
  })
}

async function answerHandler(ctx) {
  const { sock, msg, chat, sender, senderName, text, isGroup, moduleData } = ctx
  if (!text) return false
  const t = text.trim().toLowerCase()

  let room = null
  let roomId = null

  for (const [id, r] of suites) {
    if (r.chat === chat && [r.p, r.p2].includes(sender)) {
      room = r
      roomId = id
      break
    }
    if (!isGroup && [r.p, r.p2].includes(sender)) {
      room = r
      roomId = id
      break
    }
  }

  if (!room) return false

  if (room.status === 'waiting' && sender === room.p2 && chat === room.chat) {
    if (/^(acc(ept)?|terima|gas|oke?|ok|iya|yoi)$/i.test(t)) {
      clearTimeout(room.timeout)
      room.status = 'playing'
      // Saat ini pengirim adalah room.p2, jadi nama ter-resolve milik lawan.
      room.p2Name = senderName

      await sock.sendMessage(chat, { react: { text: '🎮', key: msg.key } })
      await sock.sendMessage(chat, {
        text: [
          '✊✌️✋ *sᴜɪᴛ ᴅɪᴍᴜʟᴀɪ!*',
          '',
          `@${room.pName} vs @${room.p2Name}`,
          '',
          '> 📩 Cek *Private Chat* untuk memilih!',
          '> ⏱️ Timeout: 90 detik',
        ].join('\n'),
        mentions: [room.p, room.p2]
      })

      const pmMessage = [
        '✊✌️✋ *sᴜɪᴛ - ᴘɪʟɪʜ ᴊᴀᴡᴀʙᴀɴ*',
        '',
        'Ketik salah satu:',
        '',
        '┃ ✊ *batu*',
        '┃ ✌️ *gunting*',
        '┃ ✋ *kertas*',
        '',
        '*TIP: Reply pesan ini dengan pilihanmu!*',
        'Contoh: *batu*',
      ].join('\n')

      try {
        await sock.sendMessage(room.p, { text: pmMessage })
      } catch (e) {
        console.log('[Suit] Failed to PM player 1:', e.message)
      }
      try {
        await sock.sendMessage(room.p2, { text: pmMessage })
      } catch (e) {
        console.log('[Suit] Failed to PM player 2:', e.message)
      }

      room.timeout = setTimeout(async () => {
        if (suites.has(roomId)) {
          if (!room.pilih && !room.pilih2) {
            await sock.sendMessage(room.chat, { text: '⏱️ Kedua pemain tidak memilih, suit dibatalkan!' })
          } else if (!room.pilih || !room.pilih2) {
            const afk = !room.pilih ? room.p : room.p2
            const winner = !room.pilih ? room.p2 : room.p

            await creditCoins(moduleData, winner, WIN_REWARD)

            await sock.sendMessage(room.chat, {
              text: [
                '⏱️ *TIMEOUT!*',
                '',
                `@${afk === room.p ? room.pName : room.p2Name} tidak memilih!`,
                `@${winner === room.p ? room.pName : room.p2Name} menang! +Rp ${WIN_REWARD.toLocaleString()}`,
              ].join('\n'),
              mentions: [afk, winner]
            })
          }
          suites.delete(roomId)
        }
      }, TIMEOUT)

      return true
    }

    if (/^(tolak|gamau|nanti|ga(k.)?bisa|no|tidak)$/i.test(t)) {
      clearTimeout(room.timeout)
      await sock.sendMessage(room.chat, {
        text: `❌ @${room.p2Name} menolak tantangan!\nSuit dibatalkan.`,
        mentions: [room.p2]
      })
      suites.delete(roomId)
      return true
    }
  }

  if (room.status === 'playing' && !isGroup) {
    const choices = /^(batu|gunting|kertas)$/i
    if (!choices.test(t)) return false
    const choice = t.toLowerCase()

    if (sender === room.p && !room.pilih) {
      room.pilih = choice
      await sock.sendMessage(chat, {
        text: `✅ Kamu memilih *${choice}* ${EMOJI[choice]}\n\n> Menunggu lawan...`
      })
      if (!room.pilih2) {
        await sock.sendMessage(room.chat, {
          text: `🕕 @${room.pName} sudah memilih!\n> Menunggu @${room.p2Name}...`,
          mentions: [room.p, room.p2]
        })
      }
    }

    if (sender === room.p2 && !room.pilih2) {
      room.pilih2 = choice
      await sock.sendMessage(chat, {
        text: `✅ Kamu memilih *${choice}* ${EMOJI[choice]}\n\n> Menunggu lawan...`
      })
      if (!room.pilih) {
        await sock.sendMessage(room.chat, {
          text: `🕕 @${room.p2Name} sudah memilih!\n> Menunggu @${room.pName}...`,
          mentions: [room.p, room.p2]
        })
      }
    }

    if (room.pilih && room.pilih2) {
      clearTimeout(room.timeout)

      let winner = null
      let tie = room.pilih === room.pilih2

      if (!tie) {
        if (
          (room.pilih === 'batu' && room.pilih2 === 'gunting') ||
          (room.pilih === 'gunting' && room.pilih2 === 'kertas') ||
          (room.pilih === 'kertas' && room.pilih2 === 'batu')
        ) {
          winner = room.p
        } else {
          winner = room.p2
        }
      }

      let resultTxt = [
        '✊✌️✋ *ʜᴀsɪʟ sᴜɪᴛ*',
        '',
        `@${room.pName} ${EMOJI[room.pilih]} ${room.pilih}`,
        `@${room.p2Name} ${EMOJI[room.pilih2]} ${room.pilih2}`,
        '',
      ]

      if (tie) {
        resultTxt.push('🤝 *SERI!*')
      } else {
        await creditCoins(moduleData, winner, WIN_REWARD)
        resultTxt.push(`🏆 @${winner === room.p ? room.pName : room.p2Name} menang!`)
        resultTxt.push(`> +Rp ${WIN_REWARD.toLocaleString()}`)
      }

      await sock.sendMessage(room.chat, { text: resultTxt.join('\n'), mentions: [room.p, room.p2] }, { quoted: msg })

      suites.delete(roomId)
    }

    return true
  }

  return false
}

export default {
  name: 'suitpvp',
  command: ['suitpvp', 'suit', 'rps', 'janken'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'game',
  description: 'Main suit (batu gunting kertas) dengan player lain',
  handle: handler,
  answerHandler,
}