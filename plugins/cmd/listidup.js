// Plugin: listidup
// Auto-generated from Alya V12
// Commands: listgrup, listidup

const path = require('path')

module.exports = {
  command: ["listgrup", "listidup"],
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

        // Tampilkan semua grup terdaftar di idgrup.json
        if (!Ryuu) return replytolak('❌ Hanya owner yang bisa menggunakan perintah ini.')

        if (pler.length === 0) {
            return replyalya(
    `📭 *Belum ada grup yang terdaftar!*

    Gunakan *.addgrup* di dalam grup untuk mendaftarkan grup ke database bot.`)
        }

        let teksGrup = `╔══════════════════════════╗\n║  📋 *DAFTAR GRUP TERDAFTAR*  ║\n╚══════════════════════════╝\n\n`
        teksGrup += `💎 Grup-grup ini boleh digunakan premium member untuk *.upswgc*\n\n`

        for (let i = 0; i < pler.length; i++) {
            let namaGrup = 'Unknown'
            try { namaGrup = (await alya.groupMetadata(pler[i]).catch(() => ({}))).subject || 'Unknown' } catch {}
            teksGrup += `${i + 1}. *${namaGrup}*\n🆔 \`${pler[i]}\`\n\n`
        }

        teksGrup += `━━━━━━━━━━━━━━━\n📊 Total: *${pler.length} grup terdaftar*\n\n`
        teksGrup += `📌 *.addgrup* → Daftarkan grup ini\n📌 *.delgrup* → Hapus grup dari daftar`

        replyalya(teksGrup)
  }
}
