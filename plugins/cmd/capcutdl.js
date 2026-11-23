// Plugin: capcutdl
// Auto-generated from Alya V12
// Commands: cc, capcutdl

const path = require('path')

module.exports = {
  command: ["cc", "capcutdl"],
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

    const db = global.db
        let biaya = 2

        if (db.users[m.sender].limit < biaya) {
            return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
        }

        if (!text) {
            return replyalya(
                `Example:\n${prefix + command} https://www.capcut.com/tv2/xxxx`
            )
        }

        await alya.sendMessage(m.chat, {
            react: { text: '⏱️', key: m.key }
        })

        try {
            const axios = require('axios')

            async function capcut(url) {
                try {
                    const dl = await axios.post('https://3bic.com/api/download', {
                        url
                    })

                    if (dl.data?.originalVideoUrl?.startsWith('/')) {
                        dl.data.originalVideoUrl = 'https://3bic.com' + dl.data.originalVideoUrl
                    }

                    return dl.data
                } catch (e) {
                    return { status: 'error', msg: e.message }
                }
            }

            let res = await capcut(text)

            if (!res || res.code !== 200) {
                await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return replyalya('❌ Gagal mengambil video CapCut. Pastikan link valid.')
            }

            await alya.sendMessage(m.chat, {
                video: { url: res.originalVideoUrl },
                caption: `🎬 *CAPCUT DOWNLOADER*\n\n` +
                         `📌 *Title:* ${res.title}\n` +
                         `👤 *Author:* ${res.authorName}\n\n` +
                         `👤 *Request by:* @${pushname}\n` +
                         `💸 *Cost:* ${biaya} Limit\n\n` +
                         ` © ${botname}`,
                mentions: [m.sender]
            }, { quoted: m })

            db.users[m.sender].limit -= biaya

            await alya.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })

        } catch (err) {
            console.log(err)
            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            replyalya('❌ Terjadi kesalahan saat mendownload')
        }
  }
}
