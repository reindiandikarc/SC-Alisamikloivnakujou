import { CHAT, logger } from '../../../_runtime/core-shim.js'
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

// Daftar kata terlarang per grup + deteksi kata kotor di pesan grup.
//
//   !blacklist add <kata...> — tambah kata (boleh beberapa sekaligus / batch)
//   !blacklist del <kata...> — hapus kata
//   !blacklist list          — lihat daftar + status
//   !blacklist on|off        — nyala/matikan filter (default on)
//   !blacklist reset         — hapus hitungan pelanggaran
//   !blacklist clear         — kosongkan seluruh daftar kata

const ENABLED_KEY = 'blacklistEnabled'
const WORDS_KEY = 'blacklistWords'
const COUNTS_KEY = 'blacklistViolations'

const MAX_WORDS = 200
const MAX_WORD_LEN = 60

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
      if (parsed && Array.isArray(parsed.words)) return parsed.words
    } catch {
      // coba kandidat berikutnya
    }
  }
  return fallback
}

const DEFAULT_BADWORDS = readDefaultJson(
  ['badwords.json', 'default-badwords.json'],
  ['bangsat', 'tolol']
)

const toggle = createToggle(ENABLED_KEY)

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const LEET = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's'
}

// Normalisasi ringan untuk menutup bypass umum tanpa mengubah teks asli.
function normalizeText(raw) {
  return String(raw || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[013457]/g, (c) => LEET[c] ?? c)
    .replace(/(?<=[\p{L}\p{N}])[@$](?=[\p{L}\p{N}])/gu, (c) => LEET[c] ?? c)
}

function normalizeWord(raw) {
  return normalizeText(raw).trim().slice(0, MAX_WORD_LEN)
}

function splitBatch(raw) {
  return String(raw || '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

async function getWords(moduleData, chat) {
  const stored = moduleData ? await moduleData.group.get(chat, WORDS_KEY) : null
  if (Array.isArray(stored)) return stored.filter((w) => typeof w === 'string')
  return [...DEFAULT_BADWORDS]
}

// Batas kata unicode (bukan substring): "kontol" kena, "kontolodon" tidak.
// Kata >= 4 huruf boleh diselingi separator umum: "b a d w o r d".
// Catatan: ini menutup separator, bukan wildcard pengganti huruf seperti
// "b*dw*rd" — fuzzy matching untuk kasus itu berisiko false positive.
const SEP = '[\\s._*+~\\-·•]*'
const MIN_SEPARATOR_WORD_LEN = 4

function buildMatcher(words) {
  if (!words.length) return null
  const alt = words
    .map((word) => {
      const chars = [...normalizeText(word)].map(escapeRe)
      return chars.length >= MIN_SEPARATOR_WORD_LEN ? chars.join(SEP) : chars.join('')
    })
    .filter(Boolean)
    .join('|')
  if (!alt) return null
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alt})(?![\\p{L}\\p{N}])`, 'iu')
}

const matcherCache = new Map()
const MATCHER_CACHE_MAX = 100

function getMatcher(words) {
  const key = words.join('\u0000')
  if (matcherCache.has(key)) return matcherCache.get(key)
  const matcher = buildMatcher(words)
  if (matcherCache.size >= MATCHER_CACHE_MAX) matcherCache.clear()
  matcherCache.set(key, matcher)
  return matcher
}

function findMatch(matcher, text) {
  if (!matcher) return null
  return normalizeText(text).match(matcher)?.[0] || null
}

async function ensureDefaults(moduleData, chat) {
  if (!moduleData) return
  if ((await moduleData.group.get(chat, ENABLED_KEY)) === null) {
    await moduleData.group.set(chat, ENABLED_KEY, true)
    toggle.set(chat, true)
  }
  if ((await moduleData.group.get(chat, WORDS_KEY)) === null) {
    await moduleData.group.set(chat, WORDS_KEY, [...DEFAULT_BADWORDS])
  }
}

async function handleUpsert(ctx) {
  const { payload, moduleData } = ctx
  if (payload?.type !== 'notify' || !moduleData) return

  for (const msg of payload.messages || []) {
    if (!msg?.message || msg.key?.fromMe) continue

    const chat = msg.key.remoteJid
    if (!chat?.endsWith('@g.us')) continue

    await ensureDefaults(moduleData, chat)
    if (!(await toggle.get(moduleData, chat))) continue

    const words = await getWords(moduleData, chat)
    if (!words.length) continue

    const hit = findMatch(getMatcher(words), extractModText(msg.message))
    if (!hit) continue

    try {
      await recordViolation(ctx, msg, chat, {
        countsKey: COUNTS_KEY,
        warnLines: (tag, count) => [
          `⚠️ Peringatan ${count}/${MOD_LIMIT} ${tag}`,
          `Badword terdeteksi ("${hit}").`,
          `Pelanggaran ke-${MOD_LIMIT} → kamu akan dikeluarkan dari grup.`
        ],
        kickLines: (tag) => [
          `🚫 ${tag} dikeluarkan dari grup setelah ${MOD_LIMIT} pelanggaran (kata terlarang).`
        ],
        kickFailLines: (tag, error) => [
          `🚫 ${tag} mencapai ${MOD_LIMIT} pelanggaran tapi gagal dikeluarkan.`,
          `Alasan: ${error.message}`,
          'Pastikan bot menjadi admin grup.'
        ]
      })
    } catch (error) {
      logger.warn(`[blacklist] gagal proses pelanggaran di ${chat}: ${error.message}`)
    }
  }
}

async function handleCommand(ctx) {
  const { sock, chat, msg, args, moduleData, prefix } = ctx
  if (!moduleData) return

  await ensureDefaults(moduleData, chat)

  const cmd = `${prefix}blacklist`
  const sub = (args[0] || '').toLowerCase()

  if (sub === 'on' || sub === 'off') {
    const value = sub === 'on'
    await moduleData.group.set(chat, ENABLED_KEY, value)
    toggle.set(chat, value)
    return sock.sendMessage(chat, {
      text: `Filter kata ${value ? 'aktif ✅' : 'nonaktif ❌'} di grup ini.`
    }, { quoted: msg })
  }

  if (sub === 'add' || sub === 'addword' || sub === 'addwords') {
    const fresh = args.slice(1).flatMap(splitBatch).map(normalizeWord).filter(Boolean)
    if (!fresh.length) {
      return sock.sendMessage(chat, { text: `Pakai: ${cmd} add <kata...>` }, { quoted: msg })
    }
    const words = await getWords(moduleData, chat)
    const known = new Set(words.map(normalizeWord))
    const added = []
    for (const w of fresh) {
      if (!known.has(w) && words.length < MAX_WORDS) {
        known.add(w)
        words.push(w)
        added.push(w)
      }
    }
    await moduleData.group.set(chat, WORDS_KEY, words)
    return sock.sendMessage(chat, {
      text: added.length
        ? `Ditambahkan (${added.length}): ${added.join(', ')}\nTotal: ${words.length} kata.`
        : 'Tidak ada kata baru (sudah ada / daftar penuh).'
    }, { quoted: msg })
  }

  if (sub === 'del' || sub === 'delete' || sub === 'remove' || sub === 'rm' || sub === 'delword' || sub === 'delwords') {
    const gone = new Set(args.slice(1).flatMap(splitBatch).map(normalizeWord).filter(Boolean))
    if (!gone.size) {
      return sock.sendMessage(chat, { text: `Pakai: ${cmd} del <kata...>` }, { quoted: msg })
    }
    const words = await getWords(moduleData, chat)
    const kept = words.filter((w) => !gone.has(normalizeWord(w)))
    await moduleData.group.set(chat, WORDS_KEY, kept)
    return sock.sendMessage(chat, {
      text: `Dihapus ${words.length - kept.length} kata. Sisa: ${kept.length} kata.`
    }, { quoted: msg })
  }

  if (sub === 'list' || sub === 'ls') {
    const words = await getWords(moduleData, chat)
    const enabled = await toggle.get(moduleData, chat)
    return sock.sendMessage(chat, {
      text: [
        '*Daftar kata terlarang*',
        `status : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
        words.length ? words.map((w, i) => `${i + 1}. ${w}`).join('\n') : '_kosong_',
        '',
        `${cmd} add|del <kata...> — ubah daftar`
      ].join('\n')
    }, { quoted: msg })
  }

  if (sub === 'reset') {
    await moduleData.group.delete(chat, COUNTS_KEY)
    return sock.sendMessage(chat, { text: 'Hitungan pelanggaran filter kata direset.' }, { quoted: msg })
  }

  if (sub === 'clear') {
    await moduleData.group.set(chat, WORDS_KEY, [])
    return sock.sendMessage(chat, { text: 'Daftar kata terlarang dikosongkan.' }, { quoted: msg })
  }

  if (sub) {
    return sock.sendMessage(chat, {
      text: [
        `Subcommand tidak dikenal: ${sub}`,
        '',
        `${cmd} — status`,
        `${cmd} on|off`,
        `${cmd} add|del <kata...>`,
        `${cmd} list|reset|clear`
      ].join('\n')
    }, { quoted: msg })
  }

  const enabled = await toggle.get(moduleData, chat)
  const words = await getWords(moduleData, chat)
  const violations = pruneExpired(await moduleData.group.get(chat, COUNTS_KEY))

  await sock.sendMessage(chat, {
    text: [
      '*Filter kata (blacklist)*',
      `status   : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
      `kata     : ${words.length} terdaftar`,
      `limit    : ${MOD_LIMIT} pelanggaran lalu kick`,
      `tercatat : ${Object.keys(violations).length} user`,
      '',
      `${cmd} on|off — ubah status`,
      `${cmd} add|del <kata...> — ubah daftar`,
      `${cmd} list|reset|clear`
    ].join('\n')
  }, { quoted: msg })
}

export const __test = { normalizeText, normalizeWord, buildMatcher, getMatcher, findMatch, MAX_WORDS, getWords, DEFAULT_BADWORDS, splitBatch }

export default {
  name: 'blacklist',
  command: ['blacklist', 'wordfilter', 'badword'],
  event: ['messages.upsert'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Delete messages with blacklisted words, kick after 3 warnings',

  async handle(ctx) {
    if (ctx.type === 'event') {
      if (ctx.event !== 'messages.upsert') return
      return handleUpsert(ctx)
    }
    return handleCommand(ctx)
  }
}