// Plugin: portofolio
// Auto-generated from Alya V12
// Commands: portofolio

const path = require('path')

module.exports = {
  command: ["portofolio"],
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
      let u = db.users[m.sender]

      if (!u.portofolio) {
        u.portofolio = {
          active: false,
          type: null,
          amount: 0,
          start: 0,
          end: 0,
          market: null
        }
      }

      let typeAlt = (args[0] || '').toLowerCase()
      const amount = parseInt(args[1])

      const configs = {
        konservatif: { hours: 6, min: -2, max: 8 },
        moderat: { hours: 12, min: -10, max: 25 },
        agresif: { hours: 24, min: -30, max: 60 }
      }

      if (!configs[type]) {
        return replyalya(
    `❌ *TIPE PORTOFOLIO TIDAK VALID*

    📊 Pilihan:
    • konservatif → 6 jam
    • moderat → 12 jam
    • agresif → 24 jam

    📌 Contoh:
    .portofolio moderat 20000000`
        )
      }

      if (!amount || amount < 10_000_000)
        return replyalya('❌ Minimal investasi Rp 10.000.000')

      if (u.money < amount)
        return replyalya('💸 Uangmu tidak cukup')

      if (u.portofolio.active)
        return replyalya('⏳ Kamu masih punya portofolio aktif')

      const now = Date.now()
      const durasiMs = configs[type].hours * 60 * 60 * 1000
      const selesai = now + durasiMs

      u.money -= amount
      u.portofolio = {
        active: true,
        type,
        amount,
        start: now,
        end: selesai,
        market: ['IDX', 'US', 'CRYPTO', 'TECH'][Math.floor(Math.random() * 4)]
      }

      const mulaiJam = new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      const selesaiJam = new Date(selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

      replyalya(`
    📁 *PORTOFOLIO DIBUKA*

    📊 Tipe: *${typeAlt.toUpperCase()}*
    🌐 Pasar: ${u.portofolio.market}

    ⏱️ Durasi: *${configs[type].hours} jam*
    🕒 Mulai: ${mulaiJam}
    🕔 Selesai: ${selesaiJam}

    💸 Modal: Rp ${amount.toLocaleString()}
    🧾 Status: AKTIF
    `)
  }
}
