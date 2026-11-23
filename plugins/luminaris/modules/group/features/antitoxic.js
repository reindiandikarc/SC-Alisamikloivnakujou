import { CHAT, logger } from '../../../_runtime/core-shim.js'
import { MOD_LIMIT, createToggle, extractModText, recordViolation } from './moderation/shared.js'

// Anti-toxic: deteksi kata kasar dengan daftar sendiri, terpisah dari
// blacklist/wordfilter. Default OFF supaya grup lama tidak berubah perilaku.
//
//   !antitoxic on|off
//   !antitoxic add|del <kata...>
//   !antitoxic list|clear|reset

const ENABLED_KEY = 'antitoxicEnabled'
const WORDS_KEY = 'antitoxicWords'
const COUNTS_KEY = 'antitoxicViolations'

const MAX_WORDS = 200
const MAX_WORD_LEN = 60

const DEFAULT_WORDS = [
  'anjing', 'bangsat', 'bajingan', 'berengsek', 'brengsek',
  'goblok', 'idiot', 'kampret', 'keparat', 'kontol',
  'memek', 'ngentot', 'peler', 'pepek', 'sialan',
  'tolol', 'tai', 'babi',
  'asshole', 'bastard', 'bitch', 'dick', 'fuck',
  'motherfucker', 'pussy', 'slut', 'whore'
]

const toggle = createToggle(ENABLED_KEY, false)

const LEET = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a',
  '5': 's', '7': 't', '@': 'a', '$': 's'
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let matcher = { key: '', regex: null }

export default {
  name: 'antitoxic',
  command: ['antitoxic', 'antikasar'],
  event: ['messages.upsert'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Hapus kata kasar dan kick setelah 3 peringatan',

  async handle(ctx) {
    if (ctx.type === 'event') {
      if (ctx.event !== 'messages.upsert') return
      return handleUpsert(ctx)
    }
    return handleCommand(ctx)
  }
}

async function handleUpsert(ctx) {
  const { payload, moduleData } = ctx
  if (payload?.type !== 'notify' || !moduleData) return

  for (const msg of payload.messages || []) {
    if (!msg?.message || msg.key?.fromMe) continue

    const chat = msg.key.remoteJid
    if (!chat?.endsWith('@g.us')) continue
    if (!(await toggle.get(moduleData, chat))) continue

    await ensureDefaults(moduleData, chat)
    const words = await getWords(moduleData, chat)
    if (!words.length) continue

    const hit = findToxic(extractModText(msg.message), words)
    if (!hit) continue

    try {
      await recordViolation(ctx, msg, chat, {
        countsKey: COUNTS_KEY,
        warnLines: (tag, count) => [
          `⚠️ Peringatan ${count}/${MOD_LIMIT} ${tag}`,
          `Kata kasar terdeteksi ("${hit}").`,
          `Pelanggaran ke-${MOD_LIMIT} → kamu akan dikeluarkan dari grup.`
        ],
        kickLines: (tag) => [
          `🚫 ${tag} dikeluarkan dari grup setelah ${MOD_LIMIT} pelanggaran (kata kasar).`
        ],
        kickFailLines: (tag, error) => [
          `🚫 ${tag} mencapai ${MOD_LIMIT} pelanggaran tapi gagal dikeluarkan.`,
          `Alasan: ${error.message}`,
          'Pastikan bot menjadi admin grup.'
        ]
      })
    } catch (error) {
      logger.warn(`[antitoxic] gagal proses pelanggaran di ${chat}: ${error.message}`)
    }
  }
}

async function handleCommand(ctx) {
  const { moduleData, args, prefix } = ctx
  if (!moduleData) return

  await ensureDefaults(moduleData, ctx.chat)

  const sub = String(args[0] || '').toLowerCase()
  const cmd = `${prefix}antitoxic`

  if (sub === 'on' || sub === 'off') {
    const value = sub === 'on'
    await moduleData.group.set(ctx.chat, ENABLED_KEY, value)
    toggle.set(ctx.chat, value)
    return ctx.reply.success(
      `Anti-toxic ${value ? 'aktif ✅' : 'nonaktif ❌'} di grup ini.`
    )
  }

  if (sub === 'add') {
    const words = await getWords(moduleData, ctx.chat)
    const added = normalizeWords(args.slice(1))
    const next = [...new Set([...words, ...added])].slice(0, MAX_WORDS)
    await moduleData.group.set(ctx.chat, WORDS_KEY, next)
    return ctx.reply.success(
      added.length
        ? `Ditambahkan ${next.length - words.length} kata. Total: ${next.length}.`
        : 'Tidak ada kata baru.'
    )
  }

  if (sub === 'del' || sub === 'delete' || sub === 'remove') {
    const gone = new Set(normalizeWords(args.slice(1)))
    const words = await getWords(moduleData, ctx.chat)
    const next = words.filter((word) => !gone.has(word))
    await moduleData.group.set(ctx.chat, WORDS_KEY, next)
    return ctx.reply.success(`Dihapus ${words.length - next.length} kata. Sisa: ${next.length}.`)
  }

  if (sub === 'clear') {
    await moduleData.group.set(ctx.chat, WORDS_KEY, [])
    return ctx.reply.success('Daftar kata anti-toxic dikosongkan.')
  }

  if (sub === 'list') {
    const words = await getWords(moduleData, ctx.chat)
    const enabled = await toggle.get(moduleData, ctx.chat)
    return ctx.reply([
      '*Anti-toxic*',
      `Status : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
      `Kata   : ${words.length} terdaftar`,
      '',
      words.length ? words.join(', ') : '_kosong_',
      '',
      `${cmd} add|del <kata...> — ubah daftar`
    ].join('\n'))
  }

  if (sub === 'reset') {
    await moduleData.group.delete(ctx.chat, COUNTS_KEY)
    return ctx.reply.success('Hitungan pelanggaran anti-toxic direset.')
  }

  const enabled = await toggle.get(moduleData, ctx.chat)
  const words = await getWords(moduleData, ctx.chat)
  return ctx.reply([
    '*Anti-toxic*',
    `Status : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
    `Kata   : ${words.length} terdaftar`,
    `Aksi   : warning ${MOD_LIMIT}x lalu kick`,
    '',
    `${cmd} on|off`,
    `${cmd} add|del <kata...>`,
    `${cmd} list|clear|reset`
  ].join('\n'))
}

async function ensureDefaults(moduleData, chat) {
  const stored = await moduleData.group.get(chat, WORDS_KEY)
  if (stored == null) await moduleData.group.set(chat, WORDS_KEY, [...DEFAULT_WORDS])
}

async function getWords(moduleData, chat) {
  const stored = await moduleData.group.get(chat, WORDS_KEY)
  if (!Array.isArray(stored)) return [...DEFAULT_WORDS]
  return stored
    .map((word) => String(word).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_WORDS)
}

function normalizeWords(values) {
  return values
    .flatMap((value) => String(value).split(/[,\s]+/))
    .map((value) => normalizeText(value).replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((value) => value.length >= 2 && value.length <= MAX_WORD_LEN)
}

function normalizeText(raw) {
  return String(raw || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[013457@$]/g, (char) => LEET[char] ?? char)
}

function findToxic(text, words) {
  const normalized = normalizeText(text)
  if (!normalized || !words.length) return null

  const regex = buildMatcher(words)
  const match = normalized.match(regex)
  return match ? match[1] : null
}

function buildMatcher(words) {
  const key = words.join('\u0000')
  if (matcher.key === key && matcher.regex) return matcher.regex

  const regex = new RegExp(
    `(?<![\\p{L}\\p{N}])(${words.map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`,
    'iu'
  )
  matcher = { key, regex }
  return regex
}

export const __test = { normalizeText, normalizeWords, findToxic, DEFAULT_WORDS }
