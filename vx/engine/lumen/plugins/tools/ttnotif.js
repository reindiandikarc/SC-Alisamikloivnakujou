/*
 * ╔══════════════════════════════════════════════╗
 * ║        AKAISHI KUROE — TTNOTIF               ║
 * ║  TikTok Auto Notification + Bintang API      ║
 * ║  Per-Group Edition                           ║
 * ╚══════════════════════════════════════════════╝
 *
 * Commands:
 * .ttnotif add @username
 * .ttnotif del @username
 * .ttnotif list (Admin Only)
 * .ttnotif on   (Admin Only)
 * .ttnotif off  (Admin Only)
 * .ttnotif status
 * .ttnotif test @username
 */

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'

// ======================================================
// CONFIG
// ======================================================

const BINTANG_API = 'https://bintangapi.my.id/api/downloader/tiktok'

const RSSHUB_LIST = [
  'https://rsshub.cmyr.dev',
  'https://rsshub.rssforever.com',
  'https://rsshub.liumingye.cn'
]

const DATA_DIR = path.join(process.cwd(), 'database')
const DATA_FILE = path.join(DATA_DIR, 'ttnotif.json')

const CHECK_INTERVAL = 5 * 60 * 1000
const MAX_UPDATE = 5
const REQUEST_TIMEOUT = 30000
const RETRY_COUNT = 3
const SEND_DELAY = 1500

// ======================================================
// GLOBAL STATE
// ======================================================

const GLOBAL_KEY = '__AKAISHI_KUROE_TTNOTIF_STATE'

if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = {
    conn: null,
    watcherStarted: false,
    checking: false,
    inFlight: new Set(),
    timer: null,
    initialTimer: null
  }
}

const state = globalThis[GLOBAL_KEY]

// ======================================================
// DATABASE
// ======================================================

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ chats: {}, seen: {} }, null, 2)
    )
  }
}

function loadData() {
  ensureDatabase()

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(raw)

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Database tidak valid')
    }

    if (!data.chats || typeof data.chats !== 'object') {
      data.chats = {}
    }

    if (!data.seen || typeof data.seen !== 'object') {
      data.seen = {}
    }

    for (const chat of Object.values(data.chats)) {
      if (!chat || typeof chat !== 'object') continue

      if (typeof chat.enabled !== 'boolean') {
        chat.enabled = false
      }

      if (!chat.users || typeof chat.users !== 'object') {
        chat.users = {}
      }
    }

    return data
  } catch (error) {
    console.error('[TTNOTIF] Database error:', error.message)
    return { chats: {}, seen: {} }
  }
}

function saveData(data) {
  ensureDatabase()

  const tempFile = `${DATA_FILE}.tmp`

  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2))
    fs.renameSync(tempFile, DATA_FILE)
  } catch (error) {
    console.error('[TTNOTIF] Save database error:', error.message)

    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
    } catch {}

    throw error
  }
}

function ensureChat(data, jid) {
  if (!data.chats[jid]) {
    data.chats[jid] = {
      enabled: false,
      users: {}
    }
  }

  const chat = data.chats[jid]

  if (typeof chat.enabled !== 'boolean') {
    chat.enabled = false
  }

  if (!chat.users || typeof chat.users !== 'object') {
    chat.users = {}
  }

  return chat
}

// ======================================================
// HELPERS
// ======================================================

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function normalizeUsername(username = '') {
  return String(username)
    .trim()
    .replace(/^@+/, '')
    .replace(/\s+/g, '')
    .toLowerCase()
}

function normalizeURL(url = '') {
  return String(url).trim().replace(/[)>.,]+$/g, '')
}

function extractVideoID(value = '') {
  const text = String(value || '')

  let match = text.match(/\/video\/(\d{15,25})/i)
  if (match) return match[1]

  match = text.match(/\b(\d{15,25})\b/)
  return match ? match[1] : ''
}

function extractTikTokURL(value = '') {
  const text = String(value || '')

  const match = text.match(
    /https?:\/\/(?:(?:www|m|vt|vm)\.)?tiktok\.com\/[^\s<>"']+/i
  )

  return match ? normalizeURL(match[0]) : ''
}

function createSeenKey(jid, username, videoID) {
  return `${jid}|${normalizeUsername(username)}|${videoID}`
}

function hasSeen(data, jid, username, videoID) {
  if (!videoID) return false

  return Boolean(
    data.seen[createSeenKey(jid, username, videoID)]
  )
}

function markSeen(data, jid, username, videoID) {
  if (!videoID) return

  data.seen[createSeenKey(jid, username, videoID)] = Date.now()
}

// ======================================================
// REQUEST RETRY
// ======================================================

async function requestWithRetry(config, label = 'Request') {
  let lastError

  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    try {
      return await axios({
        timeout: REQUEST_TIMEOUT,
        maxContentLength: 30 * 1024 * 1024,
        maxBodyLength: 30 * 1024 * 1024,
        validateStatus: status => status >= 200 && status < 300,
        ...config
      })
    } catch (error) {
      lastError = error

      const status = error?.response?.status

      console.error(
        `[TTNOTIF] ${label} gagal (${attempt}/${RETRY_COUNT})` +
        `${status ? ` HTTP ${status}` : ''}: ${error.message}`
      )

      if (attempt < RETRY_COUNT) {
        await sleep(1000 * attempt)
      }
    }
  }

  throw lastError
}

// ======================================================
// RSSHUB
// ======================================================

async function getRSS(username) {
  const user = normalizeUsername(username)

  if (!user) throw new Error('Username TikTok kosong')

  let lastError

  for (const baseURL of RSSHUB_LIST) {
    const url = `${baseURL}/tiktok/user/${encodeURIComponent(user)}`

    try {
      console.log(`[TTNOTIF] RSS: ${baseURL}`)

      const response = await requestWithRetry({
        method: 'GET',
        url,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        responseType: 'text'
      }, `RSSHub ${baseURL}`)

      if (!response.data) throw new Error('RSS kosong')

      return {
        xml: response.data,
        source: baseURL
      }
    } catch (error) {
      lastError = error

      console.error(
        `[TTNOTIF] RSS gagal ${baseURL}:`,
        error.message
      )
    }
  }

  throw new Error(
    `Semua RSSHub gagal: ${lastError?.message || 'unknown error'}`
  )
}

// ======================================================
// XML PARSER
// ======================================================

function decodeXML(text = '') {
  return String(text)
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function getTag(block, tag) {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    'i'
  )

  const match = String(block).match(regex)

  return match ? decodeXML(match[1]) : ''
}

function parseRSS(xml = '') {
  const items = []

  const matches =
    String(xml).match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) || []

  for (const block of matches) {
    const title = getTag(block, 'title')
    const link = getTag(block, 'link')
    const guid = getTag(block, 'guid')
    const description = getTag(block, 'description')
    const pubDate = getTag(block, 'pubDate')

    const url =
      extractTikTokURL(link) ||
      extractTikTokURL(guid) ||
      extractTikTokURL(description) ||
      ''

    const videoID =
      extractVideoID(url) ||
      extractVideoID(guid) ||
      extractVideoID(link)

    items.push({
      title,
      link,
      guid,
      description,
      pubDate,
      url,
      videoID
    })
  }

  return items
}

// ======================================================
// BINTANG API
// ======================================================

async function getBintang(tiktokURL) {
  if (!tiktokURL) {
    throw new Error('URL TikTok tidak ditemukan')
  }

  console.log(`[TTNOTIF] Bintang request: ${tiktokURL}`)

  const response = await requestWithRetry({
    method: 'GET',
    url: BINTANG_API,
    params: { url: tiktokURL },
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json'
    },
    responseType: 'json'
  }, 'Bintang API')

  const body = response.data

  if (!body || body.success !== true) {
    throw new Error(
      body?.message || body?.msg || 'Bintang API gagal'
    )
  }

  if (!body.data) {
    throw new Error('Data Bintang kosong')
  }

  return body.data
}

// ======================================================
// RESOLVE POST
// ======================================================

async function resolvePost(item, username) {
  let tiktokURL =
    item.url ||
    extractTikTokURL(item.link) ||
    extractTikTokURL(item.guid)

  tiktokURL = normalizeURL(tiktokURL)

  if (!tiktokURL) {
    throw new Error('URL TikTok tidak ditemukan')
  }

  const data = await getBintang(tiktokURL)

  const videoID = String(
    data.video_id ||
    extractVideoID(tiktokURL) ||
    item.videoID ||
    ''
  )

  if (!videoID) {
    throw new Error('Video ID tidak ditemukan')
  }

  const user = data.user || {}

  const video =
    data?.video_no_watermark?.url ||
    data?.video?.url ||
    data?.play ||
    ''

  const videoHD =
    data?.video_no_watermark?.hd === true ||
    data?.video?.hd === true

  let images = []

  if (Array.isArray(data.images)) {
    images = data.images.filter(Boolean)
  }

  if (Array.isArray(data.image_urls)) {
    images = data.image_urls.filter(Boolean)
  }

  images = [...new Set(images)]

  const rawCaption =
    data.title ||
    data.description ||
    data.desc ||
    data.caption ||
    item.title ||
    item.description ||
    ''

  const caption = String(rawCaption)
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const author =
    user.username ||
    data.username ||
    username

  const authorName =
    user.name ||
    data.nickname ||
    data.author_name ||
    ''

  return {
    username: normalizeUsername(username),
    author,
    authorName,
    caption,
    video,
    videoHD,
    images,
    videoID,
    tiktokURL,
    thumbnail: data.thumbnail || data.cover || '',
    duration: data.duration || 0
  }
}

// ======================================================
// NATIVE FLOW HELPERS
// ======================================================

function createNativeMessage(jid, username, nickname, caption, mediaContent, mediaType, videoUrl) {
  const profileUrl = username
    ? `https://www.tiktok.com/@${username}`
    : 'https://www.tiktok.com'

  const header = {
    title: '🎵 TIKTOK NOTIFICATION',
    subtitle: `@${username}`,
    hasMediaAttachment: true
  }

  if (mediaType === 'video') {
    header.videoMessage = mediaContent
  } else {
    header.imageMessage = mediaContent
  }

  return generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header,
          body: {
            text:
              `👤 *${nickname}*\n` +
              `🔗 @${username}\n\n${caption}`
          },
          footer: {
            text: '❀ vanXone • TikTok Notification'
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Kunjungi TikTok',
                  url: videoUrl || 'https://www.tiktok.com'
                })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Lihat Profil',
                  url: profileUrl
                })
              }
            ]
          }
        }
      }
    }
  }, { quoted: null })
}

async function sendVideoNativeFlow(conn, jid, post) {
  const username = post.author || post.username || ''
  const nickname = post.authorName || username || 'TikTok'

  const caption =
    post.caption?.trim() ||
    `TikTok baru dari @${username}`

  const media = await prepareWAMessageMedia(
    { video: { url: post.video } },
    { upload: conn.waUploadToServer }
  )

  const message = createNativeMessage(
    jid,
    username,
    nickname,
    caption,
    media.videoMessage,
    'video',
    post.tiktokURL
  )

  return conn.relayMessage(
    jid,
    message.message,
    { messageId: message.key.id }
  )
}

async function sendImageNativeFlow(conn, jid, post, imageURL) {
  const username = post.author || post.username || ''
  const nickname = post.authorName || username || 'TikTok'

  const caption =
    post.caption?.trim() ||
    `TikTok baru dari @${username}`

  const media = await prepareWAMessageMedia(
    { image: { url: imageURL } },
    { upload: conn.waUploadToServer }
  )

  const message = createNativeMessage(
    jid,
    username,
    nickname,
    caption,
    media.imageMessage,
    'image',
    post.tiktokURL
  )

  return conn.relayMessage(
    jid,
    message.message,
    { messageId: message.key.id }
  )
}

// ======================================================
// SEND POST
// ======================================================

async function sendPost(conn, jid, post) {
  if (!conn) {
    throw new Error('Connection WhatsApp tidak tersedia')
  }

  // VIDEO
  if (post.video) {
    try {
      await sendVideoNativeFlow(conn, jid, post)
      return true
    } catch (error) {
      console.error(
        '[TTNOTIF] NativeFlow video gagal:',
        error.message
      )

      await conn.sendMessage(jid, {
        video: { url: post.video },
        caption:
          `🎵 *TikTok Baru*\n\n` +
          `👤 @${post.author || post.username}\n\n` +
          `${post.caption || ''}\n\n` +
          `🔗 ${post.tiktokURL}`
      })

      return true
    }
  }

  // PHOTO / SLIDESHOW
  if (post.images?.length) {
    let first = true

    for (const imageURL of post.images) {
      try {
        await sendImageNativeFlow(
          conn,
          jid,
          post,
          imageURL
        )
      } catch (error) {
        console.error(
          '[TTNOTIF] NativeFlow image gagal:',
          error.message
        )

        await conn.sendMessage(jid, {
          image: { url: imageURL },
          caption: first
            ? `🎵 *TikTok Baru*\n\n` +
              `👤 @${post.author || post.username}\n\n` +
              `${post.caption || ''}\n\n` +
              `🔗 ${post.tiktokURL}`
            : ''
        })
      }

      first = false
      await sleep(SEND_DELAY)
    }

    return true
  }

  // TEXT FALLBACK
  await conn.sendMessage(jid, {
    text:
      `🎵 *TikTok Baru*\n\n` +
      `👤 @${post.author || post.username}\n\n` +
      `${post.caption || ''}\n\n` +
      `🔗 ${post.tiktokURL}`
  })

  return true
}

// ======================================================
// CHECK USER
// ======================================================

async function checkUser(conn, jid, username, options = {}) {
  const {
    maxUpdate = MAX_UPDATE,
    isTest = false
  } = options

  const data = loadData()

  console.log(`[TTNOTIF] Checking @${username} → ${jid}`)

  const rss = await getRSS(username)
  const items = parseRSS(rss.xml)

  if (!items.length) {
    throw new Error(`RSS tidak menemukan posting @${username}`)
  }

  console.log(
    `[TTNOTIF] @${username}: ${items.length} posting ditemukan`
  )

  const candidates = []

  for (const item of items) {
    if (candidates.length >= maxUpdate) break

    const videoID =
      item.videoID ||
      extractVideoID(item.url)

    if (!videoID) continue

    if (!isTest && hasSeen(data, jid, username, videoID)) {
      continue
    }

    candidates.push(item)
  }

  if (!candidates.length) {
    return {
      sent: 0,
      found: items.length,
      source: rss.source
    }
  }

  // RSS biasanya berisi posting terbaru lebih dulu.
  // Kirim dari posting terlama di antara kandidat.
  candidates.reverse()

  let sent = 0

  for (const item of candidates) {
    let post

    try {
      post = await resolvePost(item, username)
    } catch (error) {
      console.error(
        `[TTNOTIF] Gagal resolve @${username}:`,
        error.message
      )

      if (isTest) throw error
      continue
    }

    const seenKey = createSeenKey(
      jid,
      username,
      post.videoID
    )

    if (!isTest) {
      const freshData = loadData()

      if (freshData.seen[seenKey]) continue

      if (state.inFlight.has(seenKey)) {
        console.log(`[TTNOTIF] Skip in-flight: ${seenKey}`)
        continue
      }

      state.inFlight.add(seenKey)
    }

    try {
      if (!isTest) {
        const freshData = loadData()

        if (freshData.seen[seenKey]) continue
      }

      await sendPost(conn, jid, post)
      sent++

      if (!isTest) {
        const freshData = loadData()

        markSeen(
          freshData,
          jid,
          username,
          post.videoID
        )

        saveData(freshData)
      }

      await sleep(SEND_DELAY)
    } finally {
      if (!isTest) {
        state.inFlight.delete(seenKey)
      }
    }
  }

  return {
    sent,
    found: items.length,
    source: rss.source
  }
}

// ======================================================
// CHECK ALL — PER GROUP
// ======================================================

async function checkUpdates() {
  if (!state.conn || state.checking) return

  const data = loadData()

  state.checking = true

  try {
    for (const [jid, chat] of Object.entries(data.chats || {})) {
      if (chat?.enabled !== true) continue
      if (!chat?.users) continue

      for (const [username, config] of Object.entries(chat.users)) {
        if (config?.enabled === false) continue

        try {
          const result = await checkUser(
            state.conn,
            jid,
            username,
            {
              maxUpdate: MAX_UPDATE,
              isTest: false
            }
          )

          if (result.sent) {
            console.log(
              `[TTNOTIF] ${jid} @${username}: ` +
              `${result.sent} update dikirim`
            )
          }
        } catch (error) {
          console.error(
            `[TTNOTIF] Error ${jid} @${username}:`,
            error.message
          )
        }
      }
    }
  } finally {
    state.checking = false
  }
}

// ======================================================
// WATCHER
// ======================================================

function startWatcher(conn) {
  state.conn = conn

  if (state.watcherStarted) return

  state.watcherStarted = true

  console.log('[TTNOTIF] Per-group watcher aktif.')

  state.initialTimer = setTimeout(() => {
    checkUpdates().catch(error => {
      console.error(
        '[TTNOTIF] Initial check:',
        error.message
      )
    })
  }, 15000)

  state.timer = setInterval(() => {
    checkUpdates().catch(error => {
      console.error(
        '[TTNOTIF] Auto check:',
        error.message
      )
    })
  }, CHECK_INTERVAL)
}

// ======================================================
// HANDLER
// ======================================================

// Ditambahkan pengecekan `isAdmin` / `isGroupAdmins` ke parameter handler
const handler = async (m, { conn, args, usedPrefix, isAdmin, isGroupAdmins }) => {
  state.conn = conn
  startWatcher(conn)

  const subcommand = String(args?.[0] || '').toLowerCase()
  const jid = m.chat
  
  // Deteksi status admin pemanggil (mendukung variabel standar framework Baileys)
  const isUserAdmin = isAdmin || isGroupAdmins || false;

  // HELP
  if (!subcommand) {
    return m.reply(
      `╭━━━〔 🎵 TTNOTIF 〕━━━╮\n┃\n` +
      `┃ ${usedPrefix}ttnotif add @username\n` +
      `┃ ${usedPrefix}ttnotif del @username\n` +
      `┃ ${usedPrefix}ttnotif list (Admin Only)\n` +
      `┃ ${usedPrefix}ttnotif on (Admin Only)\n` +
      `┃ ${usedPrefix}ttnotif off (Admin Only)\n` +
      `┃ ${usedPrefix}ttnotif status\n` +
      `┃ ${usedPrefix}ttnotif test @username\n┃\n` +
      `╰━━━━━━━━━━━━━━━━━━╯\n\n` +
      `⚙️ Status disimpan per grup.`
    )
  }

  // ADD (Tersedia untuk Member & Admin)
  if (subcommand === 'add') {
    const username = normalizeUsername(args?.[1] || '')

    if (!username) {
      return m.reply(
        `Contoh:\n${usedPrefix}ttnotif add @update_anime`
      )
    }

    try {
      const rss = await getRSS(username)
      const items = parseRSS(rss.xml)

      if (!items.length) {
        return m.reply(
          `❌ Akun @${username} tidak ditemukan atau RSS kosong.`
        )
      }

      const data = loadData()
      const chat = ensureChat(data, jid)

      if (chat.users[username]) {
        return m.reply(
          `ℹ️ @${username} sudah terdaftar di grup ini.\n\n` +
          `Status grup: ${chat.enabled ? '🟢 ON' : '🔴 OFF'}`
        )
      }

      for (const item of items) {
        const videoID =
          item.videoID ||
          extractVideoID(item.url)

        if (videoID) {
          markSeen(data, jid, username, videoID)
        }
      }

      chat.users[username] = {
        enabled: true,
        addedAt: Date.now()
      }

      saveData(data)

      return m.reply(
        `✅ *TTNOTIF AKUN DITAMBAHKAN*\n\n` +
        `👤 Akun: @${username}\n` +
        `📍 Grup: ${jid}\n` +
        `📡 RSSHub: OK\n` +
        `📥 Downloader: Bintang API\n` +
        `🎬 Mode: Video / slideshow\n` +
        `🔗 NativeFlow: ON\n` +
        `🔄 Check: 5 menit\n` +
        `🛡️ Anti Dupe: ON\n\n` +
        `📡 Status grup: ${chat.enabled ? '🟢 ON' : '🔴 OFF'}\n\n` +
        `Posting lama tidak akan dikirim.\n` +
        `Gunakan ${usedPrefix}ttnotif on untuk mengaktifkan grup ini.`
      )
    } catch (error) {
      return m.reply(
        `❌ *TTNOTIF ADD GAGAL*\n\n` +
        `👤 @${username}\n\n${error.message}`
      )
    }
  }

  // DELETE (Tersedia untuk Member & Admin)
  if (subcommand === 'del') {
    const username = normalizeUsername(args?.[1] || '')

    if (!username) {
      return m.reply(
        `Contoh:\n${usedPrefix}ttnotif del @update_anime`
      )
    }

    const data = loadData()
    const chat = data.chats[jid]

    if (!chat?.users?.[username]) {
      return m.reply(
        `❌ @${username} tidak ada di daftar TTNOTIF grup ini.`
      )
    }

    delete chat.users[username]
    saveData(data)

    return m.reply(
      `✅ @${username} berhasil dihapus dari grup ini.\n\n` +
      `🛡️ Riwayat anti-dupe tetap disimpan.\n` +
      `📍 Grup lain tidak terpengaruh.`
    )
  }

  // LIST (Khusus Admin)
  if (subcommand === 'list') {
    if (!isUserAdmin) return m.reply(`❌ Perintah *${usedPrefix}ttnotif ${subcommand}* hanya dapat digunakan oleh Admin Grup.`)

    const data = loadData()
    const chat = data.chats[jid]
    const users = chat?.users || {}
    const entries = Object.entries(users)

    if (!entries.length) {
      return m.reply(
        `📭 *TTNOTIF LIST*\n\n` +
        `Belum ada akun TikTok yang dipantau di grup ini.\n\n` +
        `Gunakan ${usedPrefix}ttnotif add @username`
      )
    }

    let text = `📡 *TTNOTIF LIST — GRUP INI*\n\n`

    entries.forEach(([username, config], index) => {
      text +=
        `${index + 1}. @${username} ` +
        `${config?.enabled === false ? '🔴 OFF' : '🟢 ON'}\n`
    })

    text +=
      `\n📍 Status grup: ${chat?.enabled ? '🟢 ON' : '🔴 OFF'}` +
      `\n🎬 Mode: Video / slideshow` +
      `\n🔗 NativeFlow: ON` +
      `\n🔄 Check: 5 menit` +
      `\n📦 Maks: 5 update/check`

    return m.reply(text)
  }

  // ON / OFF PER GROUP (Khusus Admin)
  if (subcommand === 'on' || subcommand === 'off') {
    if (!isUserAdmin) return m.reply(`❌ Perintah *${usedPrefix}ttnotif ${subcommand}* hanya dapat digunakan oleh Admin Grup.`)

    const data = loadData()
    const chat = ensureChat(data, jid)

    chat.enabled = subcommand === 'on'

    saveData(data)

    return m.reply(
      `${chat.enabled ? '🟢' : '🔴'} *TTNOTIF GRUP ${subcommand.toUpperCase()}*\n\n` +
      `📍 Grup: ${jid}\n` +
      `📡 Status: ${chat.enabled ? 'AKTIF' : 'NONAKTIF'}\n` +
      `👤 Akun terdaftar: ${Object.keys(chat.users).length}\n\n` +
      `Grup lain tidak terpengaruh.`
    )
  }

  // STATUS (Tersedia untuk Member & Admin)
  if (subcommand === 'status') {
    const data = loadData()
    const chat = data.chats[jid]
    const users = chat?.users || {}

    const count = Object.keys(users).length

    const seenCount = Object.keys(data.seen || {})
      .filter(key => key.startsWith(`${jid}|`))
      .length

    return m.reply(
      `╭━━〔 📡 TTNOTIF STATUS 〕━━╮\n┃\n` +
      `┃ Grup         : ${chat?.enabled ? '🟢 ON' : '🔴 OFF'}\n` +
      `┃ Akun         : ${count}\n` +
      `┃ Mode         : 🎬 Video / slideshow\n` +
      `┃ Check        : 5 menit\n` +
      `┃ Update/check : Maks. 5\n` +
      `┃ Downloader   : Bintang API\n` +
      `┃ NativeFlow   : 🟢 ON\n` +
      `┃ Anti Dupe    : 🟢 ON\n` +
      `┃ Seen DB grup : ${seenCount}\n` +
      `┃ Watcher      : ${state.watcherStarted ? '🟢 AKTIF' : '🔴 OFF'}\n┃\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // TEST (Tersedia untuk Member & Admin)
  if (subcommand === 'test') {
    const username = normalizeUsername(args?.[1] || '')

    if (!username) {
      return m.reply(
        `Contoh:\n${usedPrefix}ttnotif test @update_anime`
      )
    }

    try {
      await m.reply(
        `⏳ *TTNOTIF TEST*\n\n` +
        `👤 @${username}\n` +
        `📡 RSSHub → Bintang API\n` +
        `🎬 Mode → Video / slideshow\n` +
        `🔗 NativeFlow → ON\n` +
        `🔎 Mengambil posting terbaru...`
      )

      const result = await checkUser(
        conn,
        jid,
        username,
        {
          maxUpdate: 1,
          isTest: true
        }
      )

      return m.reply(
        `✅ *TTNOTIF TEST SELESAI*\n\n` +
        `👤 @${username}\n` +
        `📦 Dikirim: ${result.sent}\n` +
        `📡 Source: ${result.source}\n` +
        `📥 Downloader: Bintang API\n` +
        `🎬 Mode: Video / slideshow\n` +
        `🔗 NativeFlow: ON\n\n` +
        `🛡️ Test tidak mengubah database seen.`
      )
    } catch (error) {
      console.error('[TTNOTIF] TEST ERROR:', error)

      return m.reply(
        `❌ *TTNOTIF TEST GAGAL*\n\n` +
        `👤 @${username}\n\n` +
        `Error: ${error.message}`
      )
    }
  }

  // UNKNOWN
  return m.reply(
    `❌ Subcommand tidak dikenal.\n\n` +
    `Gunakan ${usedPrefix}ttnotif untuk melihat bantuan.`
  )
}

// ======================================================
// PLUGIN CONFIG
// ======================================================

handler.help = [
  'ttnotif add @username',
  'ttnotif del @username',
  'ttnotif list',
  'ttnotif on',
  'ttnotif off',
  'ttnotif status',
  'ttnotif test @username'
]

handler.tags = ['tools']
handler.command = /^ttnotif$/i
// handler.admin = true // <-- Dihapus agar command dasar bisa diakses member

export default handler