// Plugin: jadibot
// Fixed by: reindiandikarc
// Commands: jadibot

const path = require('path')
const { jadibot } = require('../../lib/clone')

module.exports = {
  command: ["jadibot"],
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
      waifuList, husbuList, pler, setting, user,
      mess
    } = ctx

    // Cek premium
    if (!isPrem) return replyprem(mess?.premium || 'Fitur ini hanya untuk pengguna premium!')

    // Cek apakah sudah ada di global.conns
    if (global.conns && global.conns.find(c => c.user && alya.decodeJid && c.decodeJid && c.decodeJid(c.user.id) === sender)) {
      return reply('Kamu sudah menjalankan jadibot sebelumnya! Ketik *.stopjadibot* untuk menghentikannya.')
    }

    // Cek input nomor HP
    if (!text) {
      return reply(`*[ JADIBOT ]*\n\nMasukan nomor HP kamu beserta kode negara.\nContoh: *.jadibot 628xxxxxxxx*`)
    }

    // Bersihkan nomor: hapus +, spasi, strip
    const phoneNumber = text.replace(/[^0-9]/g, '')
    if (phoneNumber.length < 7) {
      return reply('❌ Nomor HP tidak valid! Contoh: *.jadibot 628xxxxxxxx*')
    }

    await reply(`⏳ Memproses jadibot untuk nomor *${phoneNumber}*...\nTunggu kode pairing dikirimkan.`)
    jadibot(alya, m, from, phoneNumber)
  }
}
