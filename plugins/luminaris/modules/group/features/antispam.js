import { CHAT, logger } from '../../../_runtime/core-shim.js'
import { MOD_LIMIT, createToggle, recordViolation } from './moderation/shared.js'

// Anti-spam berbasis laju pesan (bukan isi pesan).
//
// Default OFF supaya grup lama tidak tiba-tiba kena kick setelah update.
// Aktifkan per grup dengan `!antispam on`.
//
// Deteksi disimpan in-memory: yang perlu persisten hanya hitungan
// pelanggaran (sudah ditangani recordViolation di ModuleData).

const ENABLED_KEY = 'antispamEnabled'
const COUNTS_KEY = 'antispamViolations'

const WINDOW_MS = 8_000
const MAX_MESSAGES = 7

const toggle = createToggle(ENABLED_KEY, false)
const bursts = new Map() // `${chat}:${sender}` -> { times: number[] }

export default {
  name: 'antispam',
  command: ['antispam', 'antispamguard'],
  event: ['messages.upsert'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Hapus pesan spam dan kick setelah 3 peringatan',

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

    const sender = msg.key.participantAlt || msg.key.participant || msg.key.remoteJid
    if (!sender) continue

    const now = Date.now()
    const key = `${chat}:${sender}`
    const burst = bursts.get(key) || { times: [] }
    burst.times = burst.times.filter((at) => now - at < WINDOW_MS)
    burst.times.push(now)
    bursts.set(key, burst)

    if (burst.times.length < MAX_MESSAGES) continue

    // Reset jendela supaya satu badai pesan tidak menghasilkan banyak
    // peringatan sekaligus. Pelanggaran berikutnya butuh badai baru.
    burst.times = []
    bursts.set(key, burst)

    try {
      await recordViolation(ctx, msg, chat, {
        countsKey: COUNTS_KEY,
        warnLines: (tag, count) => [
          `⚠️ Peringatan ${count}/${MOD_LIMIT} ${tag}`,
          `Terdeteksi spam (${MAX_MESSAGES}+ pesan dalam ${WINDOW_MS / 1000} detik).`,
          `Pelanggaran ke-${MOD_LIMIT} → kamu akan dikeluarkan dari grup.`
        ],
        kickLines: (tag) => [
          `🚫 ${tag} dikeluarkan dari grup setelah ${MOD_LIMIT} pelanggaran (spam).`
        ],
        kickFailLines: (tag, error) => [
          `🚫 ${tag} mencapai ${MOD_LIMIT} pelanggaran tapi gagal dikeluarkan.`,
          `Alasan: ${error.message}`,
          'Pastikan bot menjadi admin grup.'
        ]
      })
    } catch (error) {
      logger.warn(`[antispam] gagal proses pelanggaran di ${chat}: ${error.message}`)
    }
  }

  // Buang entri yang sudah diam > 1 menit agar map tidak tumbuh terus.
  if (bursts.size > 1000) {
    const cutoff = Date.now() - 60_000
    for (const [key, burst] of bursts) {
      if (!burst.times.length || burst.times[burst.times.length - 1] < cutoff) {
        bursts.delete(key)
      }
    }
  }
}

async function handleCommand(ctx) {
  const { moduleData, args, prefix } = ctx
  if (!moduleData) return

  const sub = String(args[0] || '').toLowerCase()
  const cmd = `${prefix}antispam`

  if (sub === 'on' || sub === 'off') {
    const value = sub === 'on'
    await moduleData.group.set(ctx.chat, ENABLED_KEY, value)
    toggle.set(ctx.chat, value)
    return ctx.reply.success(
      `Anti-spam ${value ? 'aktif ✅' : 'nonaktif ❌'} di grup ini.`
    )
  }

  if (sub === 'reset') {
    await moduleData.group.delete(ctx.chat, COUNTS_KEY)
    const prefix = `${ctx.chat}:`
    for (const key of bursts.keys()) {
      if (key.startsWith(prefix)) bursts.delete(key)
    }
    return ctx.reply.success('Hitungan pelanggaran anti-spam direset.')
  }

  const enabled = await toggle.get(moduleData, ctx.chat)
  return ctx.reply([
    '*Anti-spam*',
    `Status : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
    `Aturan : ${MAX_MESSAGES}+ pesan / ${WINDOW_MS / 1000} detik`,
    `Aksi   : warning ${MOD_LIMIT}x lalu kick`,
    '',
    `${cmd} on|off`,
    `${cmd} reset`
  ].join('\n'))
}
