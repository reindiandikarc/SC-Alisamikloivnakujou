// Plugin: antipromosi
// Auto-generated from Alya V12
// Commands: antipromosi

const path = require('path')

module.exports = {
  command: ["antipromosi"],
  tags: ['admin'],
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

    const db = global.db
        if (!m.isGroup) return replyalya(mess.only.group)
        if (!isBotAdmins) return replyalya('❌ Bot harus admin!')
        if (!isAdmins && !Ryuu) return replyalya('❌ Khusus admin!')

        if (!db.data.chats[m.chat].antipromosi) {
            db.data.chats[m.chat].antipromosi = {
                status: false,
                count: {}
            }
        }

        let mode = (q || '').toLowerCase()

        if (mode === 'on') {
            if (db.data.chats[m.chat].antipromosi.status)
                return replyalya('✅ Sudah aktif!')

            db.data.chats[m.chat].antipromosi.status = true

            replyalya('✅ Anti promosi *diaktifkan!*')

        } else if (mode === 'off') {
            if (!db.data.chats[m.chat].antipromosi.status)
                return replyalya('❌ Sudah nonaktif!')

            db.data.chats[m.chat].antipromosi.status = false
            db.data.chats[m.chat].antipromosi.count = {}

            replyalya('❌ Anti promosi *dimatikan!*')

        } else {
            replyalya(`📌 Penggunaan:\n${prefix}antipromosi on\n${prefix}antipromosi off`)
        }
  }
}
