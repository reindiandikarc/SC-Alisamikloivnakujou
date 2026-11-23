// Plugin: cekidgc
// Auto-generated from Alya V12
// Commands: cekidch, cekidgc

const path = require('path')

module.exports = {
  command: ["cekidch", "cekidgc"],
  tags: ['info'],
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

    if (!isPrem) return replyprem(mess.premium)
    let getGroups = await alya.groupFetchAllParticipating()
    let groups = Object.entries(getGroups).slice(0).map((entry) => entry[1])
    let anu = groups.map((v) => v.id)
    let teks = `⬣ *LIST GROUP DI BAWAH*\n\nTotal Group : ${anu.length} Group\n\n`
    for (let x of anu) {
    let metadata2 = await alya.groupMetadata(x)
    teks += `◉ Nama : ${metadata2.subject}\n◉ ID : ${metadata2.id}\n◉ Member : ${metadata2.participants.length}\n\n────────────────────────\n\n`
    }
    reply(teks + `Untuk Penggunaan Silahkan Ketik Command ${prefix}pushkontakv3 id|teks\n\nSebelum Menggunakan Silahkan Salin Dulu Id Group Nya Di Atas`)
  }
}
