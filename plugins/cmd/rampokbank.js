// Plugin: rampokbank
// Auto-generated from Alya V12
// Commands: rampokbank

const path = require('path')

module.exports = {
  command: ["rampokbank"],
  tags: ['admin'],
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

        const delay = (ms) => new Promise(res => setTimeout(res, ms))
        const COOLDOWN = 60 * 60 * 1000
        const JAIL_TIME = 2 * 60 * 60 * 1000
        const MIN_BANK_TARGET = 100000

        let target = m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
        if (!target) return replyalya(`⚠️ *SIAPA TARGETNYA?*\nContoh: ${prefix+command} @tag/reply`)

        let users = global.db.users
        if (!(target in users)) return replyalya('❌ User tidak ditemukan!')

        let now = Date.now()
        let senderAlt = users[m.sender] ??= {}
        let victim = users[target]

        if (target === m.sender) return replyalya('🤣 Mau ngerampok diri sendiri?')
        if (victim.bank < MIN_BANK_TARGET) return replyalya(`🏦 Saldo bank target terlalu dikit!`)
        if (now < (senderAlt.jailUntil || 0)) return replyalya(`👮 Masih di sel! Tunggu ${(Math.ceil((senderAlt.jailUntil - now) / 60000))} menit lagi.`)
        if (now < (senderAlt.lastHeist || 0) + COOLDOWN) return replyalya(`⏳ Situasi panas! Tunggu ${(Math.ceil(((senderAlt.lastHeist + COOLDOWN) - now) / 60000))} menit.`)

        senderAlt.lastHeist = now

        if (victim.antibegal > 0) {
            victim.antibegal -= 1
            return replyalya(`🛡️ *GAGAL!* Target punya Bodyguard. Lu dipukulin sampe pingsan!`)
        }

        const steps = [
            { msg: `🕶️ *HEIST DIMULAI*...\nTarget: @${target.split('@')[0]}`, delay: 2000 },
            { msg: '🏦 Memasuki area bank...', delay: 3000 },
            { msg: '💥 *DORRR!* "TIARAP SEMUA!"', delay: 3000 },
            { msg: '📟 Menghubungkan alat peretas ke server bank...', delay: 4000 }
        ]

        let sent = await alya.sendMessage(m.chat, { text: steps[0].msg, mentions: [target] }, { quoted: m })

        for (let i = 1; i < steps.length; i++) {
            await delay(steps[i].delay)
            await alya.sendMessage(m.chat, { text: steps[i].msg, edit: sent.key })
        }

        await delay(3000)

        let chance = Math.random()
        let resultMsg = ""

        if (chance > 0.4) {

            let percent = (Math.random() * 0.2) + 0.1
            let stolen = Math.floor(victim.bank * percent)
            victim.bank -= stolen
            senderAlt.bank = (senderAlt.bank || 0) + stolen

            resultMsg = `📟 *SUCCESS!* 📟\n\nTransfer selesai sebelum polisi datang!\n💰 *Hasil:* Rp ${stolen.toLocaleString('id-ID')}\n💨 Lu kabur lewat pintu belakang!`
        } else if (chance > 0.15) {
            let fine = Math.floor((senderAlt.bank || 0) * 0.2)
            senderAlt.bank -= fine

            resultMsg = `⚠️ *ZONK!* ⚠️\n\nBrankas gagal dibuka karena sistem macet. Kamu kabur tapi dompetmu jatuh!\n💸 *Denda:* Rp ${fine.toLocaleString('id-ID')}`
        } else {
            let fine = Math.floor((senderAlt.bank || 0) * 0.5)
            senderAlt.bank -= fine
            senderAlt.jailUntil = now + JAIL_TIME

            resultMsg = `👮 *KEPUNGAN POLISI!* 👮\n\nTim SWAT menyerbu gedung! Lu diringkus tanpa perlawanan.\n💸 *Denda:* Rp ${fine.toLocaleString('id-ID')}\n⛓️ *Hukuman:* Penjara 2 Jam`
        }

        await alya.sendMessage(m.chat, { text: resultMsg, edit: sent.key })
  }
}
