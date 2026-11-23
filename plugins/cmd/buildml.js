// Plugin: buildml
// Auto-generated from Alya V12
// Commands: buildml

const path = require('path')

module.exports = {
  command: ["buildml"],
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

        if (!text) return replyalya(
            `❌ *Masukkan nama hero!*\n\nContoh:\n${prefix + command} julian`
        )

        await alya.sendMessage(m.chat, {
            react: { text: "⏳", key: m.key }
        })

        try {
            const hero = encodeURIComponent(text.trim().toLowerCase())
            const url = `https://api.apocalypse.web.id/search/buildml?hero=${hero}`

            const res = await fetch(url)
            const json = await res.json()

            if (!json.status || !Array.isArray(json.builds) || json.builds.length === 0) {
                return replyalya('❌ Build hero tidak ditemukan!')
            }

            let teks = `🎮✨ *BUILD MOBILE LEGENDS*\n`
            teks += `══════════════════════\n`
            teks += `🧑‍🎮 Hero        : *${json.hero || text}*\n`
            teks += `📦 Total Build : *${json.total || json.builds.length}*\n`
            teks += `⚡ Powered By  : *${botname}*\n`
            teks += `══════════════════════\n\n`

            json.builds.forEach((build, i) => {
                teks += `🔥 *BUILD ${i + 1}*\n`
                teks += `🏷️ *${build.title || 'No Title'}*\n`
                teks += `──────────────────────\n`

                if (Array.isArray(build.items)) {
                    build.items.forEach((item, idx) => {
                        teks += `🧩 *${idx + 1}. ${item.name || '-'}*\n`
                        if (item.type) teks += `   🏹 Tipe  : ${item.type}\n`
                        if (item.price) teks += `   💰 Harga : ${item.price}\n`

                        if (item.stats && Object.keys(item.stats).length > 0) {
                            const stats = Object.entries(item.stats)
                                .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`)
                                .join(' | ')
                            teks += `   📊 Stats : ${stats}\n`
                        }
                        teks += '\n'
                    })
                } else {
                    teks += `❌ Item tidak tersedia\n\n`
                }

                teks += `══════════════════════\n\n`
            })

            replyalya(teks)

        } catch (err) {
            console.error('[BUILDML ERROR]', err)
            replyalya('❌ Terjadi kesalahan saat mengambil data build.')
        }
    }
}
