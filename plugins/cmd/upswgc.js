// Plugin: swgc / upswgc
// Metode diadaptasi dari vanXone V4 (engine/nimbus/plugins/owner/swgc.js):
//   - Media diunduh sekali lalu ditahan sebagai Buffer di Map `pendingSwgc`
//     (key = pengirim), bukan ditulis ke file lalu path-nya disisipkan ke ID
//     tombol. ID tombol cuma `.swgc --confirm <groupId>` — pendek & tidak rapuh.
//   - Saat tombol dipilih, buffer diambil dari Map lalu diposting sebagai
//     group status. Fork Baileys di SC ini belum punya builder native
//     `groupStatusMessage`, jadi posting tetap lewat `groupStatusMessageV2`
//     di sendstatus.js (jalur yang sudah terbukti jalan).
//
// Commands: swgc, upswgc

const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')
const { groupStatusLocal } = require('./sendstatus')

const pendingSwgc = new Map()
const ALL_GROUPS = '__all__'

const senderKey = (m) => String(m.sender || m.key?.participant || '').split('@')[0]

function cleanPending(sender) {
  const p = pendingSwgc.get(sender)
  if (p?.timeout) clearTimeout(p.timeout)
  pendingSwgc.delete(sender)
}

module.exports = {
  command: ['swgc', 'upswgc'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { text, prefix, Ryuu, isPrem, pler, replyalya } = ctx
    const key = senderKey(m)

    // ═══════════════════════════════════════
    // AKSES: Owner + Premium ONLY
    // ═══════════════════════════════════════
    if (!Ryuu && !isPrem) {
      return replyalya(
        `╔═══════════════════════╗\n` +
        `║   🔒 *AKSES DITOLAK!*   ║\n` +
        `╚═══════════════════════╝\n\n` +
        `Fitur *.swgc* hanya bisa digunakan oleh:\n\n` +
        `👑 *Owner Bot*\n` +
        `💎 *Premium Member*\n\n` +
        `Upgrade dulu statusmu! Ketik *${prefix}pricelist*`
      )
    }

    // ─────────────────────────────────────────────
    // TAHAP 2: konfirmasi dari tombol `.swgc --confirm <groupId>`
    // ─────────────────────────────────────────────
    if (ctx.args?.[0] === '--confirm' && ctx.args?.[1]) {
      const pending = pendingSwgc.get(key)
      if (!pending) {
        return replyalya(
          '⚠️ *Data pending tidak ditemukan / sudah kedaluwarsa.*\n\n' +
          'Silakan kirim ulang media atau teks dengan *.swgc* lalu pilih grup lagi.'
        )
      }

      const target = ctx.args[1]
      let groups = {}
      try { groups = await alya.groupFetchAllParticipating() } catch (e) {}
      const groupIds = target === ALL_GROUPS ? Object.keys(groups) : [target]

      if (!groupIds.length) return replyalya('❌ Bot tidak berada di grup manapun.')

      // Premium tidak boleh mengirim ke grup yang tidak terdaftar
      if (!Ryuu) {
        const denied = groupIds.filter(id => !pler.includes(id))
        if (denied.length) {
          cleanPending(key)
          return replyalya(
            `⛔ Grup tersebut tidak terdaftar untuk akun premium.\n` +
            `Hubungi owner jika ingin menambahkannya.`
          )
        }
      }

      let ok = 0
      let fail = 0
      let lastGroup = 'Grup'
      for (const jid of groupIds) {
        try {
          lastGroup = groups?.[jid]?.subject || jid
          await groupStatusLocal(alya, jid, pending.content)
          ok++
        } catch (e) {
          console.error('[SWGC] gagal post ke ' + jid + ': ' + e?.message)
          fail++
        }
      }

      cleanPending(key)
      if (groupIds.length === 1) {
        return replyalya(
          fail ? `❌ Gagal posting ke ${lastGroup}\n\`${pending.error || ''}\``
               : `✅ Berhasil up sw ke grup ${lastGroup}`
        )
      }
      return replyalya(
        `📢 *Broadcast status selesai*\n\n` +
        `✅ Berhasil : ${ok} grup\n` +
        `❌ Gagal    : ${fail} grup\n` +
        `📊 Total    : ${groupIds.length} grup`
      )
    }

    // ─────────────────────────────────────────────
    // TAHAP 1: kumpulkan media/teks, simpan ke Map, tampilkan pilihan grup
    // ─────────────────────────────────────────────
    const { fromBuffer } = require('file-type')
    let content = {}
    let buffer
    let mediaType = ''

    // Sumber media:
    //  A) reply ke media            -> m.quoted.download()
    //  B) media + caption ".swgc x" -> alya.downloadMediaMessage(m.msg)
    // Jalur (B) adalah yang paling dijamin untuk media sekali lihat, karena
    // WhatsApp membuang mediaKey dari salinan quotedMessage.
    if (m.quoted) {
      try {
        buffer = await m.quoted.download()
        mediaType = m.quoted.mtype || Object.keys(m.quoted.message || {})[0] || ''
      } catch (e) {}

      if (!buffer || !buffer.length) {
        if (m.mtype && /^(image|video|audio)Message$/.test(m.mtype)) {
          try { buffer = await alya.downloadMediaMessage(m.msg || m) } catch (e) {}
          mediaType = m.mtype
        }
        if (!buffer || !buffer.length) {
          return replyalya(
            '❌ Media reply tidak bisa diunduh (kemungkinan video sekali lihat yang sudah lama / pesan aslinya sudah tidak tersedia).\n\n' +
            '👉 Kirim ULANG foto/video-nya, lalu ketik *.swgc <caption>* sebagai **caption** media itu (bukan di-reply).'
          )
        }
      }
    } else if (m.mtype && /^(image|video|audio)Message$/.test(m.mtype)) {
      try { buffer = await alya.downloadMediaMessage(m.msg || m) } catch (e) {}
      mediaType = m.mtype
      if (!buffer || !buffer.length) {
        return replyalya('❌ Gagal mengambil media dari pesan ini.')
      }
    }

    if (buffer && buffer.length) {
      // Pastikan benar-benar media, bukan file .bin kosong
      let detected
      try { detected = await fromBuffer(buffer) } catch (e) {}
      if (!detected && !/^(image|video|audio)/.test(mediaType)) {
        return replyalya('❌ Buffer media tidak dikenali. Kirim ulang medianya.')
      }

      if (/image/.test(mediaType)) {
        content = { image: buffer, caption: text || '' }
      } else if (/video/.test(mediaType)) {
        content = { video: buffer, caption: text || '' }
      } else if (/audio/.test(mediaType)) {
        if (text) return replyalya('❌ Audio tidak boleh pakai caption.')
        content = {
          audio: buffer,
          mimetype: detected?.mime || m.msg?.mimetype || 'audio/mpeg',
          ptt: Boolean(m.msg?.ptt)
        }
      } else {
        return replyalya('❌ Reply harus image/video/audio.')
      }
    } else if (text && text.trim()) {
      content = { text: text.trim(), font: 0, backgroundColor: '#128C7E' }
    } else {
      return replyalya(
        `⚠️ *CARA PAKAI*\n\n` +
        `> \`${prefix}swgc <teks>\` — status teks\n` +
        `> Reply gambar/video + \`${prefix}swgc <caption>\`\n` +
        `> Kirim gambar/video + caption \`${prefix}swgc <caption>\``
      )
    }

    let groups = {}
    try { groups = await alya.groupFetchAllParticipating() } catch (e) {}
    const entries = Object.entries(groups || {})
    if (!entries.length) return replyalya('❌ Bot tidak ada di grup manapun.')

    const allowed = Ryuu ? entries : entries.filter(([id]) => pler.includes(id))
    if (!allowed.length) {
      return replyalya(
        '⚠️ Tidak ada grup terdaftar yang tersedia!\n\n' +
        'Sebagai *Premium Member*, kamu hanya bisa broadcast ke grup yang sudah terdaftar.\n\n' +
        '📌 Hubungi owner untuk mendaftarkan grupmu.'
      )
    }

    const rows = []
    if (Ryuu) {
      rows.push({
        title: '📢 Kirim ke Semua Grup',
        description: `Total ${entries.length} grup`,
        id: `${prefix}swgc --confirm ${ALL_GROUPS}`
      })
    }
    for (const [id, meta] of allowed) {
      rows.push({
        title: meta?.subject || 'Grup',
        description: Ryuu ? id : `✅ Terdaftar • ${id}`,
        id: `${prefix}swgc --confirm ${id}`
      })
    }

    // Simpan buffer di memory, bukan di ID tombol
    cleanPending(key)
    const timeout = setTimeout(() => cleanPending(key), 10 * 60 * 1000)
    timeout.unref?.()
    pendingSwgc.set(key, { content, timestamp: Date.now(), timeout })

    const mediaLabel = content.text ? 'Teks'
      : content.image ? 'Gambar'
      : content.video ? 'Video'
      : content.audio ? 'Audio' : 'Media'

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `\`\`\`Pilih Grup Tujuan 📢\`\`\`\n` +
                `> Media: *${mediaLabel}*\n` +
                `> Total Grup: *${allowed.length}*\n\n` +
                (Ryuu ? '👑 Mode Owner: Semua grup tersedia' : '💎 Mode Premium: Hanya grup terdaftar')
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'Pastikan pilihan sudah benar sebelum kirim!'
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'PILIH GRUP',
                  sections: [{ title: Ryuu ? 'Semua Grup' : 'Grup Terdaftar', rows }]
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
