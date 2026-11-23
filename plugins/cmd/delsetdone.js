// Plugin: delsetdone
// Auto-generated from Alya V12
// Commands: delsetdone

const path = require('path')

module.exports = {
  command: ["delsetdone"],
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

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!isAdmins) return replytolak('Fitur Khusus admin!')
    if (!isSetDone(m.chat, set_done)) return reply(`Belum ada set done di gc ini`)
    removeSetDone(m.chat, set_done)
    reply(`Sukses delete set done`)
// [REMOVED]     case'proses':{
      if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    			if (!m.quoted) return m.reply('Reply pesanan yang akan proses')
                let tek = m.quoted ? quoted.text : quoted.text.split(args[0])[1]
                let proses = `── 「 *DETAIL PESANAN* 」 ──\n\n\`\`\`› Status : 「 Transaksi Pending 」\n› Pesanan : @user\n› Date : @tanggal\n› Clock : @jam\n› Status Pesanan : Diproses ⌛\n› Catatan Pesanan 📝 :\`\`\`\n*@pesanan*\n\n_*Tunggu Sebentar, Orderan Kamu Sedang Diproses Oleh Admin @admin.*_`
                const getTextP = getTextSetProses((m.isGroup? m.chat: botNumber), set_proses);
                if (getTextP !== undefined) {
                	var anunya = (getTextP.replace('@pesanan', tek ? tek : '-').replace('@user', '@' + m.quoted.sender.split("@")[0]).replace('@admin', pushname).replace('@jam', time).replace('@tanggal', tanggal(new Date())).replace('@user', '@' + m.quoted.sender.split("@")[0]))
                    alya.sendTextWithMentions(m.chat, anunya, m)
                } else {
       alya.sendTextWithMentions(m.chat, (proses.replace('@pesanan', tek ? tek : '-').replace('@user', '@' + m.quoted.sender.split("@")[0]).replace('@admin', pushname).replace('@jam', time).replace('@tanggal', tanggal(new Date())).replace('@user', '@' + m.quoted.sender.split("@")[0])), m)
                }
                }
  }
// [REMOVED] }
