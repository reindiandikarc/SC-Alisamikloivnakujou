// Plugin: savekontak
// Auto-generated from Alya V12
// Commands: savekontak

const path = require('path')

module.exports = {
  command: ["savekontak"],
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

    if (!Ryuu) return replytolak(`Khusus Owner Ajah`)
    if (!m.isGroup) return replytolak(`Fitur Ini Khusus Group`)
    let cmiggc = await alya.groupMetadata(m.chat)
    let orgiggc = participants.map(a => a.id)
    vcard = ''
    noPort = 0
    for (let a of cmiggc.participants) {
        vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`
    }
    let nmfilect = './contacts.vcf'
    reply('*Mengimpor '+cmiggc.participants.length+' kontak..*')
    fs.writeFileSync(nmfilect, vcard.trim())
    await sleep(2000)
    alya.sendMessage(m.chat, {
        document: fs.readFileSync(nmfilect), mimetype: 'text/vcard', fileName: 'Contact.vcf', caption: 'GROUP: *'+cmiggc.subject+'*\nMEMBER: *'+cmiggc.participants.length+'*'
    }, {ephemeralExpiration: 86400, quoted: m})
    fs.unlinkSync(nmfilect)
  }
}
