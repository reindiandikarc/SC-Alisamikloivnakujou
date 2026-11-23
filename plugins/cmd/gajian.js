// Plugin: gajian
// Auto-generated from Alya V12
// Commands: gajian

const path = require('path')

module.exports = {
  command: ["gajian"],
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

      if (!m.isGroup) return replytolak(mess.only.group)

      function MeNit(ms) {
        let m = isNaN(ms) ? '60' : Math.floor(ms / 60000) % 60
        return [m].map(v => v.toString().padStart(2, 0) ).join(':')
      }

      function DeTik(ms) {
        let s = isNaN(ms) ? '60' : Math.floor(ms / 1000) % 60
        return [s].map(v => v.toString().padStart(2, 0) ).join(':')
      }

      let LastClaim = global.db.users[m.sender].lastclaim
      let cdm = `${MeNit(new Date - LastClaim)}`
      let cds = `${DeTik(new Date - LastClaim)}`
      let cd1 = Math.ceil(44 - cdm)
      let cd2 = Math.ceil(59 - cds)

      if (new Date - global.db.users[m.sender].lastclaim > 2700000) {
        global.db.users[m.sender].money += 50000
        global.db.users[m.sender].exp += 100

        replyalya(`Hmph! 🙄 Tuh, ambil gaji kamu! (+Rp50.000 & 100 EXP)\n\nJangan langsung dihabisin buat hal nggak berguna ya! Awas aja kalau besok balik lagi sambil nangis nggak punya duit! 💢`)

        global.db.users[m.sender].lastclaim = new Date * 1
      } else {
        return replyalya(`Duh, kamu ini nggak sabaran banget sih! 😤\nKan sudah aku kasih tadi! Kamu pikir aku cetak uang sendiri?!\n\nSana kerja lagi! Balik lagi dalam: \n⏳ ${cd1} Menit ${cd2} Detik lagi!`)
      }
  }
}
