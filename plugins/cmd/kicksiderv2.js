// Plugin: kicksiderv2
// Auto-generated from Alya V12
// Commands: kicksiderv2

const path = require('path')

module.exports = {
  command: ["kicksiderv2"],
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

        if (!m.isGroup) return replyalya('❌ Fitur ini khusus grup!')
        if (!isBotAdmins) return replyalya('❌ Bot harus jadi admin!')

        await alya.sendMessage(m.chat, { react: { text: "🔎", key: m.key } })

        let groupMetadataAlt = await alya.groupMetadata(m.chat)
        let participants = groupMetadataAlt.participants
        let chatData = global.db.chats[m.chat]?.users || {}

        let totalMember = participants.length
        let now = Date.now()
        let oneWeek = 604800000

        let ghosts = []
        let siders = []
        let active = []

        for (let member of participants) {
            let id = member.id
            let finalJid = id

            if (id.includes('@lid')) {
                if (alya.findJidByLid) {
                    let found = alya.findJidByLid(id)
                    if (found) finalJid = found
                }
                if (finalJid.includes('@lid')) {
                    let manual = Object.keys(chatData).find(key => chatData[key].lid === id)
                    if (manual) finalJid = manual
                }
            } else {
                finalJid = alya.decodeJid(id)
            }

            let userDB = chatData[finalJid]

            if (!userDB || userDB.total === 0) {
                ghosts.push(finalJid)
            } else {
                let lastSeen = userDB.lastSeen || 0
                let daysNoChat = Math.floor((now - lastSeen) / 86400000)

                let userData = {
                    id: finalJid,
                    total: userDB.total,
                    last: lastSeen,
                    days: daysNoChat,
                    name: userDB.name || 'Unknown'
                }

                if (now - lastSeen > oneWeek) {
                    siders.push(userData)
                } else {
                    active.push(userData)
                }
            }
        }

        if (args[0] === 'kick') {
            if (!isAdmins) return replyalya('❌ Khusus admin grup!')
            if (ghosts.length === 0) return replyalya('⚠️ Tidak ada ghost sider.')

            await replyalya(`🚀 Mengeluarkan ${ghosts.length} ghost...`)

            for (let jid of ghosts) {
                await new Promise(r => setTimeout(r, 1500))
                await alya.groupParticipantsUpdate(m.chat, [jid], 'remove')
            }

            return replyalya('✅ Berhasil bersih-bersih grup.')
        }

        active.sort((a, b) => b.total - a.total)
        siders.sort((a, b) => a.last - b.last)

        let teks = `📊 *ANALISIS GRUP*\n`
        teks += `👥 Total: ${totalMember}\n`
        teks += `🗣️ Aktif: ${active.length}\n`
        teks += `💤 Sider: ${siders.length}\n`
        teks += `👻 Ghost: ${ghosts.length}\n`
        teks += `━━━━━━━━━━━━━━━\n\n`

        teks += `🏆 *MEMBER AKTIF*\n`
        if (active.length === 0) {
            teks += `- Belum ada data\n`
        } else {
            teks += active.map((v, i) => {
                return `${i + 1}. @${v.id.split('@')[0]} (💬 ${v.total})`
            }).join('\n')
        }
        teks += `\n\n💤 *SIDER 7 HARI+*\n`
        if (siders.length === 0) {
            teks += `- Nihil\n`
        } else {
            teks += siders.map(v => {
                return `@${v.id.split('@')[0]} (${v.days} hari)`
            }).join('\n')
        }
        teks += `\n\n👻 *GHOST 0 CHAT*\n`
        if (ghosts.length === 0) {
            teks += `- Nihil\n`
        } else {
            teks += ghosts.map(v => `@${v.split('@')[0]}`).join('\n')
        }

        teks += `\n\nKetik *${prefix + command} kick* untuk kick ghost`

        let mentions = [
            ...active.map(v => v.id),
            ...siders.map(v => v.id),
            ...ghosts
        ]

        await alya.sendMessage(m.chat, {
            text: teks,
            mentions
        }, { quoted: m })
  }
}
