// Plugin: hitman
// Auto-generated from Alya V12
// Commands: bunuh, hitman

const path = require('path')

module.exports = {
  command: ["bunuh", "hitman"],
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

        function clockString(ms) {
            let h = Math.floor(ms / 3600000)
            let m = Math.floor(ms / 60000) % 60
            let s = Math.floor(ms / 1000) % 60
            return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
        }

        let userAlt = global.db.users[m.sender]
        let __timers = (new Date - user.lastmisi)
        let _timers = (3600000 - __timers)
        let timers = clockString(_timers)
        let id = m.sender
        let name = alya.getName(m.sender)
        let kerja = 'Membantai'

        alya.misi = alya.misi ? alya.misi : {}
        if (id in alya.misi) {
            replyalya(`Sabar elah, misi *${alya.misi[id][0]}* lo belum kelar!`)
            throw false
        }

        if (new Date - user.lastmisi > 3600000) {
            let gagal = Math.random() < 0.3

            alya.misi[id] = [
                kerja,
                setTimeout(() => { delete alya.misi[id] }, 27000)
            ]

            setTimeout(() => { replyalya('🔍 *Tracing target...* Lagi nyari posisi doi nih.') }, 0)
            setTimeout(() => { replyalya('🕵️ *Target locked!* Gue udah di belakang dia, tinggal eksekusi.') }, 10000)
            setTimeout(() => { replyalya('⚔️ *STAB!* Langsung gue tusuk jantungnya tanpa ampun.') }, 15000)

            setTimeout(() => {
                if (gagal) {

                    let denda = Math.floor(user.money * 0.5)
                    user.money -= denda
                    userAlt.warn += 2

                    let teksGagal = `
    ❌ *MISSION FAILED!* ❌

    Sialan, polisi dateng pas lo lagi beresin mayat!
    Lo diseret ke penjara dan kena denda gede.

    📉 *Kerugian:*
    - Denda 50%: -Rp ${denda.toLocaleString()}
    - Status: Masuk Penjara 🚔
    - Pelanggaran: +2
    `.trim()
                    replyalya(teksGagal)
                } else {
                    let rewardUang = Math.floor(Math.random() * 200000) + 100000
                    let rewardExp = Math.floor(Math.random() * 500) + 1000

                    user.money += rewardUang
                    userAlt.exp += rewardExp
                    user.ojekk += 1
                    userAlt.warn += 1

                    let hsl = `
    🔥 *MISSION SUCCESS!* 🔥
    *—[ Report: ${name} ]—*

    💰 *Uang:* +Rp ${rewardUang.toLocaleString()}
    ✨ *Exp:* +${rewardExp}
    👮 *Buronan:* +1 Pelanggaran
    ✅ *Misi:* +1 Berhasil!

    Total Misi Kelar: ${user.ojekk}
    `.trim()
                    replyalya(hsl)
                }
            }, 25000)

            user.lastmisi = new Date * 1
        } else {
            replyalya(`Tangan lo masih gemeteran dan bersimbah darah! Tunggu *${timers}* lagi buat jadi psikopat lagi.`)
        }
    }
    //==================================================================
  }
