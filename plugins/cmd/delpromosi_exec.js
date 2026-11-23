// Plugin: delpromosi_exec
// Auto-generated from Alya V12
// Commands: delpromosi_exec

const path = require('path')

module.exports = {
  command: ["delpromosi_exec"],
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

    const db = global.db
        if (!m.isGroup) return replyalya(mess.only.group)
        if (!isAdmins && !Ryuu) return replyalya('❌ Khusus admin!')

        let data = db.data.chats[m.chat].antipromosi
        if (!data) return replyalya('❌ Data tidak ditemukan.')

        let target = text.trim()
        if (target === 'all') {
            data.count = {}
            return replyalya('✅ Semua warning berhasil direset!')
        }

        if (!data.count[target]) {
            return replyalya('❌ User tidak memiliki warning.')
        }

        delete data.count[target]

        replyalya(`✅ Warning @${target.split('@')[0]} berhasil dihapus!`, {
            mentions: [target]
        })
  }
}
