// Plugin: tomp3
// Fixed for Alya V13
// Commands: tomp3

const path = require('path')

module.exports = {
  command: ["tomp3"],
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

    if (!quoted) return replyalya('🎵 Reply video atau voice note yang ingin diconvert ke MP3.')
    if (!/video|audio/.test(mime)) return replyalya('🎵 Hanya bisa mengconvert video atau audio.')

    try {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const fs = require('fs')
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const media = await alya.downloadAndSaveMediaMessage(quoted)
      const outputPath = media.replace(/\.[^/.]+$/, '') + '_converted.mp3'

      // Konversi ke MP3 menggunakan ffmpeg
      await execAsync(`ffmpeg -i "${media}" -vn -ar 44100 -ac 2 -b:a 192k "${outputPath}" -y`)

      const buffer = fs.readFileSync(outputPath)

      await alya.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `converted_${Date.now()}.mp3`,
        ptt: false
      }, { quoted: m })

      fs.unlinkSync(media)
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error(e)
      replyalya(`❌ Gagal convert ke MP3: ${e.message}`)
    }
  }
}
