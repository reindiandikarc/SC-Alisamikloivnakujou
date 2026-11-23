// Plugin: interaksi
// Fixed for V13: support waifu AND husbu
// Commands: interaksi

const path = require('path')

module.exports = {
  command: ["interaksi"],
  tags: ['romance'],
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

        let users = global.db.users[m.sender]

        // Support both waifu AND husbu
        const punyaWaifu = users.waifu && users.waifu.name
        const punyaHusbu = users.husbu && users.husbu.name

        if (!punyaWaifu && !punyaHusbu) return replyalya("😔 Gak ada yang bisa diajak interaksi. Nikahin waifu/husbu dulu~")

        users.lastInteraksi ??= 0
        let cooldownInteraksi = 300000
        let timeLapseInteraksi = Date.now() - users.lastInteraksi
        if (timeLapseInteraksi < cooldownInteraksi) {
            let sisaInteraksi = Math.ceil((cooldownInteraksi - timeLapseInteraksi) / 1000)
            return replyalya(`⏳ Jangan agresif amat bray, dia lagi malu. Tunggu ${sisaInteraksi} detik lagi.`)
        }

        users.lastInteraksi = Date.now()

        // Interaksi dengan Waifu
        if (punyaWaifu) {
            let aksiWaifu = ["mengelus kepalanya dengan lembut", "memeluknya dari belakang", "menggenggam tangannya erat", "mencium keningnya", "memuji kecantikannya hari ini"]
            let randomAksi = aksiWaifu[Math.floor(Math.random() * aksiWaifu.length)]
            users.waifu.affection ??= 0
            users.waifu.affection += 2
            return replyalya(`🥰 Lu *${randomAksi}*.\n*${users.waifu.name}* tersipu malu dan makin nempel sama lu.\n\n📈 Affection +2 (Total: ${users.waifu.affection})`)
        }

        // Interaksi dengan Husbu
        if (punyaHusbu) {
            let aksiHusbu = ["mengusap rambutnya perlahan", "memeluknya dengan hangat", "menggenggam tangannya", "menyandarkan kepala ke bahunya", "memuji kegantengannya hari ini"]
            let randomAksi = aksiHusbu[Math.floor(Math.random() * aksiHusbu.length)]
            users.husbu.affection ??= 0
            users.husbu.affection += 2
            return replyalya(`💙 Lu *${randomAksi}*.\n*${users.husbu.name}* tersenyum hangat dan makin manja sama lu.\n\n📈 Affection +2 (Total: ${users.husbu.affection})`)
        }
    }
}
