import { CHAT, jidNum, logger, senderJid } from '../../../_runtime/core-shim.js'
import { createToggle, extractModText, isModerated } from './moderation/shared.js'

// Anti-delete: simpan pesan grup sebentar, lalu kirim ulang kalau pesan itu
// dihapus (revoke) oleh pengirim.
//
// Default OFF — ini fitur yang paling terasa "menguntit", jadi harus
// diaktifkan sadar oleh admin grup.
//
//   !antidelete on|off|status|reset

const ENABLED_KEY = 'antideleteEnabled'
const CACHE_TTL_MS = 30 * 60 * 1000
const MAX_CACHE = 2000

const toggle = createToggle(ENABLED_KEY, false)
const cache = new Map() // `${chat}:${id}` -> { msg, chat, at }

export default {
  name: 'antidelete',
  command: ['antidelete', 'antihapus'],
  event: ['messages.upsert', 'messages.update'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Kirim ulang pesan grup yang dihapus pengirimnya',

  async handle(ctx) {
    if (ctx.type === 'event') {
      if (ctx.event === 'messages.upsert') return cacheMessages(ctx)
      if (ctx.event === 'messages.update') return handleUpdates(ctx)
      return
    }
    return handleCommand(ctx)
  }
}

async function cacheMessages(ctx) {
  const { payload, moduleData } = ctx
  if (payload?.type !== 'notify' || !moduleData) return

  const now = Date.now()
  prune(now)

  for (const msg of payload.messages || []) {
    if (!msg?.message || msg.key?.fromMe) continue
    const chat = msg.key.remoteJid
    if (!chat?.endsWith('@g.us') || !msg.key?.id) continue

    if (!(await toggle.get(moduleData, chat))) continue

    cache.set(`${chat}:${msg.key.id}`, { msg, chat, at: now })
  }

  // Map menjaga urutan insert; buang yang paling lama kalau penuh.
  while (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value
    cache.delete(oldest)
  }
}

async function handleUpdates(ctx) {
  const { payload, moduleData } = ctx
  if (!moduleData) return

  const updates = Array.isArray(payload) ? payload : payload?.updates || []
  for (const update of updates) {
    const chat = update?.key?.remoteJid
    const id = update?.key?.id
    if (!chat?.endsWith('@g.us') || !id) continue
    if (update?.key?.fromMe) continue

    const revoked =
      update?.update?.message === null ||
      update?.update?.messageStubType === 1
    if (!revoked) continue

    if (!(await toggle.get(moduleData, chat))) continue

    const key = `${chat}:${id}`
    const cached = cache.get(key)
    if (!cached) continue
    cache.delete(key)

    // Jangan repost pesan yang dihapus oleh moderator bot sendiri
    // (antilink/antitoxic/antispam). Kalau tidak, anti-delete membatalkan
    // moderasi dan konten terlarang muncul lagi.
    if (isModerated(cached.msg)) continue

    const msg = cached.msg
    const sender = senderJid(msg)
    const text = extractModText(msg.message).trim()
    const tag = sender ? `@${jidNum(sender)}` : 'Seseorang'

    try {
      await ctx.sock.sendMessage(chat, {
        text: [
          `🗑️ Pesan dari ${tag} dihapus:`,
          '',
          text || '_(media / tanpa teks)_'
        ].join('\n'),
        mentions: sender ? [sender] : undefined
      })
    } catch (error) {
      logger.warn(`[antidelete] gagal kirim notice di ${chat}: ${error.message}`)
      continue
    }

    // Untuk media, coba teruskan pesan aslinya. Gagal bukan fatal.
    if (!text && msg.message) {
      try {
        await ctx.sock.sendMessage(chat, { forward: msg })
      } catch (error) {
        logger.debug(`[antidelete] gagal forward media: ${error.message}`)
      }
    }
  }
}

async function handleCommand(ctx) {
  const { moduleData, args, prefix } = ctx
  if (!moduleData) return

  const sub = String(args[0] || '').toLowerCase()
  const cmd = `${prefix}antidelete`

  if (sub === 'on' || sub === 'off') {
    const value = sub === 'on'
    await moduleData.group.set(ctx.chat, ENABLED_KEY, value)
    toggle.set(ctx.chat, value)
    if (!value) clearChatCache(ctx.chat)
    return ctx.reply.success(
      `Anti-delete ${value ? 'aktif ✅' : 'nonaktif ❌'} di grup ini.`
    )
  }

  if (sub === 'reset') {
    clearChatCache(ctx.chat)
    return ctx.reply.success('Cache anti-delete grup ini dikosongkan.')
  }

  const enabled = await toggle.get(moduleData, ctx.chat)
  return ctx.reply([
    '*Anti-delete*',
    `Status : ${enabled ? 'aktif ✅' : 'nonaktif ❌'}`,
    `Simpan : ${CACHE_TTL_MS / 60000} menit terakhir`,
    '',
    `${cmd} on|off`,
    `${cmd} reset — kosongkan cache grup ini`
  ].join('\n'))
}

function prune(now) {
  const cutoff = now - CACHE_TTL_MS
  for (const [key, entry] of cache) {
    if (entry.at < cutoff) cache.delete(key)
    else break // insert order = waktu, sisanya lebih baru
  }
}

function clearChatCache(chat) {
  const prefix = `${chat}:`
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
