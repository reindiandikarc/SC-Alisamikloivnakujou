// Plugin: listjadibot
// Fixed by: reindiandikarc
// Commands: listjadibot

const path = require('path')
const fs = require('fs')
const rootDir = path.join(__dirname, '../../')

module.exports = {
  command: ["listjadibot"],
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
      // Ambil dari global.conns (yang aktif/connected)
      const activeConns = (global.conns || []).filter(c => c && c.user)

      // Ambil juga dari folder rentbot (termasuk yang belum konek ulang)
      const rentbotPath = path.join(rootDir, 'database/rentbot')
      let folders = []
      if (fs.existsSync(rentbotPath)) {
        folders = fs.readdirSync(rentbotPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name)
      }

      if (activeConns.length === 0 && folders.length === 0) {
        return alya.sendMessage(from, { text: '📭 Belum ada pengguna yang menjalankan jadibot.' }, { quoted: m })
      }

      let te = `*〔 LIST JADIBOT 〕*\n\n`
      let mentions = []

      // Dari active conns
      if (activeConns.length > 0) {
        te += `*🟢 Sedang Aktif (${activeConns.length}):*\n`
        for (let conn of activeConns) {
          try {
            const jid = conn.decodeJid(conn.user.id)
            mentions.push(jid)
            te += ` • @${jid.split('@')[0]}\n`
          } catch (_) {}
        }
        te += `\n`
      }

      // Dari folder (semua yang punya sesi tersimpan)
      if (folders.length > 0) {
        te += `*📁 Sesi Tersimpan (${folders.length}):*\n`
        for (let num of folders) {
          te += ` • ${num}\n`
        }
      }

      alya.sendMessage(from, { text: te.trim(), mentions }, { quoted: m })
    } catch (err) {
      alya.sendMessage(from, { text: '❌ Gagal mengambil list jadibot: ' + (err.message || err) }, { quoted: m })
    }
  }
}
