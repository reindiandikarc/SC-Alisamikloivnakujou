// Plugin: upswgc
// Fix: contentAlt di-encode ke dalam ID button agar sendstatus bisa decode
// Commands: swgc, upswgc

const path = require('path')
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

module.exports = {
  command: ['swgc', 'upswgc'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix,
      isGroup, from,
      Ryuu, isPrem, pler,
      replyalya,
    } = ctx

    // ═══════════════════════════════════════
    // AKSES: Owner + Premium ONLY
    // ═══════════════════════════════════════
    if (!Ryuu && !isPrem) {
      return replyalya(
        `╔═══════════════════════╗\n` +
        `║   🔒 *AKSES DITOLAK!*   ║\n` +
        `╚═══════════════════════╝\n\n` +
        `Fitur *.upswgc* hanya bisa digunakan oleh:\n\n` +
        `👑 *Owner Bot*\n` +
        `💎 *Premium Member*\n\n` +
        `Upgrade dulu statusmu! Ketik *${prefix}pricelist*`
      )
    }

    const { fromBuffer } = require('file-type')
    const fs = require('fs')

    let contentAlt = {}
    let buffer, ext, tempFile

    if (m.quoted) {
      try {
        buffer = await m.quoted.download()
        if (!buffer) return alya.sendMessage(m.chat, { text: '❌ Gagal mengambil media.' }, { quoted: m })

        ext = (await fromBuffer(buffer))?.ext || 'bin'
        tempFile = path.join(__dirname, `tmp_${Date.now()}.${ext}`)
        fs.writeFileSync(tempFile, buffer)

        const quotedType = m.quoted.mtype || Object.keys(m.quoted.message || {})[0] || ''

        if (/image/.test(quotedType)) {
          contentAlt.image = { url: tempFile }
          if (text) contentAlt.caption = text
        } else if (/video/.test(quotedType)) {
          contentAlt.video = { url: tempFile }
          if (text) contentAlt.caption = text
        } else if (/audio/.test(quotedType)) {
          if (text) {
            fs.unlinkSync(tempFile)
            return alya.sendMessage(m.chat, { text: '❌ Audio tidak boleh pakai caption.' }, { quoted: m })
          }
          contentAlt.audio = { url: tempFile }
          contentAlt.ptt = false
        } else {
          fs.unlinkSync(tempFile)
          return alya.sendMessage(m.chat, { text: '❌ Reply harus image/video/audio.' }, { quoted: m })
        }
      } catch (e) {
        return alya.sendMessage(m.chat, { text: '❌ Media gagal diproses.' }, { quoted: m })
      }
    } else if (text) {
      contentAlt.text = text
    } else {
      return alya.sendMessage(m.chat, { text: '❌ Kirim media atau teks dulu, lalu ketik .upswgc' }, { quoted: m })
    }

    const encodedContent = encodeURIComponent(JSON.stringify(contentAlt))

    let getGroups = await alya.groupFetchAllParticipating()
    let groups = Object.values(getGroups)

    if (groups.length === 0) {
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
      return alya.sendMessage(m.chat, { text: '❌ Bot tidak ada di grup manapun.' }, { quoted: m })
    }

    let filteredGroups = Ryuu ? groups : groups.filter(g => pler.includes(g.id))

    let validGroups = []

    if (Ryuu) {
      validGroups.push({
        title: '📢 Kirim ke Semua Grup',
        description: `Total ${groups.length} grup`,
        id: `${prefix}sendstatusall ${encodedContent}`
      })
    }

    for (let group of filteredGroups) {
      validGroups.push({
        title: group.subject,
        description: Ryuu ? group.id : `✅ Terdaftar • ${group.id}`,
        id: `${prefix}sendstatus ${group.id} ${encodedContent}`
      })
    }

    if (validGroups.length === 0) {
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
      return replyalya(
        `⚠️ Tidak ada grup terdaftar yang tersedia!\n\n` +
        `Sebagai *Premium Member*, kamu hanya bisa broadcast ke grup yang sudah terdaftar.\n\n` +
        `📌 Hubungi owner untuk mendaftarkan grupmu.`
      )
    }

    let msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `\`\`\`Pilih Grup Tujuan 📢\`\`\`\n${Ryuu ? '👑 Mode Owner: Semua grup tersedia' : '💎 Mode Premium: Hanya grup terdaftar'}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'Pastikan pilihan sudah benar sebelum kirim!'
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'PILIH GRUP',
                  sections: [{ title: Ryuu ? 'Semua Grup' : 'Grup Terdaftar', rows: validGroups }]
                })
              }]
            })
          })
        }
      }
    }, { quoted: m })

    await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
  }
}
