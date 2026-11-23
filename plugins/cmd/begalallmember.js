// Plugin: begalallmember
// Auto-generated from Alya V12
// Commands: begalallmember

const path = require('path')

module.exports = {
  command: ["begalallmember"],
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
    		if (!Ryuu) return replytolak(mess.only.owner)

        const delay = (ms) => new Promise(res => setTimeout(res, ms))
        const stepDelay = 3000

        const COOLDOWN = 12 * 60 * 60 * 1000
        const SUCCESS_CHANCE = 0.80
        const JAIL_TIME = 12 * 60 * 60 * 1000

        let typeAlt = args[0] ? args[0].toLowerCase() : null
        if (!type || !['money', 'limit'].includes(type))
            return replyalya(`⚠️ *PILIH JENISNYA!*\nContoh: .begalall money`)

        let users = global.db.users
        let now = Date.now()
        let senderAlt = users[m.sender] ??= {}

        if (now < (senderAlt.jailUntil || 0)) {
            let sisaMenit = Math.ceil((senderAlt.jailUntil - now) / 60000)
            return replyalya(`👮 *LU MASIH DI SEL!*\nSisa hukuman: ${sisaMenit} menit.`)
        }
        if (now < (senderAlt.lastBegalAll || 0) + COOLDOWN) {
            let mnt = Math.ceil((senderAlt.lastBegalAll + COOLDOWN - now) / 60000)
            return replyalya(`⏳ *KOTA LAGI SIAGA!*\nPolisi patroli besar-besaran. Tunggu ${mnt} menit lagi.`)
        }

        let groupMetadataAlt = await alya.groupMetadata(m.chat)
        const participants = groupMetadataAlt.participants.map(v => v.id).filter(v => v !== m.sender && v !== alya.user.jid)

        const steps = [
            `🕶️ *OPERASI BLACKOUT* 🕶️\nMenargetkan seluruh member grup: *${groupMetadataAlt.subject}*`,
            '🧨 Memasang bom asap di seluruh penjuru grup...',
            '🔌 Memutus aliran listrik dan sinyal...',
            '🥷 Pasukan masuk! Menjarah semua orang secara bersamaan!',
            '🚨 *ALARM BERBUNYI!* Warga grup mulai bangun!'
        ]

        let sent = await alya.sendMessage(m.chat, { text: steps[0] }, { quoted: m })

        for (let i = 1; i < steps.length; i++) {
            await delay(stepDelay)
            await alya.sendMessage(m.chat, { text: steps[i], edit: sent.key })
        }

        await delay(stepDelay)

        let isSuccess = Math.random() < SUCCESS_CHANCE
        senderAlt.lastBegalAll = now

        if (isSuccess) {
            let totalStolen = 0
            let victimCount = 0

            for (let jid of participants) {
                let victim = users[jid]
                if (victim && victim[type] > 100) {
                    let stolen = Math.floor(victim[type] * 0.1)
                    victim[type] -= stolen
                    totalStolen += stolen
                    victimCount++
                }
            }

            senderAlt[type] += totalStolen
            return alya.sendMessage(m.chat, {
                text: `💰 *PERAMPOKAN BESAR BERHASIL!*\n\nLu berhasil menjarah *${victimCount}* member!\n📈 *Total Dapat:* ${totalStolen.toLocaleString()} ${type}\n🔥 *Harta Lu Sekarang:* ${senderAlt[type].toLocaleString()}\n\n_Satu kota menangis karena lu!_`,
                edit: sent.key
            })

        } else {
            let fine = Math.floor((senderAlt[type] || 0) * 0.7)
            senderAlt[type] -= fine
            senderAlt.jailUntil = now + JAIL_TIME

            return alya.sendMessage(m.chat, {
                text: `🚨 *Misi Gagal!*\n\nSeluruh member grup kompak Ngegebugin lu! Lu bonyok dan jadi samsak Member.\n\n💸 *Denda Ganti Rugi:* ${fine.toLocaleString()} ${type}\n⛓️ *Hukuman:* Penjara 128 Jam (Isolasi)`,
                edit: sent.key
            })
        }
  }
}
