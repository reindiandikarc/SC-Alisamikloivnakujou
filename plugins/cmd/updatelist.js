// Plugin: updatelist
// Auto-generated from Alya V12
// Commands: updatelist

const path = require('path')

module.exports = {
  command: ["updatelist"],
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
    var args1 = q.split("|")[0].toLowerCase()
    var args2 = q.split("|")[1]
    if (!q.includes("|")) return reply(`Gunakan dengan cara ${prefix+command} *key|response*\n\n_Contoh_\n\n${prefix+command} tes|apa`)
    if (!isAlreadyResponListGroup(m.chat, db_respon_list)) return reply(`Maaf, untuk key *${args1}* belum terdaftar di group ini`)
    if (/image/.test(mime)) {
    let media = await alya.downloadAndSaveMediaMessage(quoted)
                    let mem = await uploadwidipe(media)
    updateResponList(m.chat, args1, args2, true, mem, db_respon_list)
    reply(`Sukses update respon list dengan key *${args1}*`)
    if (fs.existsSync(media)) fs.unlinkSync(media)
    } else {
    updateResponList(m.chat, args1, args2, false, '-', db_respon_list)
    reply(`Sukses update respon list dengan key *${args1}*`)
  }
}
}
