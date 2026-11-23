import {
  getRandomItem,
  createSession,
  setSessionTimer,
  getSession,
  endSession,
  checkAnswerAdvanced,
  getHint,
  getProgressiveHint,
  getRemainingTime,
  formatRemainingTime,
  isSurrender,
  isReplyToGame,
  getRandomReward,
  hasActiveSession,
} from './game-data.js'

const WIN_MESSAGES = [
  '🌟 *GG WP! Otakmu encer!*',
  '✨ *KEREN ABIS! Lu emang pinter!*',
  '🎉 *MANTAPPPP! Jawaban sempurna!*',
  '💫 *EPIC! Gak ada lawan lu!*',
  '🏆 *NGERI! Otak lu kayak Google!*',
  '🔥 *LEGEND! Jawab kek gak ada beban!*',
]

const TIMEOUT_MESSAGES = ['⏱️ *Yah telat, waktu habis!*', '⏱️ *WAKTU HABIS!*']
const SURRENDER_MESSAGES = ['🏳️ *Yahhh nyerah deh...*', '🏳️ *MENYERAH!*']

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

class GameEngine {
  constructor() {
    this.registry = new Map()
  }

  register(gameType, cfg) {
    const defaults = {
      dataFile: `${gameType}.json`,
      questionField: 'soal',
      answerField: 'jawaban',
      emoji: '🎮',
      title: gameType.toUpperCase(),
      description: `Game ${gameType}`,
      timeout: 60000,
      cooldown: 0,
      hasImage: false,
      alias: [],
      hintCount: 2,
    }
    this.registry.set(gameType, { ...defaults, ...cfg, gameType })
  }

  get(gameType) {
    return this.registry.get(gameType)
  }

  createPlugin(gameType, overrides = {}) {
    const cfg = this.registry.get(gameType)
    if (!cfg) throw new Error(`Game "${gameType}" not registered`)

    return {
      config: {
        name: gameType,
        command: [gameType, ...cfg.alias],
        allow: 'both',
        role: 10,
        category: 'game',
        description: cfg.description || `Game ${gameType}`,
        ...overrides,
      },
      ...this.createHandler(gameType),
    }
  }

  createHandler(gameType) {
    const cfg = this.registry.get(gameType)

    const handler = async (ctx) => {
      const { sock, msg, chat, sender, moduleData } = ctx
      const chatId = chat
      // Satu user satu sesi: sesi lama akan dibatalkan oleh createSession().
      const replaced = hasActiveSession(chatId, sender)

      const question = getRandomItem(cfg.dataFile)
      if (!question) {
        await sock.sendMessage(chatId, {
          text: `❌ *Data tidak tersedia*\n\n> Data game tidak tersedia!`,
        }, { quoted: msg })
        return
      }

      const answer = question[cfg.answerField]
      let sentMsg

      if (cfg.hasImage) {
        const imageUrl = question[cfg.imageField || 'img']
        let imageBuffer
        try {
          const res = await (await fetch(imageUrl)).arrayBuffer()
          imageBuffer = Buffer.from(res)
        } catch {
          await sock.sendMessage(chatId, {
            text: `❌ *Gagal memuat gambar*\n\n> Coba lagi nanti!`,
          }, { quoted: msg })
          return
        }

        let caption = `${cfg.emoji} *${cfg.title}*\n\n`
        if (cfg.questionField && question[cfg.questionField]) {
          caption += `> ${question[cfg.questionField]}\n`
        }
        caption += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`
        caption += `⏱️ Waktu: *${cfg.timeout / 1000} detik*\n`
        caption += `🎁 Hadiah: *Koin, EXP (random)*\n\n`
        caption += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`
        if (replaced) caption += '\n_Sesi sebelumnya dibatalkan._'

        sentMsg = await sock.sendMessage(chatId, {
          image: imageBuffer,
          caption,
        }, { quoted: msg })
      } else {
        let text = `${cfg.emoji} *${cfg.title}*\n\n`
        if (cfg.questionField && question[cfg.questionField]) {
          text += `\`\`\`${question[cfg.questionField]}\`\`\`\n\n`
        }
        text += `💡 Hint: *${getHint(answer, cfg.hintCount)}*\n`
        text += `⏱️ Waktu: *${cfg.timeout / 1000} detik*\n`
        text += `🎁 Hadiah: *Koin, EXP (random)*\n\n`
        text += `_Jawab langsung atau ketik "nyerah"\nSetiap salah, hint akan bertambah_`
        if (replaced) text += '\n_Sesi sebelumnya dibatalkan._'

        sentMsg = await sock.sendMessage(chatId, { text }, { quoted: msg })
      }

      createSession(chatId, sender, gameType, question, sentMsg.key, cfg.timeout)
      setSessionTimer(chatId, sender, async () => {
        let text = `${pick(TIMEOUT_MESSAGES)}\n\n`
        text += `Jawaban: *${answer}*\n\n`
        text += `_Gak ada yang bisa jawab nih~_`
        await sock.sendMessage(chatId, { text })
      })
    }

    const answerHandler = async (ctx) => {
      const { sock, msg, chat, sender, senderName, text, moduleData } = ctx
      const chatId = chat
      const session = getSession(chatId, sender)

      if (!session || session.gameType !== gameType) return false

      const userAnswer = (text || '').trim()
      if (!userAnswer) return false

      if (isSurrender(userAnswer)) {
        endSession(chatId, sender)
        const answer = session.question[cfg.answerField]
        let textMsg = `${pick(SURRENDER_MESSAGES)}\n\n`
        textMsg += `Jawaban: *${answer}*\n\n`
        textMsg += `_@${senderName} menyerah_`
        await sock.sendMessage(chatId, { text: textMsg, mentions: [sender] })
        return true
      }

      if (!isReplyToGame(msg, session)) return false

      session.attempts++
      const answer = session.question[cfg.answerField]
      const result = checkAnswerAdvanced(answer, userAnswer)

      if (result.status === 'correct') {
        endSession(chatId, sender)

        const reward = cfg.rewards === false ? null : (cfg.rewards || getRandomReward())
        let rewardText = ''

        if (reward?.koin > 0) {
          const coins = (await moduleData.user.get(sender, 'coins')) || 0
          await moduleData.user.set(sender, 'coins', coins + reward.koin)
          rewardText += `+${reward.koin.toLocaleString()} Koin`
        }

        let textMsg = `${pick(WIN_MESSAGES)}\n\n`
        textMsg += `Jawaban: *${answer}*\n`
        textMsg += `Pemenang: *@${senderName}*\n`
        textMsg += `Percobaan: *${session.attempts}x*\n\n`
        if (rewardText) textMsg += `🎁 ${rewardText}`

        await sock.sendMessage(chatId, { text: textMsg, mentions: [sender] })
        return true
      }

      if (result.status === 'close') {
        const remaining = getRemainingTime(chatId, sender)
        const percent = Math.round(result.similarity * 100)
        await sock.sendMessage(chatId, {
          text: `🔥 *Hampir!* Jawabanmu *${percent}%* mirip!\n_Sisa waktu: *${formatRemainingTime(remaining)}*_`,
        })
        return false
      }

      const remaining = getRemainingTime(chatId, sender)
      if (remaining > 0 && session.attempts < 10) {
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        const hint = getProgressiveHint(answer, session.attempts)
        await sock.sendMessage(chatId, {
          text: `❌ Belum bener! Hint: *${hint}*\n_Sisa: *${formatRemainingTime(remaining)}*_`,
        })
      }

      return false
    }

    return { handler, answerHandler }
  }
}

const games = new GameEngine()
export { GameEngine, games }