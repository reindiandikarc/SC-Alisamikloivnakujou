// Plugin: idgc
// Auto-generated from Alya V12
// Commands: idgc

const path = require('path')

module.exports = {
  command: ["idgc"],
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

        if (!text) return m.reply('📎 Masukkan link grup atau channel!')

        const grupRegex = /chat\.whatsapp\.com\/([A-Za-z0-9]+)/i
        const channelRegex = /whatsapp\.com\/channel\/([A-Za-z0-9]+)/i

        try {
            if (grupRegex.test(text)) {
                const inviteCode = text.match(grupRegex)[1]
                const g = await alya.groupGetInviteInfo(inviteCode)

                let pp
                try {
                    pp = await alya.profilePictureUrl(g.id, 'image')
                } catch {
                    pp = null
                }

                const admins = (g.participants || []).filter(v => v.admin)

                let teks = `*[ INFORMATION GROUP ]*

    📛 Name: ${g.subject || '-'}
    🆔 ID: ${g.id || '-'}
    👥 Members: ${g.size || g.participants?.length || '-'}
    📅 Created: ${g.creation ? new Date(g.creation * 1000).toLocaleString() : '-'}
    👑 Creator: ${g.owner ? '@' + g.owner.split('@')[0] : '-'}
    🔒 Restrict: ${g.restrict ?? '-'}
    📢 Announce: ${g.announce ?? '-'}
    🏘️ Community: ${g.isCommunity ?? '-'}
    ✅ Join Approval: ${g.joinApprovalMode ?? '-'}
    ➕ Member Add Mode: ${g.memberAddMode ?? '-'}

    📝 Description:
    ${g.desc || '-'}

    👮 Admins:
    ${admins.length ? admins.map(a =>
    `- @${a.id.split('@')[0]} (${a.admin})`
    ).join('\n') : '-'}`

                if (pp) {
                    await alya.sendMessage(m.chat, {
                        image: { url: pp },
                        caption: teks,
                        mentions: admins.map(a => a.id)
                    }, { quoted: m })
                } else {
                    await alya.sendMessage(m.chat, {
                        text: teks,
                        mentions: admins.map(a => a.id)
                    }, { quoted: m })
                }

            } else if (channelRegex.test(text) || text.endsWith('@newsletter')) {
                const channelId = text.match(channelRegex)?.[1] || text
                const n = await alya.newsletterMetadata(`@newsletter~${channelId}`)

                const meta = n.thread_metadata || {}

                let teks = `*[ INFORMATION CHANNEL ]*

    📛 Name: ${meta.name?.text || '-'}
    🆔 ID: ${n.id || '-'}
    📅 Created: ${meta.creation_time
        ? new Date(meta.creation_time * 1000).toLocaleString()
        : '-'}
    👥 Subscribers: ${meta.subscribers_count || 0}
    ✔️ Verified: ${meta.verification || 'No'}

    📝 Description:
    ${meta.description?.text || '-'}`

                await alya.sendMessage(m.chat, { text: teks }, { quoted: m })

            } else {
                m.reply('❌ Hanya support link Grup atau Channel!')
            }
        } catch (err) {
            console.log(err)
            m.reply('❌ Gagal mengambil informasi grup / channel')
        }
  }
}
