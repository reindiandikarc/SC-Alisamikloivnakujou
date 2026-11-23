import { CHAT, logger } from '../../../_runtime/core-shim.js'
import {
  MOD_LIMIT,
  createToggle,
  pruneExpired,
  recordViolation
} from './moderation/shared.js'

const CARD_TYPES = ['interactiveMessage', 'buttonsMessage', 'templateMessage', 'listMessage']

const WRAPPERS = [
  'ephemeralMessage',
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension',
  'documentWithCaptionMessage',
  'editedMessage',
  'deviceSentMessage',
  'botInvokeMessage'
]

const MAX_UNWRAP_DEPTH = 8

const ENABLED_KEY = 'antibotEnabled'
const COUNTS_KEY = 'antibotViolations'

const toggle = createToggle(ENABLED_KEY)

function detectCard(message) {
  let m = message
  for (let depth = 0; depth < MAX_UNWRAP_DEPTH && m && typeof m === 'object'; depth++) {
    for (const type of CARD_TYPES) {
      if (m[type]) return type
    }
    const next = WRAPPERS.map((w) => m[w]?.message).find(Boolean)
    if (!next) return null
    m = next
  }
  return null
}

async function handleUpsert(ctx) {
  const { payload, moduleData } = ctx
  if (payload?.type !== 'notify' || !moduleData) return

  for (const msg of payload.messages || []) {
    if (!msg?.message || msg.key?.fromMe) continue

    const chat = msg.key.remoteJid
    if (!chat?.endsWith('@g.us')) continue

    const cardType = detectCard(msg.message)
    if (!cardType) continue

    if (!(await toggle.get(moduleData, chat))) continue

    try {
      await recordViolation(ctx, msg, chat, {
        countsKey: COUNTS_KEY,
        warnLines: (tag, count) => [
          `⚠️ Peringatan ${count}/${MOD_LIMIT} ${tag}`,
          `Pesan kartu/template bot (${cardType}) tidak diizinkan di sini.`,
          `Pelanggaran ke-${MOD_LIMIT} → kamu akan dikeluarkan dari grup.`
        ],
        kickLines: (tag) => [
          `🚫 ${tag} dikeluarkan dari grup setelah ${MOD_LIMIT} pelanggaran (kartu/bot).`
        ],
        kickFailLines: (tag, error) => [
          `🚫 ${tag} mencapai ${MOD_LIMIT} pelanggaran tapi gagal dikeluarkan.`,
          `Alasan: ${error.message}`,
          'Pastikan bot menjadi admin grup.'
        ]
      })
    } catch (error) {
      logger.warn(`[antibot] gagal proses pelanggaran di ${chat}: ${error.message}`)
    }
  }
}

async function handleCommand(ctx) {
  const { sock, chat, msg, args, moduleData, prefix } = ctx
  if (!moduleData) return

  const sub = (args[0] || '').toLowerCase()
  const cmd = `${prefix}antibot`

  if (sub === 'on' || sub === 'off') {
    const value = sub === 'on'
    await moduleData.group.set(chat, ENABLED_KEY, value)
    toggle.set(chat, value)
    return sock.sendMessage(chat, {
      text: `Anti-bot ${value ? 'aktif ✅' : 'nonaktif ❌'} di grup ini.`
    }, { quoted: msg })
  }

  if (sub === 'reset') {
    await moduleData.group.delete(chat, COUNTS_KEY)
    return sock.sendMessage(chat, { text: 'Hitungan pelanggaran anti-bot direset.' }, { quoted: msg })
  }

  if (sub) {
    return sock.sendMessage(chat, {
      text: `Subcommand tidak dikenal: ${sub}\n\n${cmd} — status\n${cmd} on|off\n${cmd} reset`
    }, { quoted: msg })
  }

  const enabled = await toggle.get(moduleData, chat)
  const violations = pruneExpired(await moduleData.group.get(chat, COUNTS_KEY))
  const total = Object.keys(violations).length

  await sock.sendMessage(chat, {
    text: [
      '*Anti-bot*',
      `status   : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
      `limit    : ${MOD_LIMIT} pelanggaran lalu kick`,
      `tercatat : ${total} user`,
      '',
      `${cmd} on|off — ubah status`,
      `${cmd} reset — hapus semua hitungan`
    ].join('\n')
  }, { quoted: msg })
}

export default {
  name: 'antibot',
  command: ['antibot', 'antibotguard'],
  event: ['messages.upsert'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Kick members sending bot cards (interactive/buttons/template/list) after 3 warnings',

  async handle(ctx) {
    if (ctx.type === 'event') {
      if (ctx.event !== 'messages.upsert') return
      return handleUpsert(ctx)
    }
    return handleCommand(ctx)
  }
}
