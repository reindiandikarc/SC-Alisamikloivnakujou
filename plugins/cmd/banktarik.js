// Plugin: banktarik
// Auto-generated from Alya V12
// Commands: banktarik

const path = require('path')

module.exports = {
  command: ["banktarik"],
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

      if (!m.isGroup) return replytolak(mess.only.group)

      const xpperlimit = 1
      const ADMIN_FEE = 0.12 // 12%
      let userAlt = global.db.users[m.sender]

      if (user.atm == 0)
        return replyalya('❌ Kamu belum mempunyai kartu ATM!')

      let count = args[0]

      if (count && /all/i.test(count)) {
        count = Math.floor(user.bank / xpperlimit)
      } else {
        count = parseInt(count)
      }

      if (!count || count < 1)
        return replyalya('❌ Masukkan jumlah yang valid\nContoh: .banktarik 100 atau .banktarik all')

      let total = xpperlimit * count
      let biayaAdmin = Math.floor(total * ADMIN_FEE)
      let diterima = total - biayaAdmin

      if (user.bank < total)
        return replyalya(`❌ Saldo bank kamu tidak cukup!\n\n🏦 Saldo: Rp ${user.bank.toLocaleString()}\n💸 Diminta: Rp ${total.toLocaleString()}`)

      user.bank -= total
      user.money += diterima

      replyalya(`
    🏧 *TARIK SALDO BANK BERHASIL*

    💰 Jumlah ditarik : Rp ${total.toLocaleString()}
    💸 Biaya admin (12%) : Rp ${biayaAdmin.toLocaleString()}
    💵 Diterima : Rp ${diterima.toLocaleString()}

    🏦 Sisa saldo di atm : Rp ${user.bank.toLocaleString()}
    💳 Saldo dompet : Rp ${user.money.toLocaleString()}
    `)
  }
}
