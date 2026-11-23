/*
 * vanXone — ALQANIME AUTO NOTIF
 * Source: https://alqanime.net/
 * Check: 15 minutes
 */

import { getLatest } from '../../lib/scrape/animenotif.js'

const INTERVAL = 15 * 60 * 1000
const MAX_NOTIF = 5

let lastCheck = 0
let checking = false

// ============================================================
// DATABASE
// ============================================================

function getDB() {
  if (!global.db)
    global.db = {}

  if (!global.db.data)
    global.db.data = {}

  if (!global.db.data.animeNotif)
    global.db.data.animeNotif = {}

  const db = global.db.data.animeNotif

  if (!Array.isArray(db.known))
    db.known = []

  if (typeof db.initialized !== 'boolean')
    db.initialized = false

  return db
}

function getChat(chat) {
  if (!global.db.data.chats)
    global.db.data.chats = {}

  if (!global.db.data.chats[chat])
    global.db.data.chats[chat] = {}

  return global.db.data.chats[chat]
}

// ============================================================
// REQUEST
// ============================================================

async function sendNotif(conn, chat, list) {
  if (!list.length)
    return

  let text = `╭━━━〔 *ANIME UPDATE* 〕━━━╮\n`
  text += `┃ ✨ *Rilisan baru Alqanime!*\n`
  text += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

  for (let i = 0; i < list.length; i++) {
    const anime = list[i]

    text += `*${i + 1}. ${anime.title}*\n`
    text += `🔗 ${anime.url}\n`

    if (i < list.length - 1)
      text += '\n'
  }

  text += `\n> ❀ vanXone ᴍᴅ ❀`

  await conn.sendMessage(chat, {
    text
  })
}

// ============================================================
// CHECK
// ============================================================

async function checkAnime(conn) {
  if (checking)
    return

  checking = true

  try {
    const db = getDB()

    const latest = await getLatest()

    if (!latest.length) {
      console.log('[ANIME NOTIF] Tidak menemukan rilisan.')
      checking = false
      return
    }

    const urls = latest.map(v => v.url)

    /*
     * FIRST RUN
     *
     * Jangan langsung spam semua anime yang sudah ada.
     */
    if (!db.initialized) {
      db.known = urls
      db.initialized = true

      console.log(
        `[ANIME NOTIF] Initial sync: ${latest.length} anime`
      )

      checking = false
      return
    }

    const known = Array.isArray(db.known)
      ? db.known
      : []

    /*
     * Cari yang belum pernah diketahui.
     */
    const newAnime = latest.filter(item => {
      return !known.includes(item.url)
    })

    /*
     * Update database.
     */
    db.known = [
      ...urls,
      ...known
    ]

    db.known = [
      ...new Set(db.known)
    ].slice(0, 200)

    if (!newAnime.length) {
      console.log('[ANIME NOTIF] Tidak ada anime baru.')
      checking = false
      return
    }

    console.log(
      `[ANIME NOTIF] Anime baru: ${newAnime.length}`
    )

    /*
     * Ambil chat yang mengaktifkan notif.
     */
    const chats = global.db.data.chats || {}

    const targets = Object.keys(chats).filter(chat => {
      return chats[chat] &&
        chats[chat].animeNotif === true
    })

    if (!targets.length) {
      checking = false
      return
    }

    /*
     * Jangan spam.
     * Maksimal 5 rilisan dalam satu pesan.
     */
    const sendList = newAnime.slice(0, MAX_NOTIF)

    for (const chat of targets) {
      try {
        await sendNotif(
          conn,
          chat,
          sendList
        )
      } catch (e) {
        console.error(
          '[ANIME NOTIF] Send error:',
          e?.message || e
        )
      }
    }

  } catch (e) {
    console.error(
      '[ANIME NOTIF] Check error:',
      e?.message || e
    )
  }

  checking = false
}

// ============================================================
// TIMER
// ============================================================

function startWatcher(conn) {
  if (global.__anyaAnimeWatcher)
    return

  global.__anyaAnimeWatcher = true

  console.log(
    '[ANIME NOTIF] Watcher aktif — interval 15 menit.'
  )

  /*
   * Tunggu sebentar setelah bot hidup.
   */
  setTimeout(() => {
    checkAnime(conn)
  }, 15000)

  setInterval(() => {
    checkAnime(conn)
  }, INTERVAL)
}

// ============================================================
// COMMAND
// ============================================================

let handler = async (m, { conn, command, args, usedPrefix }) => {

  /*
   * Jalankan watcher ketika plugin pertama kali dipanggil.
   */
  startWatcher(conn)

  const chat = getChat(m.chat)

  const action = (
    args?.[0] ||
    'status'
  ).toLowerCase()

  // ==========================================================
  // ON
  // ==========================================================

  if (action === 'on') {

    if (chat.animeNotif === true) {
      return m.reply(
        '⚠️ Anime notif sudah aktif di chat ini.'
      )
    }

    /*
     * Pastikan database sudah sinkron
     * sebelum mengaktifkan.
     *
     * Jadi anime lama tidak dianggap baru.
     */
    try {
      const db = getDB()

      if (!db.initialized) {
        const latest = await getLatest()

        db.known = latest.map(v => v.url)
        db.initialized = true

        console.log(
          `[ANIME NOTIF] Initial sync: ${latest.length}`
        )
      }
    } catch (e) {
      console.error(
        '[ANIME NOTIF] Initial sync error:',
        e?.message || e
      )
    }

    chat.animeNotif = true

    return m.reply(
      `╭━━━〔 *ANIME NOTIF* 〕━━━╮\n` +
      `┃ ✅ Status : *AKTIF*\n` +
      `┃ ⏱️ Check : *15 menit*\n` +
      `┃ 📦 Max : *${MAX_NOTIF} anime/pesan*\n` +
      `┃ 🔕 Anti spam : *ON*\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // ==========================================================
  // OFF
  // ==========================================================

  if (action === 'off') {

    chat.animeNotif = false

    return m.reply(
      `╭━━━〔 *ANIME NOTIF* 〕━━━╮\n` +
      `┃ ❌ Status : *NONAKTIF*\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  if (action === 'status') {

    const db = getDB()

    const status =
      chat.animeNotif === true
        ? 'AKTIF 🟢'
        : 'NONAKTIF 🔴'

    return m.reply(
      `╭━━━〔 *ANIME NOTIF* 〕━━━╮\n` +
      `┃ Status : ${status}\n` +
      `┃ Interval : 15 menit\n` +
      `┃ Max notif : ${MAX_NOTIF}\n` +
      `┃ Known : ${db.known.length}\n` +
      `┃ Watcher : ${global.__anyaAnimeWatcher ? 'ON 🟢' : 'OFF 🔴'}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // ==========================================================
  // TEST
  // ==========================================================

  if (action === 'test') {

    try {
      const latest = await getLatest()

      if (!latest.length) {
        return m.reply(
          '❌ Alqanime tidak mengembalikan data rilisan.'
        )
      }

      const list = latest.slice(0, 3)

      await sendNotif(
        conn,
        m.chat,
        list
      )

      return
    } catch (e) {
      return m.reply(
        `❌ Test gagal:\n${e?.message || e}`
      )
    }
  }

  return m.reply(
    `*ANIME NOTIF*\n\n` +
    `${usedPrefix}animenotif on\n` +
    `${usedPrefix}animenotif off\n` +
    `${usedPrefix}animenotif status\n` +
    `${usedPrefix}animenotif test`
  )
}

handler.help = [
  'animenotif on',
  'animenotif off',
  'animenotif status',
  'animenotif test'
]

handler.tags = ['anime']

handler.command = /^animenotif$/i

export default handler
