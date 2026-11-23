// Plugin: setspotify
// Auto-generated from Alya V12
// Commands: setspotify

const path = require('path')

module.exports = {
  command: ["setspotify"],
  tags: ['downloader'],
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

        if (!text) return replyalya('❌ Masukkan token baru!')
        const fs = require('fs')
        const path = require('path')
        const settingsPath = path.join(__dirname, 'settings.js')
        let settingsRaw = fs.readFileSync(settingsPath, 'utf-8')
        const newSettings = settingsRaw.replace(
            /global\.spotify_backup_token\s*=\s*['"].*['"]/,
            `global.spotify_backup_token = '${text}'`
        )
        fs.writeFileSync(settingsPath, newSettings, 'utf-8')
        global.spotify_backup_token = text
        replyalya('✅ Backup Spotify token berhasil diperbarui!')
  }
}
