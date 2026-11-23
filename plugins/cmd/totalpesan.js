// Plugin: totalpesan
// Auto-generated from Alya V12
// Commands: totalchat, totalpesan

const path = require('path')

module.exports = {
  command: ["totalchat", "totalpesan"],
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

        if (!m.isGroup) return replytolak(mess.only.group)
        if (!isAdmins && !Ryuu) return reply(global.mess.only.admin)

        if (!global.db.chats[m.chat]) global.db.chats[m.chat] = {}
        if (!global.db.chats[m.chat].totalChat) global.db.chats[m.chat].totalChat = {}

        const metadata = await alya.groupMetadata(m.chat)
        let groupNameAlt = metadata.subject
        const totalMembers = metadata.participants.length

        if (text && text.toLowerCase() === 'reset') {
            global.db.chats[m.chat].totalChat = {}
            return replyalya("✅ *Statistik chat berhasil di reset.*")
        }

        const entries = Object.entries(global.db.chats[m.chat].totalChat)
            .filter(([jid]) => jid.endsWith('@s.whatsapp.net'))
            .map(([jid, count]) => ({ jid, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15)

        if (entries.length === 0) {
            return m.reply(`📊 *CHAT INSIGHT*\n\n> Belum ada data chat tercatat.`)
        }

        const medals = ['🥇','🥈','🥉']
        const mentions = []

        const totalMessages = entries.reduce((sum, el) => sum + el.count, 0)

        let teks = `╭━━━〔 📊 *CHAT INSIGHT* 〕━━━⬣
    ┃ 🏷️ *Grup* : ${groupName}
    ┃ 👥 *Total Member* : ${totalMembers}
    ┃ 💬 *Total Pesan* : ${totalMessages.toLocaleString('id-ID')}
    ╰━━━━━━━━━━━━━━━━⬣

    🏆 *TOP MEMBER PALING AKTIF*
    `

        for (let i = 0; i < entries.length; i++) {
            const { jid, count } = entries[i]
            const name = jid.split('@')[0]
            const medal = medals[i] || '🏅'

            mentions.push(jid)

            let percent = ((count / totalMessages) * 100).toFixed(1)
            let bar = '▰'.repeat(Math.round(percent / 10)) + '▱'.repeat(10 - Math.round(percent / 10))

            teks += `
    ${medal} @${name}
    ┣ 💬 ${count.toLocaleString('id-ID')} pesan
    ┣ 📊 ${bar} ${percent}%
    ┗━━━━━━━━━━━━━━━
    `
        }

        teks += `
    ╭━━━〔 📈 *STATISTIK GRUP* 〕━━━⬣
    ┃ 🔝 Top Chat : ${entries[0]?.count.toLocaleString('id-ID')} pesan
    ┃ 🗂️ Member Aktif : ${entries.length}
    ┃ 👥 Total Member : ${totalMembers}
    ┃ ⚡ Tracking : Real-time
    ╰━━━━━━━━━━━━━━━━⬣

    > Gunakan *${prefix + command} reset* untuk mereset statistik
    `

        await alya.sendMessage(
            m.chat,
            { text: teks, mentions },
            { quoted: m }
        )
  }
}
