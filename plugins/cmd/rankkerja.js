// Plugin: rankkerja
// Ported from Alya V10
// Commands: rankkerja
// Fix: textAlt dideclare tapi text dipakai (crash ReferenceError)

const path = require('path')

module.exports = {
  command: ["rankkerja"],
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

        let users = Object.entries(global.db.users)
        let ranking = users
            .map(([id, u]) => ({
                id,
                total: (u.money || 0) + (u.bank || 0),
                money: u.money || 0,
                bank: u.bank || 0,
                name: u.name || id.split('@')[0]
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)

        if (!ranking.length) return replyalya('❌ Belum ada data pengguna.')

        let rankText = `*───〔 🏆 HALL OF FAME 〕───*\n\n`

        ranking.forEach((u, i) => {
            let badge = (i === 0) ? "🥇" : (i === 1) ? "🥈" : (i === 2) ? "🥉" : "🔹"

            rankText += `${badge} *RANK ${i + 1}* - @${u.id.split('@')[0]}\n`
            rankText += `   ├  *User:* ${u.name}\n`
            rankText += `   ├  *Money:* Rp ${u.money.toLocaleString('id-ID')}\n`
            rankText += `   ├  *Bank:* Rp ${u.bank.toLocaleString('id-ID')}\n`
            rankText += `   └  *Total:* Rp ${u.total.toLocaleString('id-ID')}\n\n`
        })

        rankText += `*────────────────────*`

        alya.sendMessage(m.chat, {
            text: rankText,
            mentions: ranking.map(v => v.id)
        }, { quoted: m })
  }
}
