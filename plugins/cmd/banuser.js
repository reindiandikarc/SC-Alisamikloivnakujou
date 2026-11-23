// Plugin: banuser
// Fix: tambah command 'ban' + durasi ban seperti V12
// Commands: ban, banned, banuser

const path = require('path')

module.exports = {
  command: ["ban", "banned", "banuser"],
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
        let who = m.mentionedJid && m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : args[0]
                    ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : null

        if (!who) return reply(`Tag atau masukkan nomor user yang ingin di-ban!\nContoh: *${prefix}ban @user 1d* (d = hari, h = jam, m = menit)`)

        // Auto-init user kalau belum ada di database
        if (!global.db.users[who]) {
            global.db.users[who] = {
                afkTime: -1, afkReason: '', premiumTime: 0, premium: false,
                money: 0, exp: 0, level: 0, limit: 0, freelimit: 0,
                lastclaim: 0, registered: false, name: who.split('@')[0],
                banned: false, bannedTime: 0, warning: 0, WarnReason: ''
            }
        }

        let u = global.db.users[who]

        let duration
        if (m.mentionedJid && m.mentionedJid[0]) {
            // Mode tag @user: .ban @user 1d  → args=['@628xxx','1d']
            duration = (args[1] && /^\d+[dhm]$/i.test(args[1])) ? args[1] : '1d'
        } else if (m.quoted) {
            // Mode reply: .ban 1d  → args=['1d']
            duration = (args[0] && /^\d+[dhm]$/i.test(args[0])) ? args[0] : '1d'
        } else {
            // Mode nomor: .ban 628xxx 1d  → args=['628xxx','1d']
            duration = (args[1] && /^\d+[dhm]$/i.test(args[1])) ? args[1] : '1d'
        }

        let timer = 0
        if (duration.endsWith('m')) timer = parseInt(duration) * 60000
        else if (duration.endsWith('h')) timer = parseInt(duration) * 3600000
        else if (duration.endsWith('d')) timer = parseInt(duration) * 86400000
        else timer = 86400000 // Default 1 hari

        u.banned = true
        u.bannedTime = Date.now() + timer

        reply(`✅ Berhasil Ban user *@${who.split('@')[0]}*\n⏳ Durasi: ${duration}\nBot tidak akan merespon user tersebut sampai masa hukuman selesai.`, null, { mentions: [who] })
  }
}
