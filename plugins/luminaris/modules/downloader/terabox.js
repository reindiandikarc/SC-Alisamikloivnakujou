import { CHAT, logger } from '../../_runtime/core-shim.js'

// Plugin TeraBox punya dua sumber:
//
//   1. Gateway publik indexsubtitle.cc — dipakai lebih dulu karena masih aktif.
//   2. terabxdownloader.org — sumber asli plugin Zw, dipakai sebagai cadangan.
//
// Gateway indexsubtitle memakai API key publik yang tertanam di halaman web
// mereka (bukan kredensial pribadi). Kalau key berubah, plugin otomatis
// mencoba sumber cadangan dan menampilkan pesan yang jelas ke user.

const TERABX_BASE = 'https://terabxdownloader.org'
const TERABX_AJAX = '/wp-admin/admin-ajax.php'

const TBX_BASE = 'https://tbx.indexsubtitle.cc'
const TBX_KEY = '116486c5e3a2ea45fa2c4cfc3fdc66caf3ae134598d3aedb'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
const SESSION_TTL = 10 * 60 * 1000
const MAX_FILES = 30
const MAX_FOLDERS = 8
const MAX_FOLDER_DEPTH = 2

const TERABOX_HOSTS = [
  'terabox.com',
  'terabox.app',
  'terabox.fun',
  'teraboxshare.com',
  'teraboxlink.com',
  'terasharefile.com',
  'terafileshare.com',
  'terasharelink.com',
  '1024terabox.com',
  '1024tera.com',
  '4funbox.com',
  'mirrobox.com',
  'nephobox.com',
  'freeterabox.com',
  'tibibox.com',
  'momerybox.com'
]

const sessions = new Map()

export function isTeraBoxUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl || '').trim())
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    return TERABOX_HOSTS.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))
  } catch {
    return false
  }
}

function formatSize(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = value
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${index ? size.toFixed(2) : size} ${units[index]}`
}

/* ─── Sumber 1: gateway indexsubtitle ─────────────────────────── */

export function parseTbxBrowse(payload) {
  const root = payload?.data ?? payload
  if (!root || typeof root !== 'object') return { files: [], dirs: [] }

  const files = Array.isArray(root.files) ? root.files : []
  const dirs = Array.isArray(root.dirs) ? root.dirs : []

  return {
    files: files.map((item, index) => ({
      name: item?.server_filename || item?.filename || `File ${index + 1}`,
      size: item?.size_h || formatSize(item?.size),
      fsId: item?.fs_id != null ? String(item.fs_id) : null,
      link: null
    })).filter((item) => item.fsId),
    dirs: dirs.map((item) => ({
      name: item?.server_filename || item?.name || 'Folder',
      path: item?.path || null
    })).filter((item) => item.path)
  }
}

export function parseTbxDirect(payload) {
  const root = payload?.data ?? payload
  return root?.dlink || root?.url || null
}

function tbxHeaders() {
  return {
    accept: 'application/json',
    authorization: `Bearer ${TBX_KEY}`,
    origin: 'https://indexsubtitle.cc',
    referer: 'https://indexsubtitle.cc/',
    'user-agent': UA
  }
}

async function fetchTbxBrowse(shareUrl, dir = '/') {
  const params = new URLSearchParams({
    url: shareUrl,
    dir,
    page: '1',
    num: '50'
  })

  const res = await fetch(`${TBX_BASE}/api/browse?${params}`, {
    headers: tbxHeaders(),
    signal: AbortSignal.timeout(45_000)
  })

  if (res.status === 401) {
    throw new Error('Kunci API gateway TeraBox ditolak. Coba lagi nanti.')
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(body.slice(0, 180) || `Gateway TeraBox gagal (HTTP ${res.status}).`)
  }

  const json = await res.json().catch(() => null)
  if (!json || json.ok === false) {
    throw new Error(json?.error || 'Gateway TeraBox mengembalikan respons tidak valid.')
  }

  return parseTbxBrowse(json)
}

async function collectTbxFiles(shareUrl, dir = '/', depth = 0, collected = [], state = { folders: 0 }) {
  const { files, dirs } = await fetchTbxBrowse(shareUrl, dir)

  for (const file of files) {
    if (collected.length >= MAX_FILES) return collected
    collected.push(file)
  }

  if (depth >= MAX_FOLDER_DEPTH) return collected

  for (const folder of dirs) {
    if (collected.length >= MAX_FILES || state.folders >= MAX_FOLDERS) break
    state.folders++
    try {
      await collectTbxFiles(shareUrl, folder.path, depth + 1, collected, state)
    } catch (error) {
      logger.warn(`terabox: gagal membuka folder ${folder.path} (${error.message})`)
    }
  }

  return collected
}

async function fetchTbxDirectLink(shareUrl, fsId) {
  const params = new URLSearchParams({ url: shareUrl, fs_id: fsId })
  const res = await fetch(`${TBX_BASE}/api/file?${params}`, {
    headers: tbxHeaders(),
    signal: AbortSignal.timeout(60_000)
  })

  if (!res.ok) {
    throw new Error(`Gagal membuat link download TeraBox (HTTP ${res.status}).`)
  }

  const json = await res.json().catch(() => null)
  const link = parseTbxDirect(json)
  if (!link) {
    throw new Error(json?.error || 'Gateway TeraBox tidak mengembalikan link download.')
  }
  return link
}

async function fetchTbxFiles(shareUrl) {
  const files = await collectTbxFiles(shareUrl)
  if (!files.length) {
    throw new Error('Share TeraBox tidak berisi file yang bisa diunduh.')
  }
  return files
}

/* ─── Sumber 2: terabxdownloader.org (cadangan) ───────────────── */

export function parseNonce(html) {
  const script = String(html || '').match(/<script[^>]*id=["']jquery-core-js-extra["'][^>]*>([\s\S]*?)<\/script>/i)?.[1] || ''
  const source = script || String(html || '')
  return source.match(/"nonce"\s*:\s*"([^"]+)"/)?.[1] || null
}

export function parseTeraBoxPayload(payload) {
  const root = payload?.data ?? payload
  if (!root || typeof root !== 'object') return []

  const rawList = root['📄 Files'] || root.files || root.list || (Array.isArray(root) ? root : [])
  if (!Array.isArray(rawList)) return []

  return rawList.map((item, index) => ({
    name: item?.['📂 Name'] || item?.name || item?.file_name || item?.filename || `File ${index + 1}`,
    size: item?.['📏 Size'] || item?.size || item?.file_size || '-',
    fsId: null,
    link: item?.['🔽 Direct Download Link'] || item?.url || item?.download_url || item?.link || null
  })).filter((item) => item.link)
}

async function fetchTeraXFiles(url) {
  const pageRes = await fetch(TERABX_BASE, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(10_000)
  })
  if (!pageRes.ok) throw new Error(`Halaman TeraBox gagal dibuka (HTTP ${pageRes.status}).`)

  const nonce = parseNonce(await pageRes.text())
  if (!nonce) throw new Error('Nonce TeraBox tidak ditemukan.')

  const form = new FormData()
  form.append('action', 'terabox_fetch')
  form.append('url', url)
  form.append('nonce', nonce)

  const res = await fetch(TERABX_BASE + TERABX_AJAX, {
    method: 'POST',
    headers: {
      accept: '*/*',
      origin: TERABX_BASE,
      referer: `${TERABX_BASE}/`,
      'user-agent': UA
    },
    body: form,
    signal: AbortSignal.timeout(30_000)
  })

  if (!res.ok) throw new Error(`Server TeraBox gagal (HTTP ${res.status}).`)
  const json = await res.json().catch(() => null)
  if (json?.success === false || json?.ok === false) {
    throw new Error(json?.data?.message || json?.message || 'Server TeraBox menolak link.')
  }

  const files = parseTeraBoxPayload(json)
  if (!files.length) throw new Error('Tidak ada file yang bisa diunduh dari link tersebut.')
  return files
}

/* ─── Alur plugin ─────────────────────────────────────────────── */

async function fetchTeraBoxFiles(shareUrl) {
  try {
    const files = await fetchTbxFiles(shareUrl)
    return { provider: 'gateway', files }
  } catch (primaryError) {
    logger.warn(`terabox: gateway utama gagal (${primaryError.message}), mencoba cadangan`)
    try {
      const files = await fetchTeraXFiles(shareUrl)
      return { provider: 'terabx', files }
    } catch (fallbackError) {
      throw new Error(`${primaryError.message} Cadangan juga gagal: ${fallbackError.message}`)
    }
  }
}

function getSession(sender) {
  const session = sessions.get(sender)
  if (!session) return null
  if (session.expires < Date.now()) {
    sessions.delete(sender)
    return null
  }
  return session
}

function safeFileName(name) {
  return String(name || 'terabox-file')
    .replace(/[\\/:*?"<>|\r\n]+/g, '_')
    .slice(0, 120) || 'terabox-file'
}

function helpText(prefix) {
  return [
    '📦 *TERABOX DOWNLOADER*',
    'Unduh file dari link TeraBox.',
    '',
    '*Cara pakai*',
    `1. Kirim link: *${prefix}terabox <link>*`,
    `2. Bot menampilkan daftar file.`,
    `3. Balas nomor file: *${prefix}terabox 1*`,
    '',
    '*Contoh*',
    `> ${prefix}terabox https://1024terabox.com/s/xxxxx`,
    `> ${prefix}terabox 1`,
    '',
    '_Daftar file disimpan 10 menit._'
  ].join('\n')
}

function fileListText(files, prefix) {
  const lines = ['📦 *DAFTAR FILE TERABOX*', '']
  files.forEach((file, index) => {
    lines.push(`*${index + 1}.* ${file.name}`)
    lines.push(`> 💾 ${file.size}`)
    lines.push('')
  })
  lines.push(`Kirim nomor file untuk mengunduh, contoh: *${prefix}terabox 1*`)
  return lines.join('\n')
}

async function sendTeraBoxFile(ctx, session, file) {
  let link = file.link
  if (!link && file.fsId) {
    link = await fetchTbxDirectLink(session.shareUrl, file.fsId)
  }
  if (!link) throw new Error('Link download file tidak tersedia.')

  await ctx.sock.sendMessage(ctx.chat, {
    document: { url: link },
    fileName: safeFileName(file.name),
    mimetype: 'application/octet-stream',
    caption: `📦 *${file.name}*\n💾 ${file.size}`
  }, { quoted: ctx.msg })
}

export default {
  name: 'terabox',
  command: ['terabox', 'tb', 'tera'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Unduh file dari TeraBox',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const input = String(ctx.args[0] || '').trim()

    if (!input) return ctx.reply(helpText(prefix))

    if (/^\d+$/.test(input)) {
      const session = getSession(ctx.sender)
      if (!session) {
        return ctx.reply(`❌ *Sesi TeraBox habis.*\n\nKirim ulang link dengan *${prefix}terabox <link>*.`)
      }

      const file = session.files[Number(input) - 1]
      if (!file) {
        return ctx.reply(`❌ *Nomor tidak valid.*\n\nPilih 1 sampai ${session.files.length}.`)
      }

      await ctx.reply.react('📦')
      try {
        await sendTeraBoxFile(ctx, session, file)
        await ctx.reply.react('✅')
      } catch (error) {
        logger.error('terabox: gagal mengirim file', error)
        await ctx.reply.react('❌')
        await ctx.reply([
          '❌ *Gagal mengirim file TeraBox.*',
          '',
          `> File: ${file.name}`,
          `> ${error.message}`,
          '',
          '> Coba kirim ulang link, lalu pilih file lagi.'
        ].join('\n'))
      }
      return
    }

    if (!isTeraBoxUrl(input)) {
      return ctx.reply([
        '❌ *Link TeraBox tidak valid.*',
        '',
        'Host yang didukung: terabox.com, 1024terabox.com, terabox.app, teraboxlink.com, dan mirror TeraBox lainnya.',
        '',
        `Contoh: *${prefix}terabox https://1024terabox.com/s/xxxxx*`
      ].join('\n'))
    }

    await ctx.reply.react('📦')
    await ctx.reply('⏳ *Mengambil daftar file dari TeraBox...*')

    try {
      const { files } = await fetchTeraBoxFiles(input)
      sessions.set(ctx.sender, {
        shareUrl: input,
        files,
        expires: Date.now() + SESSION_TTL
      })
      await ctx.reply.react('✅')
      await ctx.reply(fileListText(files, prefix))
    } catch (error) {
      logger.error('terabox: gagal mengambil daftar file', error)
      await ctx.reply.react('❌')
      await ctx.reply([
        '❌ *Gagal mengambil file TeraBox.*',
        '',
        `> ${error.message}`,
        '',
        '> Pastikan link share publik dan masih aktif.'
      ].join('\n'))
    }
  }
}

export const __test = {
  isTeraBoxUrl,
  parseNonce,
  parseTeraBoxPayload,
  parseTbxBrowse,
  parseTbxDirect,
  formatSize
}
