// Plugin: math
// Ported to Alya V13 from V10 (simplified - tanpa external lib)
// Commands: math, mathquiz

const path = require('path')

module.exports = {
  command: ["math", "mathquiz"],
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

    const modes = {
      easy: { min: 1, max: 20, ops: ['+', '-'] },
      medium: { min: 1, max: 50, ops: ['+', '-', '*'] },
      hard: { min: 1, max: 100, ops: ['+', '-', '*', '/'] }
    }

    const mode = (text || 'medium').toLowerCase()
    if (!modes[mode]) return replyalya(`📊 Mode: ${Object.keys(modes).join(' | ')}\nContoh: *${prefix}math medium*`)

    const cfg = modes[mode]
    const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)]
    let a = Math.floor(Math.random() * cfg.max) + cfg.min
    let b = Math.floor(Math.random() * cfg.max) + cfg.min

    // Avoid division with ugly decimals
    if (op === '/') {
      b = Math.floor(Math.random() * 9) + 1
      a = b * (Math.floor(Math.random() * 10) + 1)
    }
    // Avoid negative subtraction for easy mode
    if (op === '-' && a < b) [a, b] = [b, a]

    let jawaban
    if (op === '+') jawaban = a + b
    else if (op === '-') jawaban = a - b
    else if (op === '*') jawaban = a * b
    else jawaban = a / b

    const soal = `${a} ${op} ${b}`
    const waktu = mode === 'easy' ? 15000 : mode === 'medium' ? 20000 : 30000

    if (!global.mathSession) global.mathSession = {}
    if (global.mathSession[sender]) return replyalya('❗ Masih ada soal yang belum dijawab!')

    global.mathSession[sender] = { jawaban, soal }

    await replyalya(`🧮 *MATH QUIZ* [${mode.toUpperCase()}]\n\n❓ Berapa hasil dari: *${soal}*?\n\n⏱️ Waktu: ${waktu / 1000} detik`)

    setTimeout(() => {
      if (global.mathSession && global.mathSession[sender]) {
        alya.sendMessage(from, { text: `⏰ Waktu habis!\n✅ Jawaban: *${jawaban}*` }, { quoted: m })
        delete global.mathSession[sender]
      }
    }, waktu)
  }
}
