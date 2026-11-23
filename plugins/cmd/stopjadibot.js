// Plugin: stopjadibot
// Fixed by: reindiandikarc
// Commands: stopjadibot

const path = require('path')
const fs = require('fs')
const rootDir = path.join(__dirname, '../../')

module.exports = {
  command: ["stopjadibot"],
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

    try {
      // Cari jadibot milik sender di global.conns
      let jadibotIndex = -1
      if (global.conns && global.conns.length > 0) {
        jadibotIndex = global.conns.findIndex(conn => {
          try {
            return conn && conn.user && conn.decodeJid && conn.decodeJid(conn.user.id) === sender
          } catch { return false }
        })
      }

      if (jadibotIndex === -1) {
        return alya.sendMessage(from, { text: '❌ Kamu belum menjalankan jadibot atau sudah dihentikan.' }, { quoted: m })
      }

      let jadibotInstance = global.conns[jadibotIndex]
      const jadibotJid = jadibotInstance.decodeJid(jadibotInstance.user.id)
      const senderNum = jadibotJid.split('@')[0]

      // Logout koneksi
      try { await jadibotInstance.logout() } catch (_) {}

      // Hapus folder sesi rentbot — path dari root project
      const sessionPath = path.join(rootDir, `database/rentbot/${senderNum}`)
      try {
        if (fs.existsSync(sessionPath)) {
          const rimraf = require('rimraf')
          rimraf.sync(sessionPath)
        }
      } catch (_) {}

      // Hapus dari global.conns
      global.conns.splice(jadibotIndex, 1)

      alya.sendMessage(from, { text: `✅ Jadibot berhasil dihentikan dan sesi dihapus.\nNomor: *${senderNum}*` }, { quoted: m })
    } catch (err) {
      alya.sendMessage(from, { text: '❌ Gagal menghentikan jadibot: ' + (err.message || err) }, { quoted: m })
    }
  }
}
