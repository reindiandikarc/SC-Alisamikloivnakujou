// Plugin: klaimporto
// Auto-generated from Alya V12
// Commands: jadwalbandara, klaimporto

const path = require('path')

module.exports = {
  command: ["jadwalbandara", "klaimporto"],
  tags: ['ai'],
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
      let u = db.users[m.sender]
      let p = u.portofolio

      if (!p || !p.active)
        return replyalya('❌ Tidak ada portofolio aktif')

      const now = Date.now()

      if (now < p.end) {
        const sisaMs = p.end - now
        const sisaJam = Math.floor(sisaMs / 3600000)
        const sisaMenit = Math.floor((sisaMs % 3600000) / 60000)

        const selesaiJam = new Date(p.end).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })

        return replyalya(`
    ⏳ *PORTOFOLIO MASIH BERJALAN*

    📊 Tipe: ${p.type.toUpperCase()}
    🌐 Pasar: ${p.market}

    ⏱️ Sisa Waktu: *${sisaJam} jam ${sisaMenit} menit*
    `)
      }

      const riskMap = {
        konservatif: { min: -2, max: 8 },
        moderat: { min: -10, max: 25 },
        agresif: { min: -30, max: 60 }
      }

      const risk = riskMap[p.type]
      const percent = Math.floor(Math.random() * (risk.max - risk.min + 1) + risk.min)
      const hasil = Math.max(0, Math.floor(p.amount * (1 + percent / 100)))

      u.bank += hasil
      u.portofolio.active = false

      const durasiJam = Math.floor((p.end - p.start) / 3600000)
      const durasiMenit = Math.floor(((p.end - p.start) % 3600000) / 60000)

      replyalya(`
    🏦 *PORTOFOLIO SELESAI*

    📊 Tipe: ${p.type.toUpperCase()}
    🌐 Pasar: ${p.market}

    💸 Modal: Rp ${p.amount.toLocaleString()}
    📈 Perubahan: ${percent > 0 ? '+' : ''}${percent}%
    💰 Diterima: Rp ${hasil.toLocaleString()}

    ⏱️ Durasi: ${durasiJam} jam ${durasiMenit} menit
    `)
  }
}
