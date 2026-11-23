// lib/vx/dispatch.js — titik masuk eksekusi plugin vanXone hasil porting.
//
// Dipakai dua jalur:
//   1. Mode CASE: Alya.js memanggil tryHandle(command, alya, m, ctx) SEBELUM
//      switch(command). Command yang terdaftar di commands.json dijalankan dengan
//      kode vanXone asli — menimpa case V13 untuk command yang sama, dan menambah
//      command baru yang tidak punya case. Tidak terdaftar → false → switch jalan.
//   2. Mode PLUGIN: wrapper plugins/cmd/vx_*.js memanggil runFile(rel, alya, m, ctx).
//
// Plugin dimuat MALAS (saat command pertama kali dipakai) dan di-cache, supaya
// startup bot tidak menanggung side-effect load 800+ plugin sekaligus.
'use strict'

require('./bootstrap')
const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('node:url')
const { loadPlugin } = require('./loader')
const { run, makeMessage, makeExtras, makePassiveConn } = require('./adapter')

const REPO = path.join(__dirname, '..', '..')

// Settings/config vanXone yang SUDAH DINETRALKAN (scripts/vx-copy.js): menyediakan
// global.APIs/apiKeys/ghTokens dll tanpa menimpa identitas Alya. Lalu globals.js
// menambah helper fetchApi/API/react/fkontak yang diharapkan plugin vanXone.
try { require(path.join(REPO, 'vx/settings.js')) } catch (e) { console.error('[vx] settings gagal dimuat:', e?.message || e) }
try { require(path.join(REPO, 'vx/config.js')) } catch (e) { console.error('[vx] config gagal dimuat:', e?.message || e) }
require('./globals').init()

// DB internal tiap engine (rimuru/ourin/vemzo) tidak pernah di-init oleh vanXone
// sendiri → getDatabase() melempar saat command pertama dipakai. Init sekali ke
// direktori vx/.data (terkontain, tidak menulis ke database/ milik Alya).
// Gagal init = plugin bersangkutan tetap error, tapi startup Alya tidak terdampak.
async function initEngineDbs() {
  const jobs = [
    ['zenith', 'engine/zenith/src/lib/rimuru-database.js'],
    ['nimbus', 'engine/nimbus/src/lib/ourin-database-core.js'],
    ['orbit', 'engine/orbit/src/lib/vemzo-database.js'],
  ]
  for (const [engine, rel] of jobs) {
    try {
      const mod = await import(pathToFileURL(path.join(REPO, 'vx', rel)).href)
      if (typeof mod.initDatabase === 'function') {
        await mod.initDatabase(path.join(REPO, 'vx', '.data', engine))
      }
    } catch (e) {
      console.error('[vx] init DB ' + engine + ' gagal:', e?.message || e)
    }
  }
}
let _dbInit = null
function ensureEngineDbs() {
  if (!_dbInit) _dbInit = initEngineDbs()
  return _dbInit
}
ensureEngineDbs()

const COMMANDS = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands.json'), 'utf8'))
let HOOKS = []
try { HOOKS = JSON.parse(fs.readFileSync(path.join(__dirname, 'hooks.json'), 'utf8')) } catch {}
const cache = new Map() // rel → Promise<plugin>
const hookFail = new Map() // rel → timestamp, modul gagal tidak dicoba 10 menit

// ── hook pasif (handler.all / handler.before) ──────────────────────────────────
// vanXone memanggil hook ini untuk SETIAP pesan, termasuk jawaban game.
// Alya tidak punya konsep ini → dipanggil dari lib/inbound.js sebelum dispatch.
function ownerList() {
  const out = new Set((global.owner || []).map(String))
  try {
    const raw = fs.readFileSync(path.join(REPO, 'database', 'owner.json'), 'utf8')
    for (const v of JSON.parse(raw)) out.add(String(v))
  } catch {}
  return [...out].map(v => v.split('@')[0].replace(/\D/g, '')).filter(Boolean)
}

function passiveCtx(alya, m, store) {
  const body = String(m.body || m.text || '')
  const first = body.trim().split(/\s+/)[0] || ''
  const prefix = /^[.!#/$]/.test(first) ? first[0] : '.'
  const sender = m.sender || ''
  const num = String(sender).split('@')[0].replace(/\D/g, '')
  const u = global.db?.users?.[sender] || {}
  return {
    body, text: body, q: '', args: body.trim().split(/\s+/).slice(1),
    command: first.replace(/^[.!#/$]/, '').toLowerCase(),
    prefix, usedPrefix: prefix,
    sender, from: m.chat, chat: m.chat, pushname: m.pushName || m.name || '',
    isGroup: !!m.isGroup, groupMetadata: null, store,
    botNumber: alya.user?.id,
    Ryuu: ownerList().includes(num),
    isPrem: !!(u.premium || (global.prem || []).map(String).some(v => v.split('@')[0] === num)),
    isGroupAdmins: false, isBotAdmins: false,
    quoted: m.quoted, mtype: m.mtype, mime: m.mimetype || '',
    isCmd: /^[.!#/$]/.test(first),
  }
}

async function tryPassive(alya, m, store) {
  if (!m || !m.body && !m.text) return false
  let handled = false
  for (const entry of HOOKS) {
    if (hookFail.get(entry.rel) > Date.now()) continue
    let plugin
    try {
      plugin = await getPlugin(entry.rel)
    } catch (e) {
      hookFail.set(entry.rel, Date.now() + 600000)
      console.error('[vx hook load]', entry.rel, '-', e?.message || e)
      continue
    }
    const h = plugin.raw?.handler || plugin.handler
    if (!h || (typeof h.all !== 'function' && typeof h.before !== 'function')) continue
    const ctx = passiveCtx(alya, m, store)
    global.__vxAlya = alya
    const conn = makePassiveConn(alya, m, ctx)
    ctx._vxSock = conn
    const vm = makeMessage(alya, m, ctx)
    const extras = makeExtras(plugin, conn, vm, alya, m, ctx)
    for (const kind of entry.kinds || ['all', 'before']) {
      if (typeof h[kind] !== 'function') continue
      try {
        await h[kind].call(conn, vm, extras)
        handled = true
      } catch (e) {
        console.error(`[vx ${kind}]`, entry.rel, '-', e?.message || e)
      }
    }
  }
  return handled
}

function getPlugin(rel) {
  if (!cache.has(rel)) {
    // Rel berawalan 'plugins/' = file native Alya (vxmenu); selain itu = pohon vx/.
    const target = rel.startsWith('plugins/') ? path.join(REPO, rel) : rel
    cache.set(rel, loadPlugin(target).catch(e => { cache.delete(rel); throw e }))
  }
  return cache.get(rel)
}

// Untuk wrapper mode plugin: lempar error ke pemanggil (alya.js sudah try/catch).
async function runFile(rel, alya, m, ctx) {
  const plugin = await getPlugin(rel)
  return run(plugin, alya, m, ctx)
}

// Untuk mode case: true = sudah ditangani (jangan lanjut ke switch V13).
async function tryHandle(command, alya, m, ctx) {
  const cmd = String(command || '').toLowerCase()
  const entry = COMMANDS[cmd]
  if (!entry) return false
  try {
    await runFile(entry.rel, alya, m, ctx)
  } catch (e) {
    console.error('[vx Run Error]', entry.rel, '-', e?.message || e)
    // Fallback wajib: error plugin vx tidak boleh menelan command Alya;
    // kembalikan false agar switch asli Alya tetap menangani perintah ini.
    return false
  }
  return true
}

module.exports = { tryHandle, tryPassive, runFile, getPlugin, COMMANDS, HOOKS }
