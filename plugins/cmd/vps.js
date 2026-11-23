// Plugin: vps — Panel kontrol & sensor kehidupan VPS Alya (1 file)
// Commands: vps, vpsstatus, vpspanel, vpslive
//
// Kenapa plugin ini ada:
//   1. Bot perlu bisa lapor "hidup/mati", "kapan mati", "berapa lama mati",
//      "berapa lama hidup", dan jadwal downtime tanpa buka dashboard.
//   2. Sensor mati TIDAK bisa menyalakan VPS-nya sendiri kalau VPS-nya benar-
//      benar mati (proses di dalam mesin mati ikut). Penjaga eksternal
//      (/data/workspace/alya-vps-watchdog) yang menyalakan setiap 10 menit.
//   3. Yang bisa dilakukan bot dari dalam: deteksi jeda hidup (dari
//      process.uptime() vs heartbeat terakhir), simpan riwayat mati, dan
//      mengirim perintah nyala/mati/rotate lewat file perintah yang dibaca
//      penjaga eksternal ≤1 menit kemudian.
//
// File lokal (runtime, jangan ikut di-sync):
//   ./database/vps_watchdog.json  -> heartbeat + riwayat mati
//   ./database/vps_cmd.json       -> perintah ke penjaga eksternal

const fs = require('fs')

const API_URL = 'https://api.instabox.sh'
const MACHINE = 'm_agralfkf6q2p3lxe7z6jrfosv4'
const KEY_FILE = '/data/home/.instabox_key'
const STATE_FILE = './database/vps_watchdog.json'
const CMD_FILE = './database/vps_cmd.json'
const NIGHT_START = '00:00'
const NIGHT_END = '05:00'
const ROTATE_AFTER_MIN = 450

let _stateReady = false

// ── util waktu ─────────────────────────────────────────────────────────────
function wibParts(date = new Date()) {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(date)
  const o = {}
  for (const x of p) o[x.type] = x.value
  return o
}
const wibClock = (date) => {
  const p = wibParts(date)
  return `${p.hour}:${p.minute}`
}
const wibFull = (date) => {
  const p = wibParts(date)
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second} WIB`
}
const isNight = (date) => {
  const c = wibClock(date)
  return c >= NIGHT_START && c < NIGHT_END
}
function dur(sec) {
  sec = Math.max(0, Math.floor(sec || 0))
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (d) return `${d}h ${h}j ${m}m`
  if (h) return `${h}j ${m}m ${s}d`
  if (m) return `${m}m ${s}d`
  return `${s}d`
}

// ── state lokal: heartbeat + riwayat mati ──────────────────────────────────
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function writeJson(file, obj) {
  try {
    fs.mkdirSync(require('path').dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(obj, null, 2))
  } catch {}
}
function ensureState() {
  if (_stateReady) return
  _stateReady = true
  const now = Date.now()
  const state = readJson(STATE_FILE, { events: [] })
  if (!Array.isArray(state.events)) state.events = []

  // process.uptime() = detik sejak node process ini start. Ini lebih awak
  // daripada tanggal module plugin di-require (plugin baru di-load saat
  // command pertama dipanggil), jadi tetap akurat walau bot restart tadi malam.
  const bootAt = now - Math.floor(process.uptime() * 1000)
  const last = state.lastHeartbeat ? Date.parse(state.lastHeartbeat) : null
  if (last && bootAt - last > 120000) {
    state.events.push({
      t: new Date(bootAt).toISOString(),
      type: 'downtime',
      from: state.lastHeartbeat,
      to: new Date(bootAt).toISOString(),
      seconds: Math.floor((bootAt - last) / 1000),
      note: 'bot/VPS mati terdeteksi dari jeda heartbeat'
    })
  }
  state.bootAt = new Date(bootAt).toISOString()
  state.lastHeartbeat = new Date(now).toISOString()
  state.events.push({ t: state.lastHeartbeat, type: 'boot', note: 'Alya aktif' })
  state.events = state.events.slice(-50)
  writeJson(STATE_FILE, state)

  setInterval(() => {
    const s = readJson(STATE_FILE, { events: [] })
    s.lastHeartbeat = new Date().toISOString()
    writeJson(STATE_FILE, s)
  }, 60000).unref()
}

// ── instabox REST ──────────────────────────────────────────────────────────
async function api(method, path) {
  const key = fs.readFileSync(KEY_FILE, 'utf8').trim()
  const headers = { Accept: 'application/json', 'X-API-Key': key }
  if (method === 'POST') {
    headers['Idempotency-Key'] = 'alya-' + Date.now() + '-' + Math.random().toString(16).slice(2)
  }
  const res = await fetch(API_URL + path, {
    method, headers, signal: AbortSignal.timeout(12000)
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

// ── tampilan panel ─────────────────────────────────────────────────────────
function buildPanel(machine, state) {
  const now = new Date()
  const st = String(machine.state || 'unknown').toUpperCase()
  const icon = st === 'RUNNING' ? '🟢' : st === 'SUSPENDED' ? '🟡' : '🔴'
  const runSec = machine.runStartedAt
    ? (now - Date.parse(machine.runStartedAt)) / 1000 : 0
  const maxSec = (machine.maxRunMinutes || 480) * 60
  const rotSec = ROTATE_AFTER_MIN * 60
  const sisaRotate = rotSec - runSec
  const sisaMax = maxSec - runSec
  const night = isNight(now)
  const bootSec = process.uptime()
  const lastDown = [...state.events].reverse().find(e => e.type === 'downtime')
  const nextRotate = new Date(Date.parse(machine.runStartedAt || now) + rotSec * 1000)

  const lines = [
    '╭━━━〔 🖥️ *ALYA VPS PANEL* 〕━━━⬣',
    `┃ 🕒 ${wibFull(now)}`,
    `┃ ${icon} Mesin : *${st}*`,
    `┃ 🤖 Bot  : *HIDUP* (${dur(bootSec)})`,
    `┃ ⏱️ Run  : ${dur(runSec)} / ${dur(maxSec)}`,
    `┃ 🔁 Rotasi dalam: ${sisaRotate > 0 ? dur(sisaRotate) : 'JALAN SEKARANG'}`,
    `┃ 🛑 Max-run sisa: ${sisaMax > 0 ? dur(sisaMax) : 'LEWAT!'}`,
    `┃ 🌙 Malam ${NIGHT_START}–${NIGHT_END}: ${night ? '🔒 DOWNTIME' : '✅ aktif'}`,
    `┃ 📅 Rotasi next: ${wibFull(nextRotate)}`,
    `┃ 💤 Mati terakhir: ${lastDown ? dur((now - Date.parse(lastDown.to)) / 1000) + ' lalu (' + dur(lastDown.seconds) + ')' : 'tidak ada catatan'}`,
    `┃ 🧠 OOM kill: ${machine.oomKills ?? 0} | Free plan: ${machine.free ? 'ya' : 'tidak'}`,
    '╰──────────────────────────────⬣',
    '',
    '`.vps uptime` · `.vps log` · `.vps jadwal` · `.vps help`'
  ]
  return lines.join('\n')
}

// ── perintah ke penjaga eksternal ──────────────────────────────────────────
function queue(action, m) {
  writeJson(CMD_FILE, {
    action,
    requestedAt: new Date().toISOString(),
    by: m.sender || ''
  })
}

module.exports = {
  command: ['vps', 'vpsstatus', 'vpspanel', 'vpslive'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { args, Ryuu, replyalya, replytolak, mess, prefix, command } = ctx
    if (!Ryuu) return replytolak(mess.only.owner)

    ensureState()
    const sub = String(args[0] || '').toLowerCase()

    if (['help', '?', 'bantuan'].includes(sub)) {
      return replyalya(
        '╭━━━〔 🖥️ *VPS CONTROL* 〕━━━⬣\n' +
        '┃ `.vps` / `.vps status` — panel lengkap\n' +
        '┃ `.vps uptime` — hidup & mati berapa lama\n' +
        '┃ `.vps log` — riwayat mati/boot\n' +
        '┃ `.vps jadwal` — jadwal nyala/mati\n' +
        '┃ `.vps nyala` — resume (lewat penjaga)\n' +
        '┃ `.vps mati` — suspend (lewat penjaga)\n' +
        '┃ `.vps rotate` — reset jam run 480m\n' +
        '╰──────────────────────────────⬣\n' +
        '⏳ Perintah kontrol dieksekusi penjaga eksternal ≤1 menit.'
      )
    }

    if (sub === 'jadwal' || sub === 'schedule') {
      const night = isNight(new Date())
      return replyalya(
        `🗓️ *Jadwal VPS Alya*\n\n` +
        `• 🌙 Downtime : ${NIGHT_START}–${NIGHT_END} WIB (${night ? 'sedang berjalan' : 'akan datang'})\n` +
        `• ☀️ Aktif     : ${NIGHT_END}–${NIGHT_START} WIB\n` +
        `• 🔁 Rotasi   : tiap ${ROTATE_AFTER_MIN} menit (reset batas 480m)\n` +
        `• 🩺 Cek hidup: tiap 10 menit oleh asisten\n` +
        `• ⚡ Perintah : dicek tiap 1 menit\n\n` +
        `Sekarang: *${wibFull(new Date())}*`
      )
    }

    if (sub === 'uptime' || sub === 'hidup') {
      const state = readJson(STATE_FILE, { events: [] })
      const lastDown = [...(state.events || [])].reverse().find(e => e.type === 'downtime')
      return replyalya(
        `⏱️ *Uptime Alya*\n\n` +
        `• Bot hidup : *${dur(process.uptime())}*\n` +
        `• Boot      : ${state.bootAt ? wibFull(Date.parse(state.bootAt)) : '-'}\n` +
        `• Heartbeat : ${state.lastHeartbeat ? wibFull(Date.parse(state.lastHeartbeat)) : '-'}\n` +
        `• Mati lalu : ${lastDown ? `${dur(lastDown.seconds)} (${wibFull(Date.parse(lastDown.to))})` : 'belum ada catatan'}\n` +
        `• Total mati tercatat: ${(state.events || []).filter(e => e.type === 'downtime').length}x`
      )
    }

    if (sub === 'log' || sub === 'riwayat') {
      const state = readJson(STATE_FILE, { events: [] })
      const ev = (state.events || []).slice(-12).reverse()
      if (!ev.length) return replyalya('Belum ada riwayat.')
      const txt = ev.map(e => {
        const icon = e.type === 'downtime' ? '💤' : e.type === 'boot' ? '🚀' : '•'
        return `${icon} ${wibFull(Date.parse(e.t))} — ${e.note || e.type}` +
          (e.seconds ? ` (${dur(e.seconds)})` : '')
      }).join('\n')
      return replyalya(`📜 *Riwayat VPS Alya*\n\n${txt}`)
    }

    if (['nyala', 'start', 'on', 'resume', 'wake'].includes(sub)) {
      queue('resume', m)
      return replyalya(`✅ Perintah *NYALAKAN* diterima.\nPenjaga eksternal mengeksekusi ≤1 menit${isNight(new Date()) ? ' — tapi jendela malam masih aktif, akan ditunda sampai 05:00 WIB' : ''}.`)
    }

    if (['mati', 'stop', 'off', 'suspend'].includes(sub)) {
      queue('suspend', m)
      return replyalya(`✅ Perintah *MATIKAN* diterima.\nPenjaga eksternal mengeksekusi ≤1 menit.\n⚠️ Bot akan ikut mati; otomatis nyala lagi di luar jendela malam.`)
    }

    if (['rotate', 'rotasi', 'restart'].includes(sub)) {
      queue('rotate', m)
      return replyalya(`✅ Perintah *ROTATE* diterima.\nPenjaga akan suspend→resume ≤1 menit untuk mereset jam run 480 menit.`)
    }

    let machine
    try {
      const r = await api('GET', `/v1/machines/${MACHINE}`)
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.data?.error?.message || 'gagal'}`)
      machine = r.data
    } catch (e) {
      return replyalya(`⚠️ Gagal hubungi panel VPS: \`${e.message}\`\n\nCek file kunci /data/home/.instabox_key di mesin bot.`)
    }

    const state = readJson(STATE_FILE, { events: [] })
    return replyalya(buildPanel(machine, state))
  }
}
