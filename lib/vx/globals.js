// lib/vx/globals.js — global yang diharapkan plugin vanXone tapi tidak disediakan
// oleh infrastruktur Alya. Helper apiUrl/fetchApi/postApi/getBuffer disalin apa
// adanya dari vanXone lib/engine/core.js (lapisan "sahril"); identitas (namaBot,
// fkontak, fmeta, fstatus) memakai branding Alya, bukan vanXone.
//
// Dipanggil sekali oleh lib/vx/dispatch.js setelah vx/settings.js dimuat.
'use strict'

const axios = require('axios')
const crypto = require('crypto')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// ── helper API (verbatim dari vanXone lib/engine/core.js) ─────────────────────
function errFromResponse(e) {
  const d = e && e.response && e.response.data
  if (d) {
    let t = ''
    try {
      t = Buffer.isBuffer(d) || d instanceof ArrayBuffer ? Buffer.from(d).toString('utf8') : typeof d === 'string' ? d : JSON.stringify(d)
    } catch {}
    try {
      const j = JSON.parse(t)
      const msg = j.message || j.error || j.msg
      if (msg) return new Error(String(msg))
    } catch {}
    if (t && t.length < 300) return new Error(t)
  }
  return e
}

// URL API: apiUrl('kyzz', '/api/x', { a: 1 }, 'apikey')
function apiUrl(name, p, params = {}, keyParam) {
  const base = String((global.APIs && global.APIs[name]) || '').replace(/\/+$/, '')
  if (!base) throw new Error(`API "${name}" belum terdaftar di global.APIs (settings.js).`)
  const key = global.apiKeys && global.apiKeys[name]
  if (name === 'kyzz' && !key) throw new Error('Apikey kyzz belum diisi. Owner: isi global.apiKeys = { kyzz: "..." } di settings.js')
  const u = new URL(base + '/' + String(p).replace(/^\/+/, ''))
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null) u.searchParams.set(k, String(v))
  if (key) u.searchParams.set(keyParam || 'apikey', key)
  return u.toString()
}

async function fetchApi(name, p, params = {}, opts = {}) {
  const url = apiUrl(name, p, params)
  try {
    const res = await axios.get(url, { timeout: 60000, headers: { 'User-Agent': UA }, ...opts })
    return opts.responseType === 'arraybuffer' ? Buffer.from(res.data) : res.data
  } catch (e) {
    throw errFromResponse(e)
  }
}

async function postApi(name, p, body, opts = {}) {
  const url = apiUrl(name, p, {})
  const headers = { 'User-Agent': UA, ...(body && typeof body.getHeaders === 'function' ? body.getHeaders() : {}), ...(opts.headers || {}) }
  try {
    const res = await axios.post(url, body, { timeout: 90000, maxBodyLength: Infinity, maxContentLength: Infinity, ...opts, headers })
    return opts.responseType === 'arraybuffer' ? Buffer.from(res.data) : res.data
  } catch (e) {
    throw errFromResponse(e)
  }
}

async function getBuffer(url, opts = {}) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': UA }, ...opts })
  return Buffer.from(res.data)
}

// ── identitas palsu untuk quoted (bentuk dari lib/engine/lumen.js, brand Alya) ─
function fake(text, jid = '0@s.whatsapp.net') {
  return {
    key: { remoteJid: 'status@broadcast', fromMe: false, id: 'ALYAVX' + crypto.randomBytes(6).toString('hex').toUpperCase(), participant: jid },
    message: { extendedTextMessage: { text } },
  }
}

function init() {
  if (global.__vxGlobalsDone) return
  global.__vxGlobalsDone = true

  // Default engine vanXone (pulse.js + core.js) — key yang sudah ada MENANG.
  // 'lol' & 'nexray' dipakai fetchApi/API tapi tidak didefinisikan di vanXone
  // sendiri; base diisi dari host yang dipakai plugin agar tidak langsung mati.
  global.APIs = Object.assign({
    faa: 'https://api-faa.my.id',
    deline: 'https://api.deline.web.id',
    kyzz: 'https://api.kyzzz.xyz',
    azbry: 'https://api.azbry.com',
    siputzx: 'https://api.siputzx.my.id',
    lol: 'https://api.lolhuman.xyz',
    nexray: 'https://api.nexray.web.id',
  }, global.APIs || {})
  global.apiKeys = Object.assign({ kyzz: '', azbry: '', siputzx: '' }, global.apiKeys || {})
  global.APIKeys = global.APIKeys || {}

  global.API = apiUrl
  global.fetchApi = fetchApi
  global.postApi = postApi
  global.getBuffer = global.getBuffer || getBuffer

  // Branding: ikut Alya, jangan bocorkan identitas vanXone.
  const brand = global.botname || 'Alya'
  if (global.namaBot === undefined) global.namaBot = brand
  if (global.namebot === undefined) global.namebot = brand
  if (global.botShort === undefined) global.botShort = brand
  if (global.namaOwner === undefined) global.namaOwner = global.ownername || 'Owner'
  if (global.thumbnail === undefined) global.thumbnail = global.alyaThumbUrl || ''
  if (global.fotoreply === undefined) global.fotoreply = global.thumbnail
  if (!global.fstatus) global.fstatus = fake(brand)
  if (!global.fmeta) global.fmeta = fake(brand)
  if (!global.fkontak) {
    global.fkontak = {
      key: { remoteJid: 'status@broadcast', fromMe: false, id: 'ALYAVXKONTAK', participant: '0@s.whatsapp.net' },
      message: { contactMessage: { displayName: brand, vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${brand};;;\nFN:${brand}\nTEL;type=CELL;waid=0:+0\nEND:VCARD` } },
    }
  }

  // global.react(client, m, emoji|'loading'|'success'|'error') — pola lumen.js
  if (!global.react) {
    global.react = async (client, m, type) => {
      const map = { loading: '⏳', success: '✅', error: '❌', wait: '⏳', done: '✅', fail: '❌' }
      const text = map[type] || type
      try { return await (client || {}).sendMessage(m.chat || m.key.remoteJid, { react: { text, key: m.key } }) } catch { return null }
    }
  }

  // ── Global tambahan yang dibaca plugin vanXone ──────────────────────────────
  // Semua memakai nilai Alya bila tersedia; tidak pernah menimpa settings Alya.
  if (global.wagc === undefined) global.wagc = global.saluran || global.channel || ''
  if (global.qpix === undefined) global.qpix = global.fkontak
  if (global.namech === undefined) global.namech = global.channeln || brand
  if (global.idch === undefined) global.idch = global.channel || ''
  if (global.thumb === undefined) global.thumb = global.thumbnail || ''
  if (global.stickpack === undefined) global.stickpack = global.packname || brand
  if (global.stickauth === undefined) global.stickauth = global.author || ''
  if (global.ownerName === undefined) global.ownerName = global.ownername || 'Owner'
  if (global.geminiApiKey === undefined) global.geminiApiKey = global.apiKeys?.gemini || process.env.GEMINI_API_KEY || ''
  if (globalThis.OMDB_API_KEY === undefined) globalThis.OMDB_API_KEY = process.env.OMDB_API_KEY || ''
  if (global.RIMURU_DEVELOPER === undefined) global.RIMURU_DEVELOPER = brand

  // lumen/lib/sticker.js membaca global.support.ffmpeg dll. Tanpa ini → TypeError.
  // Alya tidak punya ffmpeg flag → matikan (plugin jatuh ke jalur pure-JS).
  if (global.support === undefined) {
    global.support = { ffmpeg: false, ffmpegWebp: false, convert: false, magick: false, gm: false }
  }

  // Banyak plugin lumen/notif membaca global.conn / global.sock / global.bot.
  // Sediakan proxy malas yang meneruskan ke socket Alya aktif (diset adapter.run).
  if (global.__vxAlya === undefined) {
    let current = null
    Object.defineProperty(global, '__vxAlya', {
      configurable: true, enumerable: false,
      get() { return current }, set(v) { current = v },
    })
  }
  if (global.__vxLazySock === undefined) {
    const lazy = new Proxy({}, {
      get(_t, p) {
        const s = global.__vxAlya
        if (!s) return p === 'then' ? undefined : async () => { throw new Error('Socket Alya belum siap.') }
        const v = s[p]
        return typeof v === 'function' ? v.bind(s) : v
      },
      has() { return true },
    })
    Object.defineProperty(global, '__vxLazySock', { value: lazy, enumerable: false, configurable: true })
  }
  for (const k of ['conn', 'sock', 'client', 'connection', 'bot']) {
    if (global[k] === undefined) global[k] = global.__vxLazySock
  }

  // pulse/plugins/search/playcall.js mengharapkan VOIP client host. Tidak ada di
  // Alya → sediakan objek dengan pesan jelas, bukan TypeError.
  if (global.voipClient === undefined) {
    global.voipClient = {
      call: async () => { throw new Error('Fitur panggilan VOIP tidak tersedia di Alya.') },
    }
  }

  // vortex/plugins/maker/fakeduoff.js — akses user & limit lewat global helper.
  // Alya menyimpan db.users dengan JID lengkap; plugin lama sering mengirim
  // digits-only → normalisasi di sini supaya pengecekan limit tidak lolos.
  const jidKey = (jid) => {
    const s = String(jid || '')
    if (!s) return s
    if (s.includes('@')) return s
    return `${s.replace(/\D/g, '')}@s.whatsapp.net`
  }
  if (global.getUserData === undefined) {
    global.getUserData = (jid) => global.db?.users?.[jidKey(jid)] || {}
  }
  if (global.kurangiLimitGlobal === undefined) {
    global.kurangiLimitGlobal = (jid, n = 1) => {
      const u = global.db?.users?.[jidKey(jid)]
      if (u) u.limit = Math.max(0, Number(u.limit || 0) - Number(n || 1))
      return Number(u?.limit || 0)
    }
  }
  if (global.sendAdminLog === undefined) {
    global.sendAdminLog = async (text) => {
      try {
        const owner = Array.isArray(global.owner) ? global.owner[0] : global.owner
        if (owner && global.bot?.sendMessage) {
          await global.bot.sendMessage(String(owner).split(':')[0] + '@s.whatsapp.net', { text: String(text) })
        }
      } catch {}
    }
  }
  if (global.db && global.db.getUserData === undefined) global.db.getUserData = global.getUserData

  global.plugins = global.plugins || {}
}

module.exports = { init, apiUrl, fetchApi, postApi, getBuffer, fake }
