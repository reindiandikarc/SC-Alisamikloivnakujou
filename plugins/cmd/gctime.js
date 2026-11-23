// ═══════════════════════════════════════════════════════════════
//  gctime.js — Auto Open/Close Group berdasarkan jadwal waktu WIB
//  Alya V13 Plugin System
//  Commands: setopengctime, setclosegctime, gctimenow, gctimereset
//  Timezone: WIB (Asia/Jakarta) — UTC+7
//  Storage: database/gctime.json
//  Schema: {
//    "groupJid@g.us": {
//      openTime : "06:00",   // HH:MM WIB
//      closeTime: "22:00",   // HH:MM WIB
//      active   : true       // scheduler berjalan
//    }
//  }
// ═══════════════════════════════════════════════════════════════

'use strict'

const fs   = require('fs')
const path = require('path')

// ✅ FIX: Bungkus require node-cron dengan try-catch.
// Jika 'node-cron' gagal load karena alasan apapun (belum terinstall,
// versi tidak cocok, dll), seluruh file gctime.js akan throw saat
// di-require oleh plugin loader (alya.js) → command setopengctime,
// setclosegctime, gctimenow, gctimereset jadi TIDAK MERESPON SAMA SEKALI
// (silent fail, hanya tercatat di console sebagai [Plugin Load Error]).
// Dengan try-catch ini, file TETAP bisa di-load, dan command tetap
// merespon (walau scheduler otomatis tidak aktif jika node-cron hilang).
let cron = null
try {
  cron = require('node-cron')
} catch (e) {
  console.error('[gctime] ⚠️ Modul "node-cron" tidak ditemukan/gagal load:', e.message)
  console.error('[gctime] ⚠️ Jalankan: npm install node-cron --legacy-peer-deps')
  console.error('[gctime] ⚠️ Command setopengctime/setclosegctime tetap merespon, tapi scheduler otomatis TIDAK AKTIF.')
}

const DB_PATH = path.join(__dirname, '../../database/gctime.json')
const TZ      = 'Asia/Jakarta'

// ── DB helpers ────────────────────────────────────────────────
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {}
  return {}
}

function saveDB(data) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) } catch (e) {
    console.error('[gctime] ❌ Gagal simpan DB:', e.message)
  }
}

// ── Parse "HH:MM" / "HH" / "HHMM" / "HH.MM" ─────────────────
function parseTime(str) {
  str = String(str).trim().replace('.', ':')
  if (/^\d{3,4}$/.test(str)) {
    str = str.padStart(4, '0')
    str = str.slice(0, 2) + ':' + str.slice(2)
  }
  const m = str.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = parseInt(m[1]), mm = parseInt(m[2])
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null
  return {
    h, m: mm,
    str: `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }
}

// ── Buka / tutup grup via Baileys ─────────────────────────────
async function executeGroupStatus(alya, groupJid, action) {
  try {
    await alya.groupSettingUpdate(
      groupJid,
      action === 'close' ? 'announcement' : 'not_announcement'
    )
    console.log(`[gctime] ✅ ${groupJid} di-${action === 'close' ? 'TUTUP' : 'BUKA'}`)
    return true
  } catch (e) {
    console.error(`[gctime] ❌ Gagal ${action} ${groupJid}:`, e.message)
    return false
  }
}

// ── Global scheduler store ────────────────────────────────────
if (!global._gctimeSchedulers) global._gctimeSchedulers = {}

// ── Setup cron scheduler untuk satu grup ─────────────────────
function setupScheduler(alya, groupJid, entry) {
  // Stop scheduler lama
  if (global._gctimeSchedulers[groupJid]) {
    try {
      global._gctimeSchedulers[groupJid].open?.stop()
      global._gctimeSchedulers[groupJid].close?.stop()
    } catch {}
    delete global._gctimeSchedulers[groupJid]
  }

  if (!entry.active) return false

  // ✅ FIX: jika node-cron gagal load, jangan crash — skip scheduling
  // Return false supaya caller tahu scheduler TIDAK berhasil terdaftar
  if (!cron) {
    console.warn(`[gctime] ⚠️ Scheduler untuk ${groupJid} tidak diaktifkan (node-cron tidak tersedia)`)
    return false
  }

  const openT  = parseTime(entry.openTime)
  const closeT = parseTime(entry.closeTime)
  if (!openT || !closeT) return

  // Cron: "MM HH * * *"  —  jalankan setiap hari di WIB
  const openJob = cron.schedule(
    `${openT.m} ${openT.h} * * *`,
    async () => {
      console.log(`[gctime] ⏰ Buka grup ${groupJid} (${openT.str} WIB)`)
      const ok = await executeGroupStatus(alya, groupJid, 'open')
      if (ok) {
        try {
          await alya.sendMessage(groupJid, {
            text:
              `🌅 *Selamat pagi!*\n\n` +
              `Grup ini sekarang *dibuka* 🔓\n` +
              `Silakan kirim pesan seperti biasa.\n\n` +
              `_Waktu buka  : ${openT.str} WIB_\n` +
              `_Waktu tutup : ${entry.closeTime} WIB_`
          })
        } catch {}
      }
    },
    { timezone: TZ }
  )

  const closeJob = cron.schedule(
    `${closeT.m} ${closeT.h} * * *`,
    async () => {
      console.log(`[gctime] ⏰ Tutup grup ${groupJid} (${closeT.str} WIB)`)
      const ok = await executeGroupStatus(alya, groupJid, 'close')
      if (ok) {
        try {
          await alya.sendMessage(groupJid, {
            text:
              `🌙 *Selamat malam!*\n\n` +
              `Grup ini sekarang *ditutup* 🔒\n` +
              `Hanya admin yang bisa kirim pesan.\n\n` +
              `_Waktu tutup : ${closeT.str} WIB_\n` +
              `_Akan dibuka kembali pukul ${entry.openTime} WIB_`
          })
        } catch {}
      }
    },
    { timezone: TZ }
  )

  global._gctimeSchedulers[groupJid] = { open: openJob, close: closeJob }
  console.log(
    `[gctime] 📅 Scheduler aktif → ${groupJid} | Buka: ${openT.str} | Tutup: ${closeT.str} WIB`
  )
  return true
}

// ── Init semua scheduler saat bot boot ───────────────────────
function initAllSchedulers(alya) {
  const db    = loadDB()
  let   count = 0
  for (const [jid, entry] of Object.entries(db)) {
    if (entry.active) {
      setupScheduler(alya, jid, entry)
      count++
    }
  }
  if (count > 0) {
    console.log(`[gctime] ✅ ${count} jadwal grup dimuat ulang saat boot`)
  }
}

// ── Expose ke global agar index.js bisa panggil saat boot ────
global._gctimeInit = initAllSchedulers

// ── Helper: waktu WIB saat ini ───────────────────────────────
function nowWIB() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
  return { h: now.getHours(), m: now.getMinutes() }
}

function nowStr() {
  const t = nowWIB()
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`
}

// Helper: apakah sekarang dalam window buka?
function isCurrentlyOpen(openTime, closeTime) {
  const openT  = parseTime(openTime)
  const closeT = parseTime(closeTime)
  if (!openT || !closeT) return null
  const { h, m } = nowWIB()
  const curMin   = h * 60 + m
  const openMin  = openT.h * 60 + openT.m
  const closeMin = closeT.h * 60 + closeT.m
  if (openMin < closeMin) return curMin >= openMin && curMin < closeMin
  return curMin >= openMin || curMin < closeMin
}

// ══════════════════════════════════════════════════════════════
//  PLUGIN EXPORT
// ══════════════════════════════════════════════════════════════
module.exports = {
  command: ['setopengctime', 'setclosegctime', 'gctimenow', 'gctimereset'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      isGroup, isAdmins, isGroupAdmins, isBotAdmins, Ryuu,
      reply, replyalya, replytolak
    } = ctx

    if (!m.isGroup)  return replytolak('Perintah ini hanya bisa dipakai di dalam grup! 😤')

    const isAdmin = isAdmins || isGroupAdmins || false
    if (!isAdmin && !Ryuu) {
      return reply('Hah? Hanya admin grup atau owner yang boleh atur jadwal buka/tutup grup. 😒')
    }
    if (!isBotAdmins) {
      return reply(
        '❌ Bot harus jadi *admin grup* dulu buat bisa buka/tutup grup!\n' +
        'Jadikan bot admin terlebih dahulu.'
      )
    }

    const groupJid = m.chat
    const db       = loadDB()
    if (!db[groupJid]) db[groupJid] = { openTime: '06:00', closeTime: '22:00', active: false }

    // ─────────────────────────────────────────────────────────
    // .setopengctime [jam] — Set waktu BUKA grup
    // ─────────────────────────────────────────────────────────
    if (command === 'setopengctime') {
      if (!args[0]) {
        const cur = db[groupJid].openTime || 'belum diset'
        return replyalya(
          `🌅 *Set Waktu Buka Grup*\n\n` +
          `Waktu buka saat ini : *${cur} WIB*\n` +
          `Waktu tutup saat ini: *${db[groupJid].closeTime || 'belum diset'} WIB*\n\n` +
          `Format: \`${prefix}setopengctime HH:MM\`\n` +
          `Contoh: \`${prefix}setopengctime 06:00\`\n\n` +
          `_Timezone otomatis WIB (UTC+7)_`
        )
      }

      const t = parseTime(args[0])
      if (!t) return replyalya('❌ Format waktu salah! Gunakan HH:MM\nContoh: `06:00` atau `06:30`')

      db[groupJid].openTime = t.str
      db[groupJid].active   = true
      saveDB(db)
      const openScheduled = setupScheduler(alya, groupJid, db[groupJid])
      const openStatus = openScheduled
        ? '⏰ Scheduler terdaftar ✅'
        : (cron ? '⚠️ Gagal parse waktu' : '⚠️ node-cron tidak terinstall!')

      return replyalya(
        `✅ *Waktu Buka Grup Berhasil Diset!*\n\n` +
        `🌅 Buka  : *${t.str} WIB*\n` +
        `🌙 Tutup : *${db[groupJid].closeTime} WIB*\n` +
        `📅 Jadwal: *${openScheduled ? 'AKTIF ✅' : 'DISIMPAN ⚠️ (Scheduler gagal!)'}*\n` +
        `🔄 Status: *${openStatus}*\n\n` +
        (openScheduled
          ? `Setiap pukul *${t.str} WIB*, grup akan otomatis dibuka.\n`
          : `⚠️ Data tersimpan tapi *scheduler tidak berjalan!*\n` +
            `Pastikan \`node-cron\` terinstall: \`npm install node-cron\`\n`) +
        `\n_Nonaktifkan: \`${prefix}gctimereset\`_`
      )
    }

    // ─────────────────────────────────────────────────────────
    // .setclosegctime [jam] — Set waktu TUTUP grup
    // ─────────────────────────────────────────────────────────
    if (command === 'setclosegctime') {
      if (!args[0]) {
        const cur = db[groupJid].closeTime || 'belum diset'
        return replyalya(
          `🌙 *Set Waktu Tutup Grup*\n\n` +
          `Waktu tutup saat ini: *${cur} WIB*\n` +
          `Waktu buka saat ini : *${db[groupJid].openTime || 'belum diset'} WIB*\n\n` +
          `Format: \`${prefix}setclosegctime HH:MM\`\n` +
          `Contoh: \`${prefix}setclosegctime 22:00\`\n\n` +
          `_Saat ditutup, hanya admin yang bisa kirim pesan._`
        )
      }

      const t = parseTime(args[0])
      if (!t) return replyalya('❌ Format waktu salah! Gunakan HH:MM\nContoh: `22:00` atau `23:30`')

      db[groupJid].closeTime = t.str
      db[groupJid].active    = true
      saveDB(db)
      const closeScheduled = setupScheduler(alya, groupJid, db[groupJid])
      const closeStatus = closeScheduled
        ? '⏰ Scheduler terdaftar ✅'
        : (cron ? '⚠️ Gagal parse waktu' : '⚠️ node-cron tidak terinstall!')

      return replyalya(
        `✅ *Waktu Tutup Grup Berhasil Diset!*\n\n` +
        `🌅 Buka  : *${db[groupJid].openTime} WIB*\n` +
        `🌙 Tutup : *${t.str} WIB*\n` +
        `📅 Jadwal: *${closeScheduled ? 'AKTIF ✅' : 'DISIMPAN ⚠️ (Scheduler gagal!)'}*\n` +
        `🔄 Status: *${closeStatus}*\n\n` +
        (closeScheduled
          ? `Setiap pukul *${t.str} WIB*, grup akan otomatis ditutup.\n`
          : `⚠️ Data tersimpan tapi *scheduler tidak berjalan!*\n` +
            `Pastikan \`node-cron\` terinstall: \`npm install node-cron\`\n`) +
        `\n_Nonaktifkan: \`${prefix}gctimereset\`_`
      )
    }

    // ─────────────────────────────────────────────────────────
    // .gctimenow — Cek status jadwal grup ini
    // ─────────────────────────────────────────────────────────
    if (command === 'gctimenow') {
      const entry       = db[groupJid]
      const active      = entry?.active === true
      const hasScheduler = !!global._gctimeSchedulers[groupJid]

      let statusNow = '—'
      if (active && entry.openTime && entry.closeTime) {
        const open = isCurrentlyOpen(entry.openTime, entry.closeTime)
        if (open !== null) statusNow = open ? '🟢 Seharusnya BUKA' : '🔴 Seharusnya TUTUP'
      }

      return replyalya(
        `📅 *Status Jadwal Grup*\n\n` +
        `🌅 Waktu Buka   : *${entry?.openTime  || 'belum diset'} WIB*\n` +
        `🌙 Waktu Tutup  : *${entry?.closeTime || 'belum diset'} WIB*\n` +
        `⚙️ Jadwal        : *${active ? 'AKTIF ✅' : 'NONAKTIF ❌'}*\n` +
        `🔄 Scheduler     : *${hasScheduler ? 'BERJALAN ✅' : 'Tidak berjalan'}*\n` +
        `🕐 Waktu WIB kini: *${nowStr()}*\n` +
        `📊 Status kini   : *${statusNow}*\n\n` +
        `_Jadwal berjalan setiap hari secara otomatis._\n\n` +
        `Commands:\n` +
        `• \`${prefix}setopengctime HH:MM\` — atur waktu buka\n` +
        `• \`${prefix}setclosegctime HH:MM\` — atur waktu tutup\n` +
        `• \`${prefix}gctimereset\` — reset / nonaktifkan jadwal`
      )
    }

    // ─────────────────────────────────────────────────────────
    // .gctimereset — Nonaktifkan jadwal grup ini
    // ─────────────────────────────────────────────────────────
    if (command === 'gctimereset') {
      if (!db[groupJid] || !db[groupJid].active) {
        return replyalya('❌ Jadwal buka/tutup grup ini belum aktif.')
      }

      if (global._gctimeSchedulers[groupJid]) {
        try {
          global._gctimeSchedulers[groupJid].open?.stop()
          global._gctimeSchedulers[groupJid].close?.stop()
        } catch {}
        delete global._gctimeSchedulers[groupJid]
      }

      const savedOpen  = db[groupJid].openTime
      const savedClose = db[groupJid].closeTime
      db[groupJid].active = false
      saveDB(db)

      return replyalya(
        `✅ *Jadwal Buka/Tutup Grup Dinonaktifkan*\n\n` +
        `Grup tidak akan lagi otomatis dibuka/ditutup.\n\n` +
        `_Data waktu (${savedOpen} / ${savedClose}) masih tersimpan._\n` +
        `_Aktifkan lagi dengan \`${prefix}setopengctime\` atau \`${prefix}setclosegctime\`._`
      )
    }
  }
}
