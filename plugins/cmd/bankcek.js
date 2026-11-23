// Plugin: bankcek
// Ported from Alya V10 - Cek saldo bank & money
// Commands: bankcek

module.exports = {
  command: ["bankcek"],
  tags: ['rpg'],
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

    let who = m.mentionedJid?.[0] || (m.quoted?.sender) || m.sender
    let u = global.db.users[who]
    if (!u) return replyalya('❌ User tidak ditemukan di database.')

    u.bank = u.bank || 0
    u.money = u.money || 0
    u.atm = u.atm || 0
    u.fullatm = u.fullatm || 0
    u.chip = u.chip || 0
    u.robo = u.robo || 0

    let caption = `
╭──「 *BANK INFO* 」──⬡
│ 👤 *Name:* ${u.registered ? u.name : await alya.getName(who)}
│ 💳 *ATM:* ${u.atm > 0 ? 'Level ' + u.atm : 'Belum punya'}
│ 🏦 *Bank:* Rp ${u.bank.toLocaleString()} / Rp ${u.fullatm.toLocaleString()}
│ 💵 *Money:* Rp ${u.money.toLocaleString()}
│ 🪙 *Chip:* ${u.chip.toLocaleString()}
│ 🤖 *Robo:* ${u.robo > 0 ? 'Level ' + u.robo : '✖️'}
├─────────────────⬡
│ 📑 *Reg:* ${u.registered ? '✅ Verified' : '❌ Unregistered'}
╰─────────────────⬡`.trim()

    replyalya(caption)
  }
}
