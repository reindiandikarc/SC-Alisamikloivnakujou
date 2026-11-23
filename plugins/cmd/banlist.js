// Plugin: banlist
// Auto-generated from Alya V12
// Commands: listban, banlist

const path = require('path')

module.exports = {
  command: ["listban", "banlist"],
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

        if (!Ryuu) return reply('❌ Hanya Owner yang bisa melihat daftar ini!')

        let users = global.db.users
        let bannedUsers = Object.keys(users).filter(jid => users[jid].banned)

        if (bannedUsers.length === 0) return reply('✅ Tidak ada user yang sedang di-ban saat ini.')

        let caption = `╔━━〔 🚫 *DAFTAR BAN* 〕━━╗\n┃\n`
        let no = 1

        for (let jid of bannedUsers) {
            let user = users[jid]
            let now = Date.now()
            let sisa = user.bannedTime - now

            let sisaTeks = ''
            if (sisa > 0) {
                let days = Math.floor(sisa / 86400000)
                let hours = Math.floor((sisa % 86400000) / 3600000)
                let minutes = Math.floor((sisa % 3600000) / 60000)
                sisaTeks = `${days}h ${hours}j ${minutes}m`
            } else {
                sisaTeks = "Permanen / Segera Lepas"
            }

            caption += `┃ ${no++}. @${jid.split('@')[0]}\n┃    ⏳ Sisa: ${sisaTeks}\n┃\n`
        }

        caption += `╚━━━━━━━━━━━━━━━━━━━━━━━╝\n\nTotal: ${bannedUsers.length} User`

        return alya.sendMessage(m.chat, { text: caption, mentions: bannedUsers }, { quoted: m })
  }
}
