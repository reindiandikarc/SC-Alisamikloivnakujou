// Plugin: p
// Auto-generated from Alya V12
// Commands: p

const path = require('path')

module.exports = {
  command: ["p"],
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

        if (!global.lastP) global.lastP = {}
        const cooldown = 5000

        if (global.lastP[m.sender] && Date.now() - global.lastP[m.sender] < cooldown) {
            return replyalya('pa pe pa pe atheis')
        }
        global.lastP[m.sender] = Date.now()

        const roastMember = [
        'pa pe pa pe atheis',
        'minimal salam bujank.',
        'Huruf P itu singkatan dari *Permisi* kan? 😌',
        'Sopan itu gratis, tinggal ketik salam 😉',
        'Dateng cuma huruf P doang, effort lu setipis tisu warteg 🥲',
        'Pe lagi Pe lagi… keyboard lu rusak apa emang stok kosakata segitu doang?',
        'Minimal salam kek manusia, jangan kayak NPC side quest.',
        'Huruf P mulu, gue kira lagi tes mic.',
        'Dateng cuma bawa P, kayak paket COD tapi isinya batu.',
        'Lu kalo jadi WiFi pasti lemot, sinyalnya cuma 1 huruf.',
        'Chat lu minimalis banget, IKEA aja kalah.',
        'Typing lama, kirimnya cuma P. Plot twist banget.',
        'Huruf lain pada demo kali ya ga mau dipake? 😭'
    ]

    const roastAdmin = [
        'Hehe adminnya datang 😄 jangan lupa salam ya',
        'Admin datang,tapi salam dulu minimal 🙏',
        'Admin sih admin… tapi salam dulu biar auranya naik',
        'Admin hadir 🙌 tapi jangan lupa etika dong min~',
        'Pe mulu, tapi salam tetep nomor satu ya min 😎'
    ]

        const getRandom = arr => arr[Math.floor(Math.random() * arr.length)]

        if (Math.random() < 0.2) {
            replyalya('pa pe pa pe atheis')
        }

        if (isGroupAdmins | Ryuu) {
            replyalya(getRandom(roastAdmin))
        } else {
            replyalya(getRandom(roastMember))
        }
  }
}
