// Plugin: ewe-paksa
// Auto-generated from Alya V12
// Commands: ewe-paksa

const path = require('path')

module.exports = {
  command: ["ewe-paksa"],
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

        const cooldown = 300000
        let userAlt = global.db.users[m.sender]

        const clockString = (ms) => {
            const h = Math.floor(ms / 3600000)
            const m = Math.floor(ms / 60000) % 60
            const s = Math.floor(ms / 1000) % 60
            return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
        }

        if (!m.isGroup) return reply('❌ Fitur ini hanya dapat digunakan di dalam grup!')

        let target
        if (m.quoted) {
            target = m.quoted.sender
        } else if (text) {
            target = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }

        if (!target) return reply(`Silakan reply pesan korban atau masukkan nomor target setelah command!`)

        if (target === m.sender) return reply(`Jangan maksa diri sendiri, ngenes amat.`)

        // botNumber is from ctx, already correct
        if (target === botNumber) return reply(`❌ Berani kamu paksa bot? Bisa-bisa kamu yang dibanned!`)

        const targetNumber = target.split('@')[0]
        const isOwner = global.owner.includes(targetNumber) || global.owner.includes(target)

        if (isOwner) return reply(`❌ Berani kamu paksa owner? Bisa-bisa kamu yang dibanned!`)

        if (typeof global.db.users[target] === 'undefined') return reply(`Target tidak ditemukan di database.`)

        if (new Date() - userAlt.lastewe < cooldown) {
            const timers = (cooldown - (new Date() - userAlt.lastewe))
            return reply(`Sabar, tunggu *${clockString(timers)}* lagi.`)
        }

        const name = alya.getName(m.sender)
        const victim = alya.getName(target)
        const rewardMoney = Math.floor(Math.random() * 45000) + 5000
        const rewardExp = Math.floor(Math.random() * 8000) + 2000

        userAlt.money += rewardMoney
        userAlt.exp += rewardExp
        userAlt.warn += 1
        userAlt.ojekk += 1
        userAlt.lastewe = new Date() * 1

        const sequence = [
            { text: `Mencari target untuk dipaksa...`, delay: 0 },
            { text: `Mencoba mendekati @${target.split('@')[0]} secara perlahan...`, delay: 5000, mention: true },
            { text: `Mulai memaksa ${victim}, dia meronta-ronta!`, delay: 10000 },
            { text: `“Berhenti! Jangan!!” ${victim} mulai menangis...`, delay: 15000 },
            { text: `“Ahhh... Aku tidak sanggup lagi...” ${victim} menyerah sepenuhnya.`, delay: 20000 },
            {
                text: `*─── [ HASIL EWE-PAKSA ] ───*\n\n` +
                      `◦ *Pelaku:* ${name}\n` +
                      `◦ *Korban:* ${victim}\n\n` +
                      `+ Rp${rewardMoney.toLocaleString()} Uang\n` +
                      `+ ${rewardExp.toLocaleString()} Exp\n` +
                      `+ 1 Peringatan (Warn)\n\n` +
                      `*Total Aksi:* ${userAlt.ojekk}`,
                delay: 25000
            }
        ]

        sequence.forEach(step => {
            setTimeout(() => {
                alya.sendMessage(m.chat, {
                    text: step.text,
                    mentions: step.mention ? [target] : []
                }, { quoted: m })
            }, step.delay)
        })
  }
}
