// Plugin: autosahurtoggle
// Auto-generated from Alya V12
// Commands: autosahurtoggle

const path = require('path')

module.exports = {
  command: ["autosahurtoggle"],
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

        if (!Ryuu) return replytolak(mess.only.owner)

        let gid = args[0]
        if (!gid) return replyalya("❌ ID grup tidak ditemukan.")

        let metadata = await alya.groupMetadata(gid)

        if (autosahurData[gid]) {
            delete autosahurData[gid]
            fs.writeFileSync(autosahurFile, JSON.stringify(autosahurData, null, 2))
            replyalya(`❌ Auto Sahur dimatikan di:\n${metadata.subject}`)
        } else {
            autosahurData[gid] = true
            fs.writeFileSync(autosahurFile, JSON.stringify(autosahurData, null, 2))
            replyalya(`✅ Auto Sahur diaktifkan di:\n${metadata.subject}`)
        }
  }
}
