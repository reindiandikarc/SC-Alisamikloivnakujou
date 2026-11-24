'use strict'
// Status VPS/server bot — dipakai oleh .ai, .alisa, dan auto-AI case.
//
// PRINSIP: hanya membaca informasi lokal yang tidak sensitif. Tidak ada
// API key, token, secret, env, atau isi credentials yang dibaca/dikirim.
// Semua akses sistem bisa di-inject supaya bisa diuji offline.

const os = require('os')
const fs = require('fs')
const { execFileSync } = require('child_process')

const SERVICE_NAME = 'alya-bot'
const TZ = 'Asia/Jakarta'

const mb = (n) => Number((n / 1024 / 1024).toFixed(1))
const gb = (n) => Number((n / 1024 / 1024 / 1024).toFixed(1))
const pct = (used, total) => total > 0 ? Number(((used / total) * 100).toFixed(1)) : 0

function shortUptime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (d) return `${d}h ${h}j ${m}m`
  if (h) return `${h}j ${m}m ${ss}d`
  if (m) return `${m}m ${ss}d`
  return `${ss}d`
}

function readService(exec = execFileSync) {
  try {
    const out = exec('systemctl', ['is-active', SERVICE_NAME], {
      encoding: 'utf8', timeout: 1500, stdio: ['ignore', 'pipe', 'ignore'],
    })
    return String(out || '').trim() || 'unknown'
  } catch (e) {
    const out = String(e?.stdout || '').trim()
    return out || 'unknown'
  }
}

function readDisk(statfs = fs.statfsSync) {
  try {
    if (typeof statfs !== 'function') return null
    const s = statfs('/')
    const total = Number(s.blocks) * Number(s.bsize)
    const free = Number(s.bavail) * Number(s.bsize)
    const used = total - free
    return {
      totalGB: gb(total), usedGB: gb(used), freeGB: gb(free), percent: pct(used, total),
    }
  } catch { return null }
}

function getVpsStatus({
  socket,
  now = Date.now(),
  exec = execFileSync,
  statfs = fs.statfsSync,
  platform = os.platform(),
} = {}) {
  const conn = socket !== undefined ? socket : global.alya
  const hostname = typeof os.hostname === 'function' ? os.hostname() : ''
  const uptimeSec = typeof os.uptime === 'function' ? os.uptime() : 0
  const load = typeof os.loadavg === 'function' ? os.loadavg().map(n => Number(n.toFixed(2))) : []
  const totalMem = typeof os.totalmem === 'function' ? os.totalmem() : 0
  const freeMem = typeof os.freemem === 'function' ? os.freemem() : 0
  const usedMem = Math.max(0, totalMem - freeMem)
  const ready = conn?.ws?.ready
  const connected = typeof ready === 'boolean'
    ? ready
    : (conn?.user?.id ? true : null)

  return {
    ok: true,
    at: new Date(now).toLocaleString('id-ID', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' }),
    hostname,
    platform,
    cpuCount: typeof os.cpus === 'function' ? os.cpus().length : 0,
    service: readService(exec),
    connected,
    jid: conn?.user?.id || '',
    botUptimeSec: Number(process.uptime().toFixed(1)),
    systemUptimeSec: Math.floor(uptimeSec),
    load,
    memory: {
      totalMB: mb(totalMem), usedMB: mb(usedMem), freeMB: mb(freeMem), percent: pct(usedMem, totalMem),
    },
    disk: readDisk(statfs),
  }
}

function formatVpsStatus(s, { prefix = '.' } = {}) {
  if (!s?.ok) return '❌ Status VPS belum tersedia.'
  const serviceIcon = s.service === 'active' ? '🟢' : (s.service === 'inactive' ? '🔴' : '⚠️')
  const connText = s.connected === true ? '🟢 Terhubung' : s.connected === false ? '🔴 Putus' : '⚠️ Tidak diketahui'
  const disk = s.disk
    ? `💾 Disk       : ${s.disk.percent}% (${s.disk.usedGB}/${s.disk.totalGB} GB)`
    : '💾 Disk       : ⚠️ tidak terbaca'
  const load = Array.isArray(s.load) && s.load.length
    ? s.load.join(' / ')
    : '-'

  return (
    `╭─「 🖥️ *STATUS VPS BOT* 」\n` +
    `│\n` +
    `│ ${serviceIcon} Service    : ${s.service}\n` +
    `│ 🔗 WhatsApp  : ${connText}\n` +
    `│ ⏱️ Uptime bot: ${shortUptime(s.botUptimeSec)}\n` +
    `│ ⏳ Uptime VPS: ${shortUptime(s.systemUptimeSec)}\n` +
    `│ 🧠 RAM       : ${s.memory.percent}% (${s.memory.usedMB}/${s.memory.totalMB} MB)\n` +
    `│ ${disk}\n` +
    `│ ⚙️ Load avg  : ${load} (${s.cpuCount} CPU)\n` +
    `│ 🕒 Update    : ${s.at} WIB\n` +
    `│\n` +
    `│ _Semua angka dibaca langsung dari VPS bot._\n` +
    `╰──────────────────────────\n\n` +
    `💡 Coba juga: *${prefix}ai status vps* atau *${prefix}alisa vps*`
  )
}

// Dipakai tiga jalur: .ai, .alisa, dan auto-case AI. Sengaja ketat supaya
// obrolan biasa ("status ai", "kamu online?") tidak salah terdeteksi.
function isVpsStatusQuery(text) {
  const t = String(text || '').toLowerCase().trim()
  if (!t) return false
  if (/\b(vps|server|hosting|uptimes?)\b/.test(t)) return true
  const mentionsBot = /\b(bot|alya|alisa|kamu)\b/.test(t)
  const asksState = /\b(status|kondisi|cek|gimana|how|gak|ga|nggak|apa|lagi)\b/.test(t)
  const stateWord = /\b(online|offline|hidup|mati|nyala|sehat|aktif|ready|sibuk|resource|ram|memory|disk)\b/.test(t)
  const directAsk = /^(status|kondisi|cek)\b/.test(t)
  return mentionsBot && asksState && (stateWord || directAsk)
}

module.exports = {
  SERVICE_NAME,
  shortUptime,
  getVpsStatus,

  formatVpsStatus,
  isVpsStatusQuery,
}
