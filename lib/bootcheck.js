// lib/bootcheck.js — Diagnosa startup (non-fatal, hanya mencetak informasi)
//
// Tujuan: begitu bot dijalankan, panel langsung menunjukkan versi library WA
// yang BENAR-BENAR terpasang, apakah ada lebih dari satu salinan libsignal,
// apakah ada paket libsignal tiruan berbahaya, dan apakah sesi sudah terdaftar.
// Semua dibungkus try/catch: file ini tidak boleh menjatuhkan bot.
'use strict'

const fs = require('fs')
const path = require('path')

// Paket libsignal tiruan yang pernah dilaporkan sebagai malware (menimpa file
// Baileys dan memakai sesi WhatsApp login untuk aksi di luar kendali pemilik bot).
const SUSPICIOUS = [
  '@sauruslord/libsignal',
  '@zizie071/libsignal-node',
  '@skyzopedia/libsignal-node',
  '@dappaoffc/baileys-mod',
  '@itsmee_aizat.id/baileys2'
]

function readPkg(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
  } catch {
    return null
  }
}

function findAll(root, name, depth = 0, out = []) {
  if (depth > 4) return out
  const nm = path.join(root, 'node_modules')
  if (!fs.existsSync(nm)) return out
  const direct = path.join(nm, name)
  if (fs.existsSync(direct)) out.push(direct)
  let entries = []
  try { entries = fs.readdirSync(nm) } catch { return out }
  for (const e of entries) {
    if (e.startsWith('.')) continue
    if (e.startsWith('@')) {
      let scoped = []
      try { scoped = fs.readdirSync(path.join(nm, e)) } catch {}
      for (const s of scoped) findAll(path.join(nm, e, s), name, depth + 1, out)
    } else {
      const sub = path.join(nm, e)
      if (fs.existsSync(path.join(sub, 'node_modules'))) findAll(sub, name, depth + 1, out)
    }
  }
  return out
}

function runBootCheck({ sessionDir = 'Alyachan', logger = console } = {}) {
  const root = path.join(__dirname, '..')
  const L = (...a) => logger.log('[BOOT]', ...a)
  const W = (...a) => logger.warn('[BOOT] ⚠️', ...a)

  try {
    L(`Node ${process.version} | NODE_ENV=${process.env.NODE_ENV || '(kosong)'}`)

    // Library WA utama
    const wa = readPkg(path.join(root, 'node_modules', '@whiskeysockets/baileys'))
    if (wa) L(`@whiskeysockets/baileys terpasang: v${wa.version || '?'}${wa.name && wa.name !== '@whiskeysockets/baileys' ? ` (name=${wa.name})` : ''}`)
    else W('Paket "@whiskeysockets/baileys" TIDAK ditemukan di node_modules. Jalankan npm install ulang.')

    // libsignal: harus tepat satu salinan resmi
    const sigs = findAll(root, 'libsignal')
    if (!sigs.length) {
      W('Paket "libsignal" TIDAK ditemukan. Tanpa ini bot bisa connect tapi tidak bisa mendekripsi pesan masuk.')
    } else {
      const seen = sigs.map((d) => {
        const p = readPkg(d) || {}
        const repo = typeof p.repository === 'string' ? p.repository : p.repository?.url || ''
        return { dir: path.relative(root, d), version: p.version || '?', repo, name: p.name || '?' }
      })
      for (const s of seen) L(`libsignal: ${s.dir} v${s.version}${s.repo ? ` <- ${s.repo}` : ''}`)
      const versions = new Set(seen.map((s) => s.version))
      if (seen.length > 1 && versions.size > 1) {
        W('Ada beberapa salinan libsignal dengan versi BERBEDA. Ini penyebab klasik pesan gagal didekripsi. ' +
          'Hapus node_modules + package-lock.json lalu npm install ulang.')
      }
      for (const s of seen) {
        if (s.repo && !/whiskeysockets\/libsignal-node/i.test(s.repo) && !/signalapp|libsignal/i.test(s.repo)) {
          W(`libsignal di ${s.dir} berasal dari sumber tidak dikenal: ${s.repo}`)
        }
      }
    }

    // Paket tiruan berbahaya
    for (const bad of SUSPICIOUS) {
      const hits = findAll(root, bad)
      if (hits.length) {
        W(`PAKET BERBAHAYA terdeteksi: ${bad} (${hits.map((h) => path.relative(root, h)).join(', ')}). ` +
          'Hapus node_modules, buang dependency itu dari package.json, lalu pairing ulang dengan nomor/sesi baru.')
      }
    }

    // Status sesi
    const credsPath = path.join(root, sessionDir, 'creds.json')
    if (fs.existsSync(credsPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
        const files = fs.readdirSync(path.join(root, sessionDir)).length
        L(`Sesi "${sessionDir}": registered=${!!creds.registered}, me=${creds.me?.id || '-'}, jumlah file=${files}`)
        if (!creds.registered) W('creds.json ada tapi registered=false → bot akan meminta pairing ulang.')
      } catch (e) {
        W(`creds.json di "${sessionDir}" tidak bisa dibaca (${e.message}). Hapus folder sesi lalu pairing ulang.`)
      }
    } else {
      L(`Sesi "${sessionDir}" belum ada → bot akan meminta nomor untuk pairing.`)
    }
  } catch (e) {
    logger.warn('[BOOT] bootcheck gagal (diabaikan):', e?.message || e)
  }
}

module.exports = { runBootCheck }
