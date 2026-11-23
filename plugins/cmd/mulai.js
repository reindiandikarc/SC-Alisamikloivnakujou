// Plugin: mulai
// Auto-generated from Alya V12
// Commands: abaikan, mulai

const path = require('path')

module.exports = {
  command: ["abaikan", "mulai"],
  tags: ['ai'],
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

    if (m.isGroup) return reply('Fitur Tidak Dapat Digunakan Untuk Group!')
    this.anonymous = this.anonymous ? this.anonymous : {}
    if (Object.values(this.anonymous).find(room => room.check(m.sender))) {
    reply(`Kamu Masih Berada Di dalam Sesi Anonymous\n\n${prefix}keluar -- _keluar dari sesi chat_`)
    return false
    }
    let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender))
    if (room) {
    alya.sendMessage(room.a, {text: `Berhasil Menemukan Partner, sekarang kamu dapat mengirim pesan\n\n${prefix}skip -- _mencari partner lain_\n${prefix}stop -- _menghentikan sesi chat_`})
    room.b = m.sender
    room.state = 'CHATTING'
    reply(`Berhasil Menemukan Partner, sekarang kamu dapat mengirim pesan\n\n${prefix}skip -- _mencari partner lain_\n${prefix}stop -- _menghentikan sesi chat_`)
    } else {
    let id = + new Date
    this.anonymous[id] = {
    id,
    a: m.sender,
    b: '',
    state: 'WAITING',
    check: function (who = '') {
    return [this.a, this.b].includes(who)
    },
    other: function (who = '') {
    return who === this.a ? this.b : who === this.b ? this.a : ''
    },
    }
    reply(`Mohon Tunggu Sedang Mencari Partner`)
    }
  }
}
