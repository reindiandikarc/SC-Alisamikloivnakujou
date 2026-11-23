import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchShowroomLives, formatDuration } from '../../lib/scrape/jkt48.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/*
 * ╔══════════════════════════════════════════╗
 * ║        vanXone — JKT48 NOTIFIER         ║
 * ║     SHOWROOM AUTO LIVE NOTIFICATION     ║
 * ╚══════════════════════════════════════════╝
 *
 * Commands:
 * .jkt48 on
 * .jkt48 off
 * .jkt48 status
 * .jkt48 cek
 *
 * Auto polling:
 * - Default 60 detik
 * - Anti duplicate
 * - JSON storage
 * - Tidak membutuhkan AWS WAF token
 */

const DATA_DIR = path.join(__dirname, '../data')
const DB_FILE = path.join(DATA_DIR, 'jkt48.json')

const POLL_INTERVAL = 60 * 1000

const SHOWROOM_API = 'https://www.showroom-live.com/api/live/onlives'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36',
  'Accept': 'application/json,text/plain,*/*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.showroom-live.com/'
}

let polling = false
let pollTimer = null

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({
        groups: {},
        notified: {}
      }, null, 2)
    )
  }
}

function readDatabase() {
  ensureDatabase()

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    const data = JSON.parse(raw)

    if (!data.groups || typeof data.groups !== 'object') {
      data.groups = {}
    }

    if (!data.notified || typeof data.notified !== 'object') {
      data.notified = {}
    }

    return data
  } catch {
    return {
      groups: {},
      notified: {}
    }
  }
}

function writeDatabase(data) {
  ensureDatabase()

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2)
  )
}

function createNotification(live) {
  const title = live.title
    ? live.title
    : 'SHOWROOM Live'

  const viewers = Number.isFinite(live.viewers)
    ? live.viewers.toLocaleString('id-ID')
    : '0'

  return [
    '╭━━━〔 🔴 JKT48 LIVE 〕━━━╮',
    '',
    `👤 *${live.name}*`,
    `📺 ${title}`,
    `👀 Penonton: ${viewers}`,
    `⏱️ Durasi: ${formatDuration(live.startedAt)}`,
    '',
    '🔗 *SHOWROOM*',
    live.url,
    '',
    '╰━━━━━━━━━━━━━━━━━━━━╯'
  ].join('\n')
}

function liveIdentity(live) {
  /*
   * Jika startedAt tersedia, ini lebih akurat
   * daripada hanya memakai roomKey.
   *
   * Saat member selesai live lalu live lagi,
   * notification ID berubah.
   */

  const start = live.startedAt
    ? String(live.startedAt)
    : 'unknown'

  return `${live.roomKey}:${start}`
}

function cleanupNotified(db, currentLives) {
  const currentKeys = new Set(
    currentLives.map(live => liveIdentity(live))
  )

  const entries = Object.entries(db.notified)

  /*
   * Simpan maksimal 500 entry terakhir.
   */
  const filtered = entries.filter(([key]) => {
    return currentKeys.has(key)
  })

  db.notified = Object.fromEntries(
    filtered.slice(-500)
  )
}

async function checkAndNotify(conn) {
  if (polling) return

  polling = true

  try {
    const lives = await fetchShowroomLives()

    const db = readDatabase()

    cleanupNotified(db, lives)

    const enabledGroups = Object.entries(db.groups)
      .filter(([jid, enabled]) => {
        return enabled === true && jid.endsWith('@g.us')
      })
      .map(([jid]) => jid)

    if (!enabledGroups.length) {
      writeDatabase(db)
      return
    }

    for (const live of lives) {
      const identity = liveIdentity(live)

      /*
       * Jangan kirim live yang sama berkali-kali.
       */
      if (db.notified[identity]) {
        continue
      }

      const message = createNotification(live)

      for (const jid of enabledGroups) {
        try {
          /*
           * Jika tersedia thumbnail dari SHOWROOM,
           * kirim sebagai image message.
           *
           * Jika gagal, fallback ke text.
           */
          if (live.image) {
            try {
              await conn.sendMessage(
                jid,
                {
                  image: {
                    url: live.image
                  },
                  caption: message
                }
              )
            } catch {
              await conn.sendMessage(
                jid,
                {
                  text: message
                }
              )
            }
          } else {
            await conn.sendMessage(
              jid,
              {
                text: message
              }
            )
          }
        } catch (error) {
          console.error(
            '[JKT48 NOTIFIER]',
            jid,
            error?.message || error
          )
        }
      }

      db.notified[identity] = {
        roomKey: live.roomKey,
        name: live.name,
        startedAt: live.startedAt,
        notifiedAt: Date.now()
      }
    }

    writeDatabase(db)

  } catch (error) {
    console.error(
      '[JKT48 POLLING]',
      error?.message || error
    )
  } finally {
    polling = false
  }
}

function startPolling(conn) {
  if (pollTimer) return

  /*
   * Delay sedikit setelah bot start.
   */
  setTimeout(() => {
    checkAndNotify(conn).catch(() => {})
  }, 10000)

  pollTimer = setInterval(() => {
    checkAndNotify(conn).catch(() => {})
  }, POLL_INTERVAL)

  console.log(
    '[JKT48] Auto notification aktif - polling 60 detik'
  )
}

function stopPolling() {
  if (!pollTimer) return

  clearInterval(pollTimer)
  pollTimer = null
}

function formatStatus(db) {
  const groups = Object.entries(db.groups)
    .filter(([, enabled]) => enabled === true)

  return [
    '╭━━━〔 🌸 JKT48 NOTIFIER 〕━━━╮',
    '',
    `📡 Status: *${groups.length ? 'AKTIF' : 'NONAKTIF'}*`,
    `👥 Grup aktif: *${groups.length}*`,
    `🔄 Polling: *${POLL_INTERVAL / 1000} detik*`,
    `💾 Database: *jkt48.json*`,
    '',
    '╰━━━━━━━━━━━━━━━━━━━━╯'
  ].join('\n')
}

let handler = async (
  m,
  {
    conn,
    command,
    args,
    usedPrefix,
    isAdmin,
    isBotAdmin,
    isOwner,
    isROwner
  }
) => {
  ensureDatabase()

  const action = String(
    args?.[0] || ''
  ).toLowerCase()

  const chat = m.chat

  if (!chat.endsWith('@g.us')) {
    return m.reply(
      '❌ Fitur JKT48 notifier hanya bisa digunakan di grup.'
    )
  }

  /*
   * ON / OFF membutuhkan admin.
   */
  if (
    ['on', 'off'].includes(action) &&
    !isAdmin &&
    !isOwner &&
    !isROwner
  ) {
    return m.reply(
      '❌ Fitur ini hanya bisa diubah oleh admin grup.'
    )
  }

  const db = readDatabase()

  if (action === 'on') {
    if (db.groups[chat] === true) {
      return m.reply(
        '🌸 *JKT48 Notifier* sudah aktif di grup ini.'
      )
    }

    db.groups[chat] = true

    writeDatabase(db)

    startPolling(conn)

    return m.reply(
      [
        '╭━━━〔 🌸 JKT48 NOTIFIER 〕━━━╮',
        '',
        '✅ *Berhasil diaktifkan!*',
        '',
        'Bot akan memantau SHOWROOM JKT48',
        'secara otomatis setiap 60 detik.',
        '',
        '🔴 Jika member mulai live,',
        'notifikasi akan dikirim otomatis.',
        '',
        '╰━━━━━━━━━━━━━━━━━━━━╯'
      ].join('\n')
    )
  }

  if (action === 'off') {
    if (db.groups[chat] !== true) {
      return m.reply(
        '⚠️ JKT48 Notifier belum aktif di grup ini.'
      )
    }

    delete db.groups[chat]

    writeDatabase(db)

    return m.reply(
      [
        '╭━━━〔 🌸 JKT48 NOTIFIER 〕━━━╮',
        '',
        '❌ *Auto notification dimatikan.*',
        '',
        '╰━━━━━━━━━━━━━━━━━━━━╯'
      ].join('\n')
    )
  }

  if (action === 'status') {
    return m.reply(
      formatStatus(db)
    )
  }

  if (
    action === 'cek' ||
    action === 'check' ||
    action === 'live'
  ) {
    try {
      const lives = await fetchShowroomLives()

      if (!lives.length) {
        return m.reply(
          [
            '╭━━━〔 🔴 JKT48 LIVE 〕━━━╮',
            '',
            '😴 Saat ini tidak ditemukan',
            '*member JKT48 yang sedang live*',
            'di SHOWROOM.',
            '',
            '╰━━━━━━━━━━━━━━━━━━━━╯'
          ].join('\n')
        )
      }

      const text = [
        '╭━━━〔 🔴 JKT48 LIVE 〕━━━╮',
        ''
      ]

      for (const live of lives) {
        text.push(
          `👤 *${live.name}*`,
          `📺 ${live.title || 'SHOWROOM Live'}`,
          `👀 ${live.viewers.toLocaleString('id-ID')} penonton`,
          `⏱️ ${formatDuration(live.startedAt)}`,
          `🔗 ${live.url}`,
          ''
        )
      }

      text.push(
        `📡 Total live: *${lives.length}*`,
        '',
        '╰━━━━━━━━━━━━━━━━━━━━╯'
      )

      return m.reply(text.join('\n'))

    } catch (error) {
      return m.reply(
        `❌ Gagal mengecek SHOWROOM.\n\n${error?.message || error}`
      )
    }
  }

  return m.reply(
    [
      '╭━━━〔 🌸 JKT48 NOTIFIER 〕━━━╮',
      '',
      `• ${usedPrefix + command} on`,
      `• ${usedPrefix + command} off`,
      `• ${usedPrefix + command} status`,
      `• ${usedPrefix + command} cek`,
      '',
      '🔴 Auto notifikasi live SHOWROOM JKT48',
      '⏱️ Polling setiap 60 detik',
      '🛡️ Anti duplicate notification',
      '💾 Penyimpanan JSON',
      '',
      '╰━━━━━━━━━━━━━━━━━━━━╯'
    ].join('\n')
  )
}

handler.help = [
  'jkt48 on',
  'jkt48 off',
  'jkt48 status',
  'jkt48 cek'
]

handler.tags = [
  'info',
  'jkt48'
]

handler.command = /^jkt48$/i

handler.group = true

/*
 * Jalankan polling ketika plugin pertama
 * kali dipanggil / command digunakan.
 */
handler.before = async function (m, { conn }) {
  try {
    startPolling(conn)
  } catch {}
}

export default handler
