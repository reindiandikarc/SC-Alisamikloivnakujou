// Plugin: money
// Ported from Alya V10
// Commands: money, cekuang, dompet

const path = require('path')

module.exports = {
  command: ["money", "cekuang", "dompet"],
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

        let who = m.mentionedJid && m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : args[0]
                    ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : m.sender

        let targetUser = global.db.users[who]
        if (!targetUser) return replyalya(`❌ User tidak ditemukan di database.`)

        const toRupiah = (v) => 'Rp' + (v || 0).toLocaleString('id-ID')
        const toNum = (v) => (v || 0).toLocaleString('id-ID')

        const getRank = (attr) => {
            let sorted = Object.entries(global.db.users).sort((a, b) => (b[1][attr] || 0) - (a[1][attr] || 0))
            let rank = sorted.findIndex(v => v[0] === who) + 1
            return rank > 0 ? rank : 'N/A'
        }

        let nama = targetUser.registered ? (targetUser.name || 'No Name') : alya.getName(who)
        let isSelf = who === m.sender

        replyalya(
`╔━━〔 💰 *DOMPET ${isSelf ? 'KAMU' : '@' + who.split('@')[0]}* 〕━━╗
┃
┃  👤 *Nama:* ${nama}
┃
┃  💵 *Uang:* ${toRupiah(targetUser.money)}
┃  🏦 *Bank:* ${toRupiah(targetUser.bank)}
┃  🎰 *Chips:* ${toNum(targetUser.chip)}
┃  🎟️ *Limit:* ${targetUser.limit || 0}
┃
┃  🥇 *Rank Money:* #${getRank('money')}
┃
╚━━━━━━━━━━━━━━━━━━━━━━━╝`,
        { mentions: [who] }
        )
  }
}
