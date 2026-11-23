// Plugin: sendstatus
// Commands: sendstatus
// FIXED: groupStatus diimplementasi lokal, db.users → global.db.users

'use strict'

const fs      = require('fs')
const crypto  = require('crypto')
const baileys = require('@whiskeysockets/baileys')

// Posting group status — diadaptasi dari vanXone V4 `lumen/plugins/group/group-upswgc.js`.
// Dua hal yang bikin versi sebelumnya "berhasil" tapi statusnya tak tampil:
//   1. media harus di-relay LANGSUNG ({ imageMessage: ... }), bukan dibungkus
//      groupStatusMessageV2
//   2. stanza harus bawa <meta is_group_status="true"/> lewat additionalNodes
//      — inilah penanda yang dibaca WhatsApp untuk merender story grup.
async function groupStatusLocal(alya, jid, content) {
  const { backgroundColor, font, ...base } = content

  const isText = base.text !== undefined
  const key = base.image ? 'imageMessage'
    : base.video ? 'videoMessage'
    : base.audio ? 'audioMessage'
    : isText ? 'extendedTextMessage' : null
  if (!key) throw new Error('Tidak ada tipe media/text untuk status grup')

  const statusSourceType =
    key === 'extendedTextMessage' ? 4 :
    key === 'audioMessage'        ? 3 :
    key === 'videoMessage'        ? 1 : 0

  const contextInfo = {
    expiration: 86400,
    disappearingMode: { initiator: 0 },
    featureEligibilities: {
      cannotBeRanked: false,
      canBeReshared: true,
      canReceiveMultiReact: true
    },
    statusSourceType,
    statusAttributions: [{ type: 10 }],
    isGroupStatus: true,
    statusAudienceMetadata: {
      audienceType: 2,
      listName: 'Alya Status',
      listEmoji: '✨'
    }
  }

  const messageId = crypto.randomBytes(16).toString('hex').toUpperCase()
  const messageContextInfo = { messageSecret: crypto.randomBytes(32) }
  const opts = {
    messageId,
    additionalNodes: [{ tag: 'meta', attrs: { is_group_status: 'true' } }]
  }

  if (isText) {
    const hex = String(backgroundColor || '#128C7E').replace('#', '')
    const bgArgb = (0xFF000000 | parseInt(hex, 16)) >>> 0
    await alya.relayMessage(jid, {
      extendedTextMessage: {
        text: base.text,
        textArgb: 0xFFFFFFFF,
        backgroundArgb: bgArgb,
        font: font ?? 7,
        contextInfo
      },
      messageContextInfo
    }, opts)
    return { messageId, key }
  }

  const payload = { ...base }
  const gen = await baileys.generateWAMessageContent(payload, {
    upload: alya.waUploadToServer
  })
  const media = gen[key]
  if (!media) throw new Error('Gagal menyiapkan ' + key)
  media.contextInfo = { ...(media.contextInfo || {}), ...contextInfo }

  await alya.relayMessage(jid, { [key]: media, messageContextInfo }, opts)
  return { messageId, key }
}

module.exports = {
  groupStatusLocal,
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
