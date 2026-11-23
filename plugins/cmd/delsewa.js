// Plugin: delsewa
// Fixed: removed socketon dependency, self-contained, aligned dengan addsewa.js pattern
// Commands: delsewa

'use strict'

const path = require('path')
const fs   = require('fs')

const SEWA_DB = path.join(process.cwd(), 'database', 'sewa.json')

// ─── helpers inline (sama seperti addsewa.js) ──────────────────────────────
function msToDate (ms) {
  if (ms <= 0) return '0d 0h 0m 0s'
  const days  = Math.floor(ms / (24 * 60 * 60 * 1000))
  const daysMs  = ms % (24 * 60 * 60 * 1000)
  const hours = Math.floor(daysMs / (60 * 60 * 1000))
  const hoursMs = ms % (60 * 60 * 1000)
  const mins  = Math.floor(hoursMs / (60 * 1000))
  const minsMs  = ms % (60 * 1000)
  const secs  = Math.floor(minsMs / 1000)
  return `${days}d ${hours}h ${mins}m ${secs}s`
}

function loadSewa () {
  try {
    if (!fs.existsSync(SEWA_DB)) fs.writeFileSync(SEWA_DB, '[]', 'utf-8')
    return JSON.parse(fs.readFileSync(SEWA_DB, 'utf-8')) || []
  } catch { return [] }
}

function saveSewa (sewa) {
  fs.writeFileSync(SEWA_DB, JSON.stringify(sewa, null, 2), 'utf-8')
  global.sewa = sewa
}

async function getGcName (alya, id) {
  try {
    const meta = await alya.groupMetadata(id)
    return meta?.subject || id
  } catch {
    return id
  }
}

module.exports = {
  command: ['delsewa'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { prefix, Ryuu, replyalya, replytolak, text } = ctx

    if (!Ryuu) return replytolak('❌ Fitur ini khusus Owner!')

    const sewa = global.sewa?.length ? global.sewa : loadSewa()

    if (!sewa.length) return replyalya('📭 Belum ada data sewa aktif.')

    // ── Mode 1: .delsewa tanpa argumen → kirim single_select list ──────────
    if (!text || !text.trim()) {
      // Build rows untuk single_select
      const rows = await Promise.all(
        sewa.map(async (x) => {
          const nama = await getGcName(alya, x.id)
          const expiredText = x.expired === 'PERMANENT'
            ? 'PERMANENT'
            : msToDate(x.expired - Date.now())

          return {
            header     : '',
            title      : nama,
            description: `ID: ${x.id}\nExpired: ${expiredText}`,
            id         : `${prefix}confirmdelsewa ${x.id}`
          }
        })
      )

      // Kirim pakai sendButtonsV2 jika tersedia, fallback ke nativeFlow manual
      if (typeof alya.sendButtonsV2 === 'function') {
        return alya.sendButtonsV2(m.chat, {
          body   : '📋 Pilih grup yang ingin dihapus dari daftar sewa:',
          footer : 'Alya Bot V20',
          header : '🗑️ Daftar Sewa Aktif',
          buttons: [{
            type  : 'single_select',
            title : 'Pilih Grup',
            rows
          }]
        }, { quoted: m })
      }

      // Fallback: kirim via nativeFlowMessage manual (anya-bail compatible)
      const { proto } = require('@whiskeysockets/baileys')

      const interactiveMsg = {
        body  : { text: '📋 Pilih grup yang ingin dihapus dari daftar sewa:' },
        footer: { text: 'Alya Bot V20' },
        header: {
          hasMediaAttachment: false,
          title: '🗑️ Daftar Sewa Aktif'
        },
        nativeFlowMessage: {
          buttons: [{
            name            : 'single_select',
            buttonParamsJson: JSON.stringify({
              title   : 'Pilih Grup',
              sections: [{ title: 'Sewa Aktif', rows }]
            })
          }]
        }
      }

      await alya.sendMessage(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata       : {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: interactiveMsg
          }
        }
      }, { quoted: m })

      return
    }

    // ── Mode 2: .delsewa <groupId> langsung ────────────────────────────────
    const targetId = text.trim()

    // ── Mode 3: .confirmdelsewa <groupId> dari button response ─────────────
    // (handled di sini juga supaya satu file)
    return _doDelete(alya, m, ctx, sewa, targetId)
  }
}

// ─── confirmdelsewa handler ────────────────────────────────────────────────
const _confirmMod = {
  command: ['confirmdelsewa'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { Ryuu, text, replytolak } = ctx
    if (!Ryuu) return replytolak('❌ Fitur ini khusus Owner!')

    const targetId = (text || '').trim()
    if (!targetId) return m.reply('❌ ID grup tidak ditemukan.')

    const sewa = global.sewa?.length ? (global.sewa) :
      (() => {
        try { return JSON.parse(require('fs').readFileSync(require('path').join(process.cwd(), 'database', 'sewa.json'), 'utf-8')) } catch { return [] }
      })()

    return _doDelete(alya, m, ctx, sewa, targetId)
  }
}

async function _doDelete (alya, m, ctx, sewa, targetId) {
  const { replyalya } = ctx

  const idx = sewa.findIndex(x => x.id === targetId)

  if (idx === -1) {
    return replyalya(
      `❌ Grup dengan ID berikut tidak ditemukan di database sewa:\n\`${targetId}\``
    )
  }

  const entry  = sewa[idx]
  const nama   = await (async () => {
    try { return (await alya.groupMetadata(entry.id))?.subject || entry.id } catch { return entry.id }
  })()

  sewa.splice(idx, 1)

  const fs   = require('fs')
  const path = require('path')
  const SEWA_DB = path.join(process.cwd(), 'database', 'sewa.json')

  try {
    fs.writeFileSync(SEWA_DB, JSON.stringify(sewa, null, 2), 'utf-8')
    global.sewa = sewa
  } catch (e) {
    return replyalya(`❌ Gagal menyimpan perubahan database: ${e.message}`)
  }

  await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  return replyalya(
    `╭━━━〔 🗑️ *SEWA DIHAPUS* 〕━━━⬣\n` +
    `┃\n` +
    `┃ 🏷️ Nama : *${nama}*\n` +
    `┃ 🆔 ID   : \`${entry.id}\`\n` +
    `┃\n` +
    `┃ ✅ Grup berhasil dihapus dari daftar sewa.\n` +
    `┃ 📊 Sisa sewa: ${sewa.length} grup\n` +
    `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
  )
}

// Export sebagai array (2 handler dari 1 file)
module.exports = [module.exports, _confirmMod]
