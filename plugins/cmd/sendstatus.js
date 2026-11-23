// Plugin: sendstatus
// Commands: sendstatus
// FIXED: groupStatus diimplementasi lokal, db.users → global.db.users

'use strict'

const fs      = require('fs')
const crypto  = require('crypto')
const baileys = require('@whiskeysockets/baileys')

async function groupStatusLocal(alya, jid, content) {
  const { backgroundColor } = content
  const payload = { ...content }
  delete payload.backgroundColor

  const inside = await baileys.generateWAMessageContent(payload, {
    upload: alya.waUploadToServer,
    backgroundColor
  })

  const messageSecret = crypto.randomBytes(32)
  const msg = baileys.generateWAMessageFromContent(jid, {
    messageContextInfo: { messageSecret },
    groupStatusMessageV2: {
      message: {
        ...inside,
        messageContextInfo: { messageSecret }
      }
    }
  }, {})

  await alya.relayMessage(jid, msg.message, { messageId: msg.key.id })
  return msg
}

module.exports = {
  command: ['sendstatus'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { args, Ryuu, isPrem, pler, replyalya, replytolak } = ctx

    if (!Ryuu && !isPrem) return replytolak(global.mess?.only?.owner || '❌ Khusus Owner/Premium!')

    const [groupId, ...contentARR] = args
    if (!groupId) return replyalya('❌ Format salah!\nContoh: sendstatus <groupId> <content_json>')
    if (!contentARR.length) return replyalya('❌ Konten kosong.')

    let contentDecoded
    try {
      contentDecoded = JSON.parse(decodeURIComponent(contentARR.join(' ')))
    } catch (e) {
      return replyalya('❌ Gagal decode konten: ' + e.message)
    }

    // Denda 50.000 jika premium (bukan owner) kirim ke grup tidak terdaftar
    if (!Ryuu && isPrem && !pler.includes(groupId)) {
      const DENDA = 50000
      const userData = global.db?.users?.[m.sender]
      if (userData) {
        const limitNow = userData.limit || 0
        if (limitNow >= DENDA) userData.limit -= DENDA
      }
      const cleanup = () => {
        ['image','video','audio'].forEach(t => {
          if (contentDecoded?.[t]?.url && fs.existsSync(contentDecoded[t].url)) {
            try { fs.unlinkSync(contentDecoded[t].url) } catch {}
          }
        })
      }
      cleanup()
      return replyalya(
        `⛔ *DENDA DIJATUHKAN!*\n\nKamu mencoba broadcast ke grup yang tidak terdaftar!\n\n💸 *-50.000 Limit dipotong sebagai denda!*\n\n🛑 Broadcast dibatalkan. Jangan ulangi!`
      )
    }

    try {
      await groupStatusLocal(alya, groupId, contentDecoded)
      alya.sendMessage(m.chat, { text: `✅ Berhasil kirim ke:\n${groupId}` }, { quoted: m })
    } catch (e) {
      alya.sendMessage(m.chat, { text: `❌ Gagal kirim ke:\n${groupId}\n${e.message}` }, { quoted: m })
    } finally {
      ;['image','video','audio'].forEach(t => {
        if (contentDecoded?.[t]?.url && fs.existsSync(contentDecoded[t].url)) {
          try { fs.unlinkSync(contentDecoded[t].url) } catch {}
        }
      })
    }
  }
}
