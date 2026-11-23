// Plugin: unban
// Auto-generated from Alya V12
// Commands: unban

const path = require('path')

module.exports = {
  command: ["unban"],
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

        if (!Ryuu) return reply('❌ Hanya Owner yang bisa menggunakan perintah ini!')
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
        if (!who) return reply('Tag user yang ingin di-unban!')

        // Auto-init user kalau belum ada di database
        if (!global.db.users[who]) {
            global.db.users[who] = {
                afkTime: -1, afkReason: '', premiumTime: 0, premium: false,
                money: 0, exp: 0, level: 0, limit: 0, freelimit: 0,
                lastclaim: 0, registered: false, name: who.split('@')[0],
                banned: false, bannedTime: 0, warning: 0, WarnReason: ''
            }
            return reply(`✅ User *@${who.split('@')[0]}* tidak ada di database dan tidak dalam status ban.`)
        }

        if (!global.db.users[who].banned) return reply(`ℹ️ User *@${who.split('@')[0]}* tidak sedang dalam status ban.`)

        global.db.users[who].banned = false
        global.db.users[who].bannedTime = 0
        try { require('../../lib/dbwriter').markDirty() } catch(e) {}
        reply(`✅ Akses user *@${who.split('@')[0]}* telah dipulihkan.`)
  }
}
