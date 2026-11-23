// Plugin: ramlist
// Auto-generated from Alya V12
// Commands: ramlist

const path = require('path')

module.exports = {
  command: ["ramlist"],
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

    const owned = `6283166570663@s.whatsapp.net`
    const text12 = AlyaWaktu + ` *@${sender.split("@")[0]}*

    ▭▬▭▬▭( *SERVER V1* )▭▬▭▬▭

    .1gb [username,nomor]
    .2gb [username,nomor]
    .3gb [username,nomor]
    .4gb [username,nomor]
    .5gb [username,nomor]
    .6gb [username,nomor]
    .7gb [username,nomor]
    .8gb [username,nomor]
    .unli [username,nomor]

    Contoh:
    .ram username,nomor
    .1gb alya,6283166570663
    ▬▭▬▭▬▭▬▭▬▭▬▭▬

    ▭▬▭▬▭( *SERVER V2* )▭▬▭▬▭

    .srv21gb [username,nomor]
    .srv22gb [username,nomor]
    .srv23gb [username,nomor]
    .srv24gb [username,nomor]
    .srv25gb [username,nomor]
    .srv26gb [username,nomor]
    .srv27gb [username,nomor]
    .srv2unli [username,nomor]

    Contoh:
    .srv2(RAM PANEL) username,nomor
    .srv21gb alya,6283166570663
    ▬▭▬▭▬▭▬▭▬▭▬▭▬`
    alya.sendMessage(from, { text: text12, contextInfo: { mentionedJid: [sender, owned], forwardingScore: 9999, isForwarded: true }}, { quoted: m })
//     } freya = fs.readFileSync('./freya/ramlist.mp3')
    alya.sendMessage(m.chat, {audio: freya, mimetype:'audio/mpeg', ptt:true }, {quoted:m})
  }
}
