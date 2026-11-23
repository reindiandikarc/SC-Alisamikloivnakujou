// Plugin: liston
// Auto-generated from Alya V12
// Commands: listonline, liston

const path = require('path')

module.exports = {
  command: ["listonline", "liston"],
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

        try {
            if (!m.isGroup) return m.reply(mess.group)

            await alya.sendMessage(m.chat, { react: { text: "👥", key: m.key } })

            const metadata = await alya.groupMetadata(m.chat)
            const participants = metadata.participants.map(p => p.id)
            const nonBot = participants.filter(jid => jid !== botNumber)

            // Subscribe presence untuk semua member grup
            await alya.presenceSubscribe(m.chat)

            // Cek store.presences (terisi setelah subscribe + ada aktivitas)
            const presenceData = (store.presences && store.presences[m.chat]) ? store.presences[m.chat] : {}

            let onlineList = []
            let offlineCount = 0

            for (const jid of nonBot) {
                const p = presenceData[jid]
                if (p) {
                    let status = '🟢 Online'
                    const lkp = p.lastKnownPresence
                    if (lkp === 'composing') status = '📝 Sedang mengetik'
                    else if (lkp === 'recording') status = '🎤 Sedang merekam'
                    else if (lkp === 'paused') status = '🟡 Baru aktif'
                    else if (lkp === 'unavailable') { offlineCount++; continue; }
                    onlineList.push({ jid, status })
                } else {
                    offlineCount++
                }
            }

            if (onlineList.length === 0) {
                return m.reply(
                    `👥 *List Online — ${metadata.subject}*\n\n` +
                    `💤 Belum ada member yang terdeteksi online saat ini.\n\n` +
                    `_Coba kirim perintah ini lagi setelah beberapa saat agar bot sempat mendeteksi aktivitas member._\n\n` +
                    `📊 Total member: *${nonBot.length}*`
                )
            }

            let teks = `👥 *List Online — ${metadata.subject}*\n`
            teks += `🟢 Online: *${onlineList.length}* | 💤 Offline/Away: *${offlineCount}*\n`
            teks += `📊 Total member: *${nonBot.length}*\n\n`

            onlineList.forEach((u, i) => {
                teks += `${i + 1}. @${u.jid.split('@')[0]}\n   └ ${u.status}\n`
            })

            await alya.sendMessage(m.chat, {
                text: teks,
                mentions: onlineList.map(u => u.jid)
            }, { quoted: m })

            await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

        } catch (err) {
            console.error('listonline error:', err)
            m.reply('⚠️ Terjadi kesalahan saat mengecek daftar online.')
        }
    }
}
