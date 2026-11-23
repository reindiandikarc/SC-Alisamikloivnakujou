// Plugin: truthordare
// Alya V13 — Truth or Dare game
// FIX: path require lib/truthdare diperbaiki dari './lib/truthdare' ke '../../lib/truthdare'
// Commands: truthordare, tod

const path = require('path')
const fs = require('fs')

module.exports = {
  command: ['truthordare', 'tod'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix,
      sender, from, pushname, botNumber,
      isCmd, isGroup,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber
    } = ctx

    // ✅ FIX: gunakan path relatif dari root project (../../lib/) bukan ./lib/
    const { getRandomTruth, getRandomDare } = require(path.join(__dirname, '../../lib/truthdare'))

    if (!text) {
      return replyalya(
        `🎮 *TRUTH OR DARE*\n\n` +
        `━━━━━━━━━━━━━━━━━\n\n` +
        `Cara main:\n` +
        `📌 *${prefix}tod truth* → Dapat pertanyaan Truth\n` +
        `📌 *${prefix}tod dare* → Dapat tantangan Dare\n` +
        `📌 *${prefix}tod random* → Random Truth/Dare\n\n` +
        `_Jujur ya jawabannya! 😏_`
      )
    }

    const arg = text.trim().toLowerCase()

    if (arg === 'truth') {
      const pertanyaan = getRandomTruth()
      return replyalya(
        `🟦 *TRUTH!*\n\n` +
        `📜 "${pertanyaan}"\n\n` +
        `_Jawab dengan jujur ya! Tidak boleh skip!_ 😈`
      )
    }

    if (arg === 'dare') {
      const tantangan = getRandomDare()
      return replyalya(
        `🟥 *DARE!*\n\n` +
        `🎯 "${tantangan}"\n\n` +
        `_Harus dilakukan! Tidak ada alasan!_ 😈`
      )
    }

    if (arg === 'random') {
      const isT = Math.random() < 0.5
      if (isT) {
        const pertanyaan = getRandomTruth()
        return replyalya(
          `🎲 *RANDOM → TRUTH!*\n\n` +
          `📜 "${pertanyaan}"\n\n` +
          `_Jawab jujur ya!_ 😏`
        )
      } else {
        const tantangan = getRandomDare()
        return replyalya(
          `🎲 *RANDOM → DARE!*\n\n` +
          `🎯 "${tantangan}"\n\n` +
          `_Harus dilakukan!_ 😈`
        )
      }
    }

    return replyalya(
      `❌ Format salah!\n` +
      `Gunakan: *${prefix}tod truth*, *${prefix}tod dare*, atau *${prefix}tod random*`
    )
  }
}
