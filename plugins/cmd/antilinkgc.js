// Plugin: antilinkgc
// Commands: antilinkgc
// FIX:
//   1. mess.only.group → gunakan ctx.mess atau global.mess dengan fallback string
//   2. fs.readFileSync dibungkus try/catch agar tidak crash saat file kosong/rusak
//   3. Inisialisasi file DB otomatis jika belum ada
//   4. Hapus path yang tidak perlu
//   5. generateWAMessageFromContent fallback ke plain text jika gagal

'use strict'
const fs   = require('fs')
const path = require('path')
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const DB_PATH     = './database/antilinkgc.json'
const WARN_PATH   = './database/antilinkgc-warning.json'

function loadDB(filePath, defaultVal = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2))
      return defaultVal
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return defaultVal
  }
}

function saveDB(filePath, data) {
  try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)) } catch {}
}

module.exports = {
  command: ['antilinkgc'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      isGroup, isBotAdmins, isAdmins, isGroupAdmins, isAdminOrOwner,
      Ryuu, botNumber,
      reply, replyalya, replytolak,
      mess
    } = ctx

    // ✅ FIX: gunakan ctx.mess dengan fallback string
    const onlyGroup = mess?.only?.group || 'Fitur ini hanya bisa dipakai di dalam grup!'

    if (!m.isGroup) return replytolak(onlyGroup)
    if (!isBotAdmins) return replytolak('Alya harus menjadi admin terlebih dahulu!')

    const isAdmin = isAdmins || isGroupAdmins || false
    if (!isAdmin && !Ryuu) return replyalya('Fitur ini khusus admin grup!')

    // ✅ FIX: safe load DB
    let antilinkDb = loadDB(DB_PATH, {})
    const action   = (args[0] || '').toLowerCase()
    const mode     = args[1] ? args[1].toLowerCase() : 'warning'

    // ── .antilinkgc on [warning|delete] ───────────────────────
    if (action === 'on') {
      if (!['warning', 'delete'].includes(mode)) {
        return replyalya(
          `⚠️ Mode salah!\n` +
          `Gunakan:\n` +
          `• \`${prefix}${command} on warning\` — Hapus + 3x warning → kick\n` +
          `• \`${prefix}${command} on delete\` — Hapus link tanpa warning`
        )
      }
      antilinkDb[m.chat] = { mode }
      saveDB(DB_PATH, antilinkDb)
      return replyalya(
        `✅ *AntilinkGC Aktif!*\n\n` +
        `📌 Mode: *${mode === 'warning' ? '⚠️ Warning (Hapus + 3x → Kick)' : '🗑️ Delete (Hapus Link Saja)'}*\n\n` +
        `_Link grup WA yang dikirim non-admin akan ditindak otomatis._`
      )
    }

    // ── .antilinkgc off ────────────────────────────────────────
    if (action === 'off') {
      if (!antilinkDb[m.chat]) return replyalya('ℹ️ AntilinkGC memang sudah nonaktif di grup ini.')
      delete antilinkDb[m.chat]
      saveDB(DB_PATH, antilinkDb)
      // Bersihkan warning counter grup ini
      let warnDb = loadDB(WARN_PATH, {})
      Object.keys(warnDb).forEach(k => { if (k.startsWith(m.chat)) delete warnDb[k] })
      saveDB(WARN_PATH, warnDb)
      return replyalya('❌ *AntilinkGC dinonaktifkan.* Perlindungan link grup dihentikan.')
    }

    // ── .antilinkgc (status) ───────────────────────────────────
    const isOn       = !!antilinkDb[m.chat]
    const currentMode = isOn ? antilinkDb[m.chat].mode : 'Belum diatur'

    // Coba kirim interactive button, fallback ke teks biasa
    try {
      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `🛡️ *PENGATURAN ANTILINKGC*\n\nStatus: ${isOn ? '🟢 ON' : '🔴 OFF'}\nMode: *${currentMode}*\n\nSilakan pilih tindakan:`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: global.botname || 'Alya Bot'
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: '🛡️ Group Link Protector',
                hasMediaAttachment: false
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: 'Ubah Status / Mode',
                    sections: [{
                      title: 'Pilih Aksi',
                      rows: [
                        { title: 'Aktifkan (Mode Warning)', description: 'Hapus link + Peringatan 3x → Kick', id: `${prefix}${command} on warning` },
                        { title: 'Aktifkan (Mode Delete)',  description: 'Hapus link saja, tanpa kick',       id: `${prefix}${command} on delete`  },
                        { title: 'Matikan Fitur',           description: 'Nonaktifkan perlindungan link',     id: `${prefix}${command} off`         }
                      ]
                    }]
                  })
                }]
              })
            })
          }
        }
      }, { quoted: m })
      await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch {
      // Fallback: plain text
      replyalya(
        `🛡️ *STATUS ANTILINKGC*\n\n` +
        `Status : *${isOn ? '🟢 ON' : '🔴 OFF'}*\n` +
        `Mode   : *${currentMode}*\n\n` +
        `*Cara penggunaan:*\n` +
        `• \`${prefix}${command} on warning\` — Hapus + 3x warning → kick\n` +
        `• \`${prefix}${command} on delete\`  — Hapus link tanpa kick\n` +
        `• \`${prefix}${command} off\`        — Matikan fitur`
      )
    }
  }
}
