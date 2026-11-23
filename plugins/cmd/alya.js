// Plugin: alya
// Auto-generated from Alya V12
// Commands: alya

const path = require('path')

module.exports = {
  command: ["alya"],
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

      if (!m.isGroup) {
        return replyalya(`*🌸 Alya V11 - AI Chat*\n\nDi private chat, Alya selalu aktif otomatis kok~ 🤖\nLangsung aja ajak ngobrol, aku dengerin kamu! (≧◡≦)`)
      }
      if (!isAdmins && !Ryuu) return replytolak(`Hmph! Fitur ini hanya untuk *admin grup*! 😤\nKamu siapa daring nyuruh-nyuruh aku?!`)
      if (args[0] === 'on') {
        if (isAutoAiGc) return replyalya(`A-aku sudah aktif di grup ini dari tadi! Makanya dengerin kalau aku ngomong! 😤`)
        openaigc.push(m.chat)
        fs.writeFileSync('./database/openaigc.json', JSON.stringify(openaigc, null, 2))
        replyalya(`✅ *Alya AI Chat Aktif!*\n\nB-bukan berarti aku senang dipanggil ya! Hmph! 😤\nSekarang aku bakal balas pesan di grup ini.\n\n*Cara manggil aku:*\n• Ketik *alya* di awal pesan\n• Reply pesan aku\n• Tag/mention aku`)
      } else if (args[0] === 'off') {
        if (!isAutoAiGc) return replyalya(`A-aku memang sudah nonaktif dari tadi... Kamu ga perhatiin aku sama sekali! 😤`)
        let idx = openaigc.indexOf(m.chat)
        if (idx > -1) openaigc.splice(idx, 1)
        fs.writeFileSync('./database/openaigc.json', JSON.stringify(openaigc, null, 2))
        replyalya(`❌ *Alya AI Chat Dinonaktifkan!*\n\nFine! Kalau gitu aku diam dulu di grup ini! Hmph! 😤\nKetik *${prefix}alya on* kalau mau aku balik lagi.`)
      } else {
        replyalya(`*🌸 Alya V11 - AI Chat Toggle*\n\n*Status:* ${isAutoAiGc ? '✅ Aktif' : '❌ Nonaktif'}\n\n*Perintah:*\n• ${prefix}alya on — Hidupkan AI chat di grup ini\n• ${prefix}alya off — Matikan AI chat di grup ini\n\n_Hanya admin yang bisa mengubah pengaturan ini!_`)
      }
    }
    // ============================================================
    // ALYA V12 - .alyaai on / .alyaai off Command (Global AI Toggle)
    // Matikan/hidupkan AI chatbot secara global: semua chat + semua grup
    // Owner only
    // ============================================================
  }
