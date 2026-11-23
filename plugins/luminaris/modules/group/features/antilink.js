import { CHAT } from '../../../_runtime/core-shim.js'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  MOD_LIMIT,
  createToggle,
  extractModText,
  pruneExpired,
  recordViolation
} from './moderation/shared.js'

// Link apa pun di pesan grup: URL http(s), www., undangan grup/channel,
// dan invite Discord/Telegram. Pola sengaja longgar — admin yang butuh
// berbagi link bisa dimatikan per grup (`!antilink off`) atau menambahkan
// link yang dizinkan (`!antilink allow ...`).
const LINK_RE = /(https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|discord\.(gg|com\/invite)|instagram\.com\/)/i

const ENABLED_KEY = 'antilinkEnabled'
const COUNTS_KEY = 'antilinkViolations'
const ALLOWED_KEY = 'antilinkAllowed'

const toggle = createToggle(ENABLED_KEY)

const MAX_ALLOWED = 200
const MAX_LINK_LEN = 200

const __dirname = dirname(fileURLToPath(import.meta.url))

function readDefaultJson(filenames, fallback) {
  const candidates = []
  for (const name of filenames) {
    candidates.push(join(process.cwd(), 'data', 'defaults', name))
    candidates.push(join(process.cwd(), 'data', name))
    candidates.push(join(__dirname, '..', '..', 'data', name)) // modules/group/data
  }
  for (const p of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(p, 'utf-8'))
      if (Array.isArray(parsed)) return parsed
      if (parsed && Array.isArray(parsed.items)) return parsed.items
      if (parsed && Array.isArray(parsed.links)) return parsed.links
      if (parsed && Array.isArray(parsed.words)) return parsed.words
    } catch {
      // coba kandidat berikutnya
    }
  }
  return fallback
}

const DEFAULT_ALLOWED_LINKS = readDefaultJson(
  ['allowed-links.json', 'default-allowed-links.json'],
  []
)

const ALLOW_ADD_SUBS = new Set(['allow', 'allowadd', 'addallow', 'whitelist', 'allowlink'])
const ALLOW_REMOVE_SUBS = new Set(['disallow', 'unallow', 'allowdel', 'delallow', 'removeallow', 'unwhitelist'])
const ALLOW_LIST_SUBS = new Set(['allowed', 'allowlist', 'allowls', 'listallow', 'allowedlinks'])
const ALLOW_CLEAR_SUBS = new Set(['allowclear', 'clearallow', 'clearallowed'])

function splitBatch(raw) {
  return String(raw || '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeLink(raw) {
  return String(raw || '').trim().toLowerCase().slice(0, MAX_LINK_LEN)
}

function extractLinks(text) {
  const out = []
  const re = /https?:\/\/\S+|www\.\S+|chat\.whatsapp\.com\/\S+|wa\.me\/\S+|t\.me\/\S+|discord\.(?:gg|com\/invite)\/?\S*|instagram\.com\/\S*/gi
  let m
  while ((m = re.exec(String(text || ''))) !== null) out.push(m[0])
  return out
}

function parseLink(raw) {
  const value = String(raw || '').trim()
  if (!value) return null
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return null
  }
}

function allowedEntryMatches(entry, link) {
  const url = parseLink(link)
  const allowed = parseLink(entry)
  if (!url || !allowed) return false

  // Tolak trik userinfo: https://allowed.com@evil.com
  if (url.username || url.password) return false

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const allowedHost = allowed.hostname.toLowerCase().replace(/^www\./, '')
  if (host !== allowedHost && !host.endsWith(`.${allowedHost}`)) return false

  const path = (url.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/'
  const allowedPath = (allowed.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/'
  if (allowedPath !== '/') {
    const prefix = allowedPath.endsWith('/') ? allowedPath : `${allowedPath}/`
    if (path !== allowedPath && !path.startsWith(prefix)) return false
  }

  return true
}

function isAllowedText(text, allowed) {
  const list = (allowed || []).map((x) => String(x).trim().toLowerCase()).filter(Boolean)
  if (!list.length) return false

  const links = extractLinks(text)
  if (!links.length) return false

  return links.every((link) => list.some((entry) => allowedEntryMatches(entry, link)))
}

async function getAllowedLinks(moduleData, chat) {
  const stored = moduleData ? await moduleData.group.get(chat, ALLOWED_KEY) : null
  if (Array.isArray(stored)) return stored.filter((x) => typeof x === 'string')
  return [...DEFAULT_ALLOWED_LINKS]
}

async function ensureDefaults(moduleData, chat) {
  if (!moduleData) return
  if ((await moduleData.group.get(chat, ENABLED_KEY)) === null) {
    await moduleData.group.set(chat, ENABLED_KEY, true)
    toggle.set(chat, true)
  }
  if ((await moduleData.group.get(chat, ALLOWED_KEY)) === null) {
    await moduleData.group.set(chat, ALLOWED_KEY, [...DEFAULT_ALLOWED_LINKS])
  }
}

async function handleUpsert(ctx) {
  const { payload, moduleData } = ctx
  if (payload?.type !== 'notify' || !moduleData) return

  for (const msg of payload.messages || []) {
    if (!msg?.message || msg.key?.fromMe) continue

    const chat = msg.key.remoteJid
    if (!chat?.endsWith('@g.us')) continue

    const text = extractModText(msg.message)
    if (!LINK_RE.test(text)) continue

    await ensureDefaults(moduleData, chat)
    if (!(await toggle.get(moduleData, chat))) continue

    const allowed = await getAllowedLinks(moduleData, chat)
    if (isAllowedText(text, allowed)) continue

    try {
      await recordViolation(ctx, msg, chat, {
        countsKey: COUNTS_KEY,
        warnLines: (tag, count) => [
          `⚠️ Peringatan ${count}/${MOD_LIMIT} ${tag}`,
          'Link tidak diizinkan di grup ini.',
          `Pelanggaran ke-${MOD_LIMIT} → kamu akan dikeluarkan dari grup.`
        ],
        kickLines: (tag) => [
          `🚫 ${tag} dikeluarkan dari grup setelah ${MOD_LIMIT} pelanggaran (link).`
        ],
        kickFailLines: (tag, error) => [
          `🚫 ${tag} mencapai ${MOD_LIMIT} pelanggaran tapi gagal dikeluarkan.`,
          `Alasan: ${error.message}`,
          'Pastikan bot menjadi admin grup.'
        ]
      })
    } catch (error) {
      console.warn(`[antilink] gagal proses pelanggaran di ${chat}: ${error.message}`)
    }
  }
}

async function handleCommand(ctx) {
  const { sock, chat, msg, args, moduleData, prefix } = ctx
  if (!moduleData) return

  await ensureDefaults(moduleData, chat)

  const sub = (args[0] || '').toLowerCase()
  const cmd = `${prefix}antilink`

  if (sub === 'on' || sub === 'off') {
    const value = sub === 'on'
    await moduleData.group.set(chat, ENABLED_KEY, value)
    toggle.set(chat, value)
    return sock.sendMessage(chat, {
      text: `Anti-link ${value ? 'aktif ✅' : 'nonaktif ❌'} di grup ini.`
    }, { quoted: msg })
  }

  if (sub === 'reset') {
    await moduleData.group.delete(chat, COUNTS_KEY)
    return sock.sendMessage(chat, { text: 'Hitungan pelanggaran anti-link direset.' }, { quoted: msg })
  }

  if (ALLOW_ADD_SUBS.has(sub)) {
    const fresh = args.slice(1).flatMap(splitBatch).map(normalizeLink).filter(Boolean)
    if (!fresh.length) {
      return sock.sendMessage(chat, { text: `Pakai: ${cmd} allow <link...>` }, { quoted: msg })
    }
    const allowed = await getAllowedLinks(moduleData, chat)
    const known = new Set(allowed)
    const added = []
    for (const w of fresh) {
      if (!known.has(w) && allowed.length < MAX_ALLOWED) {
        known.add(w)
        allowed.push(w)
        added.push(w)
      }
    }
    await moduleData.group.set(chat, ALLOWED_KEY, allowed)
    return sock.sendMessage(chat, {
      text: added.length
        ? `Ditambahkan (${added.length}): ${added.join(', ')}\nTotal: ${allowed.length} link diizinkan.`
        : 'Tidak ada link baru (sudah ada / daftar penuh).'
    }, { quoted: msg })
  }

  if (ALLOW_REMOVE_SUBS.has(sub)) {
    const gone = new Set(args.slice(1).flatMap(splitBatch).map(normalizeLink).filter(Boolean))
    if (!gone.size) {
      return sock.sendMessage(chat, { text: `Pakai: ${cmd} disallow <link...>` }, { quoted: msg })
    }
    const allowed = await getAllowedLinks(moduleData, chat)
    const kept = allowed.filter((w) => !gone.has(w.toLowerCase()))
    await moduleData.group.set(chat, ALLOWED_KEY, kept)
    return sock.sendMessage(chat, {
      text: `Dihapus ${allowed.length - kept.length} link. Sisa: ${kept.length} link diizinkan.`
    }, { quoted: msg })
  }

  if (ALLOW_LIST_SUBS.has(sub)) {
    const allowed = await getAllowedLinks(moduleData, chat)
    const enabled = await toggle.get(moduleData, chat)
    return sock.sendMessage(chat, {
      text: [
        '*Link yang diizinkan (antilink)*',
        `status : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
        allowed.length ? allowed.map((w, i) => `${i + 1}. ${w}`).join('\n') : '_kosong_',
        '',
        `${cmd} allow|disallow <link...> — ubah daftar`,
        `${cmd} allowclear — kosongkan daftar`
      ].join('\n')
    }, { quoted: msg })
  }

  if (ALLOW_CLEAR_SUBS.has(sub)) {
    await moduleData.group.set(chat, ALLOWED_KEY, [])
    return sock.sendMessage(chat, { text: 'Daftar link yang diizinkan dikosongkan.' }, { quoted: msg })
  }

  if (sub) {
    return sock.sendMessage(chat, {
      text: [
        `Subcommand tidak dikenal: ${sub}`,
        '',
        `${cmd} — status`,
        `${cmd} on|off`,
        `${cmd} reset`,
        `${cmd} allow|disallow <link...>`,
        `${cmd} allowed|allowclear`
      ].join('\n')
    }, { quoted: msg })
  }

  const enabled = await toggle.get(moduleData, chat)
  const violations = pruneExpired(await moduleData.group.get(chat, COUNTS_KEY))
  const total = Object.keys(violations).length
  const allowed = await getAllowedLinks(moduleData, chat)

  await sock.sendMessage(chat, {
    text: [
      '*Anti-link*',
      `status   : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
      `limit    : ${MOD_LIMIT} pelanggaran lalu kick`,
      `tercatat : ${total} user`,
      `diizinkan: ${allowed.length} link`,
      '',
      `${cmd} on|off — ubah status`,
      `${cmd} reset — hapus semua hitungan`,
      `${cmd} allow|disallow <link...> — ubah link diizinkan`,
      `${cmd} allowed|allowclear`
    ].join('\n')
  }, { quoted: msg })
}

export const __test = { extractLinks, parseLink, allowedEntryMatches, isAllowedText }

export default {
  name: 'antilink',
  command: ['antilink', 'antilinkguard'],
  event: ['messages.upsert'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Delete links and kick members after 3 warnings',

  async handle(ctx) {
    if (ctx.type === 'event') {
      if (ctx.event !== 'messages.upsert') return
      return handleUpsert(ctx)
    }
    return handleCommand(ctx)
  }
}