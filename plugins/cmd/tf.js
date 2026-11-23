// Plugin: tf
// Ported from Alya V10
// Commands: tf, transfer, gift

const path = require('path')

module.exports = {
  command: ["tf", "transfer", "gift"],
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

        const toNum = (v) => (v || 0).toLocaleString('id-ID')
        const toRupiah = (v) => 'Rp' + (v || 0).toLocaleString('id-ID')

        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null)

        if (!target && args[1]) {
            let nomor = args[1].replace(/[^0-9]/g, '')
            if (nomor.length >= 10) target = nomor + '@s.whatsapp.net'
        }

        if (!args[0]) {
            return replyalya(`╭───  「 💸 *TRANSFER MENU* 」\n│\n│ 💡 *Cara Penggunaan:*\n│ ◦ Reply: \`.tf money 50000\`\n│ ◦ Tag: \`.tf money @user 50000\`\n│ ◦ Nomor: \`.tf money 628xxx 50000\`\n│\n╰───────────────────────────`)
        }

        let tfType = args[0].toLowerCase()
        let amount = parseInt(args.find(v => !isNaN(v) && !v.includes('@'))) || 0

        if (!target) return replyalya('❌ *Akses Ditolak:* Mohon tag user, balas chatnya, atau masukkan nomor tujuan.')
        if (target === m.sender) return replyalya('❌ *Kesalahan:* Kamu tidak bisa mengirim ke diri sendiri!')
        if (amount <= 0) return replyalya('❌ *Jumlah Tidak Valid:* Nominal harus lebih dari 0.')
        if (!(target in global.db.users)) return replyalya('❌ *User Ghaib:* Target tidak terdaftar di database.')

        let adminFee = tfType === 'money' ? 10000 : 0
        let senderData = global.db.users[m.sender]
        let targetData = global.db.users[target]
        let totalDeduct = amount + adminFee

        if (!senderData[tfType] || senderData[tfType] < totalDeduct) {
            return replyalya(`❌ *Saldo Tidak Cukup!*\n\n• *Dibutuhkan:* ${tfType === 'money' ? toRupiah(totalDeduct) : toNum(totalDeduct)} ${tfType}\n• *Biaya Admin:* ${toRupiah(adminFee)}`)
        }

        senderData[tfType] -= totalDeduct
        targetData[tfType] = (targetData[tfType] || 0) + amount

        const caption = `
─── 「 💸 *TRANSFER SUCCESS* 」 ───

  ◦  *Penerima* : @${target.split('@')[0]}
  ◦  *Item* : ${tfType.toUpperCase()}
  ◦  *Nominal* : ${tfType === 'money' ? toRupiah(amount) : toNum(amount)}
  ◦  *Biaya* : ${toRupiah(adminFee)}

───────────────────────────
*SISA SALDO:*
👉 ${tfType === 'money' ? toRupiah(senderData[tfType]) : toNum(senderData[tfType])} ${tfType}
───────────────────────────`.trim()

        await alya.sendMessage(m.chat, {
            image: { url: 'https://raw.githubusercontent.com/reindiandikarc/Yuugames/refs/heads/main/alya1.jpg' },
            caption: caption,
            footer: `Alya Transfer System • Ref ID: ${Math.random().toString(36).toUpperCase().slice(2, 9)}`,
            contextInfo: {
                mentionedJid: [target, m.sender],
                
            }
        }, { quoted: m })
  }
}
