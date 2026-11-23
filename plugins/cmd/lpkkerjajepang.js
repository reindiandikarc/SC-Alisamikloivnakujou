// Plugin: lpkkerjajepang
// Auto-generated from Alya V12
// Commands: lpkkerjajepang

const path = require('path')

module.exports = {
  command: ["lpkkerjajepang"],
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

      let pesanAwal = `Cieee cieee😳 ada yang mau kerja di jepang nih, bagus itu aku Carikan dlu informasi yang bagus mengenai lpk indo yang banyak siswa yang lulus dan berhasil kerja di sana ya, serta ada dana talangan nya juga:v, ini dia👀\n\n`

      let pesanLPK = dataLPK.map((lpk, i) => {
        return (
          `🏫 *${lpk.nama}*\n` +
          `📍 Lokasi: ${lpk.lokasi}\n` +
          `🌟 Program Unggulan: ${lpk.program}\n` +
          `💰 Dana Talangan: ${lpk.danaTalangan ? '✅ Ada' : '❌ Tidak Ada'}\n` +
          `✨ Keunggulan: ${lpk.keunggulan}\n` +
          `🔗 Link Pendaftaran: ${lpk.pendaftaran}\n` +
          `📅 Jadwal: ${lpk.jadwal}\n` +
          `📞 Kontak: ${lpk.kontak}`
        )
      }).join('\n\n' + '━'.repeat(30) + '\n\n')

      let pesanAkhir = `\n\n━${'━'.repeat(29)}\n\n` +
        `📌 *Tips Sebelum Daftar LPK:*\n` +
        `• Pastikan LPK terdaftar di *Kemnaker RI*\n` +
        `• Tanya detail biaya & cicilan dana talangan\n` +
        `• Cek testimoni alumni di sosmed mereka\n` +
        `• Pelajari bahasa Jepang minimal JLPT N5\n` +
        `• Persiapkan fisik & mental untuk adaptasi\n\n` +
        `🎌 *Gambatte ne! Semangat kerja di Jepang!* 🎌\n` +
        `_Informasi bisa berubah, selalu cek langsung ke LPK terkait ya~_`

      await replyalya(pesanAwal + pesanLPK + pesanAkhir)
    }
    // ============================================================
  }
