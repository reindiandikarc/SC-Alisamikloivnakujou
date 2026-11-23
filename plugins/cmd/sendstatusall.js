// Plugin: sendstatusall
// Auto-generated from Alya V12
// Commands: sendstatusall

const path = require('path')

module.exports = {
  command: ["sendstatusall"],
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

      // sendstatusall: HANYA owner yang boleh broadcast ke semua grup
      // Premium hanya boleh ke grup terdaftar (lewat sendstatus)
      if (!Ryuu) {
        return replyalya(
    `⛔ *AKSES DITOLAK!*

    Fitur *broadcast ke SEMUA grup* hanya untuk *Owner Bot* 👑

    💎 Premium Member hanya bisa broadcast ke grup yang terdaftar via *.upswgc*`
        )
      }
      const fs = require("fs")

      const contentDecoded = JSON.parse(decodeURIComponent(args.join(' ')))
      let getGroups = await alya.groupFetchAllParticipating()
      let grupList = Object.keys(getGroups)

      let success = 0
      let failed = 0

      await alya.sendText(m.chat, `📢 Memulai broadcast ke ${grupList.length} grup...`)

      for (let i = 0; i < grupList.length; i++) {
        let gid = grupList[i]
        try {
          await groupStatus(gid, contentDecoded)
          success++
        } catch (e) {
          failed++
        }
        await new Promise(res => setTimeout(res, 1500))
        if ((i + 1) % 5 === 0) {
          await alya.sendText(m.chat, `Progress: ${i + 1}/${grupList.length} grup diproses...`)
        }
      }
      if (contentDecoded?.image?.url && fs.existsSync(contentDecoded.image.url)) fs.unlinkSync(contentDecoded.image.url)
      if (contentDecoded?.video?.url && fs.existsSync(contentDecoded.video.url)) fs.unlinkSync(contentDecoded.video.url)
      if (contentDecoded?.audio?.url && fs.existsSync(contentDecoded.audio.url)) fs.unlinkSync(contentDecoded.audio.url)

      alya.sendText(m.chat,
    `📢 *Broadcast Selesai*

    ✅ Berhasil : ${success} grup
    ❌ Gagal    : ${failed} grup
    📊 Total    : ${grupList.length} grup`)
  }
}
