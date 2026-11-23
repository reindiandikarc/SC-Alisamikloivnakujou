// lib/compat.js — cek kompatibilitas Baileys (versi + fungsi yang dipakai fitur bot). Tujuan: tidak ada kejutan.
const path = require('path')
const fs = require('fs')

const CAPS = [
  ['Saluran: info & ikuti', ['newsletterMetadata', 'newsletterFollow', 'newsletterUnfollow']],
  ['Saluran: kelola', ['newsletterCreate', 'newsletterUpdateName', 'newsletterUpdateDescription', 'newsletterUpdatePicture']],
  ['Saluran: reaksi & senyap', ['newsletterReactMessage', 'newsletterMute', 'newsletterUnmute']],
  ['Grup: kelola member', ['groupParticipantsUpdate', 'groupSettingUpdate', 'groupMetadata']],
  ['Grup: pengaturan lanjut', ['groupToggleEphemeral', 'groupMemberAddMode', 'groupJoinApprovalMode', 'groupRequestParticipantsList', 'groupRequestParticipantsUpdate']],
  ['Pesan: kirim & kirim ulang', ['sendMessage', 'relayMessage', 'waUploadToServer']]
]

function baileysVersion() {
  for (const name of ['@whiskeysockets/baileys', 'baileys']) {
    try {
      let dir = path.dirname(require.resolve(name))
      for (let i = 0; i < 6; i++) {
        const f = path.join(dir, 'package.json')
        if (fs.existsSync(f)) {
          const j = JSON.parse(fs.readFileSync(f, 'utf8'))
          if (j.name === name) return `${name}@${j.version}`
        }
        dir = path.dirname(dir)
      }
    } catch {}
  }
  return 'tidak terbaca'
}

function report(sock) {
  let proto = null
  try {
    proto = require('@whiskeysockets/baileys').proto
  } catch {}
  const msgProto = proto?.Message?.prototype || {}
  const items = CAPS.map(([label, fns]) => {
    const missing = fns.filter((f) => typeof sock?.[f] !== 'function')
    return { label, ok: !missing.length, missing }
  })
  items.push({ label: 'Status Grup (.swgc)', ok: 'groupStatusMessageV2' in msgProto, missing: ['groupStatusMessageV2'] })
  items.push({ label: 'Pesan interaktif (tombol)', ok: !!proto?.Message?.InteractiveMessage, missing: ['InteractiveMessage'] })
  return { version: baileysVersion(), node: process.version, items, allOk: items.every((i) => i.ok) }
}

let logged = false
function logOnce(sock) {
  if (logged) return
  logged = true
  try {
    const r = report(sock)
    const bad = r.items.filter((i) => !i.ok)
    console.log(`[COMPAT] ${r.version} • Node ${r.node} • ${bad.length ? `perlu perhatian: ${bad.map((b) => b.label).join(', ')} (ketik .cekbaileys)` : 'semua fitur didukung'}`)
  } catch (e) {
    console.log('[COMPAT] gagal memeriksa:', e.message)
  }
}

module.exports = { report, logOnce, baileysVersion }
