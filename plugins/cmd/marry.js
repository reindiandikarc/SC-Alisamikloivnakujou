// Plugin: marry
// Auto-generated from Alya V12
// Commands: marry

const path = require('path')

module.exports = {
  command: ["marry"],
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
        users.inventory ??= {}

        // Cek apakah user sudah punya pending gacha/pilih waifu atau husbu
        let hasWaifuPending = !!users.lastGacha
        let hasHusbuPending = !!users.lastGachaHusbu

        if (!hasWaifuPending && !hasHusbuPending) return replyalya("⚠️ Lu belum gacha/pilih waifu! Gacha dulu di *.gachawaifu* atau pilih sendiri di *.pilihwaifu <nomor>*, kalau udah cocok baru lamar.")

        if (!users.inventory.cincin || users.inventory.cincin < 1) return replyalya("❌ Lu butuh *1 Cincin Nikah* buat melamar. Beli di *.buycincin* dulu!")

        // Jika ada pending husbu
        if (hasHusbuPending && !hasWaifuPending) {
            if (users.husbu && users.husbu.name) return replyalya(`🚫 Lu udah nikah sama *${users.husbu.name}*! Jangan selingkuh, kasihan dia.`)

            let suami = users.lastGachaHusbu
            let suami_source = suami._source === 'pilihhusbu' ? 'Dipilih langsung' : 'Dari gacha'
            users.inventory.cincin -= 1
            users.husbu = {
                name: suami.name,
                anime: suami.anime,
                rarity: suami.rarity,
                source: suami_source,
                marriedAt: Date.now()
            }
            delete users.lastGachaHusbu

            let teks = `🎉 *PERNIKAHAN SAH!* 🎉\n\n`
            teks += `Selamat! @${m.sender.split('@')[0]} resmi menikah dengan *${suami.name}*.\n`
            teks += `📺 Anime: ${suami.anime}\n`
            teks += `🏆 Rarity: ${suami.rarity}\n`
            teks += `📋 Sumber: ${suami_source}\n`
            teks += `Mahar 1 unit Cincin Nikah telah dibayarkan tunai!\n\n`
            teks += `💜 *Status Nikah:* CONFIRMED 💍\n`
            teks += `Semoga langgeng terus sama husbu kesayangan ya! 💍`

            return alya.sendMessage(m.chat, { text: teks, mentions: [m.sender] }, { quoted: m })
        }

        // Default: nikah waifu
        if (users.waifu && users.waifu.name) return replyalya(`🚫 Lu udah nikah sama *${users.waifu.name}*! Jangan poligami, kasihan mental dia.`)

        let istri = users.lastGacha
        let istri_source = istri._source === 'pilihwaifu' ? 'Dipilih langsung' : 'Dari gacha'
        users.inventory.cincin -= 1
        users.waifu = {
            name: istri.name,
            anime: istri.anime,
            rarity: istri.rarity,
            source: istri_source,
            marriedAt: Date.now()
        }
        delete users.lastGacha

        let teks = `🎉 *PERNIKAHAN SAH!* 🎉\n\n`
        teks += `Selamat! @${m.sender.split('@')[0]} resmi menikah dengan *${istri.name}*.\n`
        teks += `📺 Anime: ${istri.anime}\n`
        teks += `🏆 Rarity: ${istri.rarity}\n`
        teks += `📋 Sumber: ${istri_source}\n`
        teks += `Mahar 1 unit Cincin Nikah telah dibayarkan tunai!\n\n`
        teks += `💜 *Status Nikah:* CONFIRMED 💍\n`
        teks += `Semoga langgeng terus sama waifunya ya bray! 💍`

        alya.sendMessage(m.chat, { text: teks, mentions: [m.sender] }, { quoted: m })
  }
}
