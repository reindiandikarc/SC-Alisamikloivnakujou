/**
 * ALYA V20 — Warn Helper
 *
 * Logika pemberian warn + auto-kick yang dipakai bersama oleh:
 *  - plugins/cmd/warn.js  (.warn manual oleh admin)
 *  - alya.js (AFK-mention auto-warn)
 *
 * Disimpan di database/warn-system.json dengan struktur:
 *   { [groupJid]: { [userJid]: jumlahWarn } }
 */
'use strict'

const fs = require('fs')
const path = require('path')

const DB_WARN = path.join(__dirname, '..', 'database', 'warn-system.json')
const MAX_WARN = 5

function readWarnDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_WARN, 'utf8'))
  } catch {
    return {}
  }
}

function writeWarnDb(data) {
  fs.writeFileSync(DB_WARN, JSON.stringify(data, null, 2))
}

/**
 * Tambah 1 warn untuk targetUser di groupJid.
 * Mengembalikan info hasil agar caller bisa kirim pesan & eksekusi kick.
 *
 * @param {string} groupJid
 * @param {string} targetUser
 * @param {number} [maxWarn]
 * @returns {{ warnCount: number, maxWarn: number, kicked: boolean }}
 */
function addWarn(groupJid, targetUser, maxWarn = MAX_WARN) {
  const warnSystem = readWarnDb()

  if (!warnSystem[groupJid]) warnSystem[groupJid] = {}
  if (!warnSystem[groupJid][targetUser]) warnSystem[groupJid][targetUser] = 0

  warnSystem[groupJid][targetUser] += 1
  const warnCount = warnSystem[groupJid][targetUser]

  let kicked = false
  if (warnCount >= maxWarn) {
    delete warnSystem[groupJid][targetUser]
    kicked = true
  }

  writeWarnDb(warnSystem)
  return { warnCount, maxWarn, kicked }
}

/**
 * Ambil jumlah warn saat ini tanpa menambah.
 */
function getWarn(groupJid, targetUser) {
  const warnSystem = readWarnDb()
  return (warnSystem[groupJid] && warnSystem[groupJid][targetUser]) || 0
}

module.exports = {
  addWarn,
  getWarn,
  readWarnDb,
  writeWarnDb,
  MAX_WARN,
}
