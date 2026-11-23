// Plugin: bratimg
// Auto-generated from Alya V12
// Commands: bratgambar, bratimg

const path = require('path')

module.exports = {
  command: ["bratgambar", "bratimg"],
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

    const db = global.db
        if (!text) return m.reply('⚠️ Teksnya mana?')
        let biaya = 1
        if (db.users[m.sender].limit < biaya) {
            return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
        }
        await alya.sendMessage(m.chat, {
            react: { text: "⏳", key: m.key }
        })
        const axios = require('axios')
        const bratUrl = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}&background=%23ffffff&color=%23000000&emojiStyle=apple`

        let imageBuffer
        try {
            const response = await axios.get(bratUrl, { responseType: 'arraybuffer' })
            imageBuffer = Buffer.from(response.data, 'binary')
        } catch (err) {
            console.error(err)
            return replyalya("❌ Gagal mengambil gambar Brat.")
        }
        let hdBuffer
        try {
            try {
                hdBuffer = await hdr(imageBuffer, 4)
            } catch {
                hdBuffer = await hdr(imageBuffer, 2)
            }
        } catch (err) {
            console.error(err)
            return replyalya("❌ Gagal memproses gambar ke HD.")
        }
        try {
            await alya.sendImageAsSticker(m.chat, hdBuffer, m, { packname: global.packname })
            db.users[m.sender].limit -= biaya
            await alya.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            })
        } catch (err) {
            console.error(err)
            return replyalya("❌ Gagal mengirim stiker.")
        }
  }
}
