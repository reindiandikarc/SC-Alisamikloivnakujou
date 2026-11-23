import { CHAT, senderJid, resolveSenderName, getBotSettings } from '../../_runtime/core-shim.js'

const KEY = 'data'
const COOLDOWN_MS = 60_000
const BASE_XP = 10
const COMMAND_BONUS = 10

function load(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      xp: Number(raw.xp) || 0,
      level: Number(raw.level) || 0,
      name: raw.name ? String(raw.name).trim() : null,
      messages: Number(raw.messages) || 0,
      lastXpAt: Number(raw.lastXpAt) || 0,
    }
  }
  return { xp: 0, level: 0, name: null, messages: 0, lastXpAt: 0 }
}

function computeLevel(xp) {
  let level = 1
  let needed = 100
  let acc = 0
  const total = Math.max(0, Number(xp) || 0)
  while (total >= acc + needed) {
    acc += needed
    level++
    needed = 100 * level
  }
  return { level, xpInLevel: total - acc, xpToNext: needed }
}

function progressPercent(xpInLevel, xpToNext) {
  if (!xpToNext) return 100
  return Math.max(0, Math.min(100, Math.round((xpInLevel / xpToNext) * 100)))
}

function progressBar(percent, length = 12) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  const filled = Math.round((p / 100) * length)
  return '▰'.repeat(filled) + '▱'.repeat(Math.max(0, length - filled))
}

function isNumericName(name) {
  return !name || /^\d+$/.test(String(name).trim())
}

function safeName(rec) {
  const n = rec?.name ? String(rec.name).trim() : ''
  if (isNumericName(n)) return null
  return n
}

async function getPrefixes(db) {
  try {
    const s = await getBotSettings(db)
    if (Array.isArray(s?.prefixes) && s.prefixes.length) return s.prefixes
  } catch {}
  return ['!', '.', '/']
}

function messageText(msg) {
  const m = msg?.message
  return (
    m?.conversation ??
    m?.extendedTextMessage?.text ??
    m?.imageMessage?.caption ??
    m?.videoMessage?.caption ??
    ''
  ).trim()
}

function isCommandMessage(msg, prefixes) {
  const text = messageText(msg)
  if (!text) return false
  return prefixes.some((p) => p && text.startsWith(p))
}

async function handleUpsert(ctx) {
  const { payload, moduleData, db } = ctx
  if (payload?.type !== 'notify' || !moduleData) return
  const prefixes = await getPrefixes(db)

  for (const msg of payload.messages || []) {
    if (!msg?.message || msg.key?.fromMe) continue
    const chat = msg.key?.remoteJid
    if (!chat || chat === 'status@broadcast') continue

    const sender = senderJid(msg)
    if (!sender) continue

    const raw = await moduleData.user.get(sender, KEY)
    const rec = load(raw)

    const name = resolveSenderName(msg, sender)
    if (!isNumericName(name)) rec.name = name

    const oldLevel = computeLevel(rec.xp).level

    const now = Date.now()
    let leveledUp = false
    if (!rec.lastXpAt || now - rec.lastXpAt >= COOLDOWN_MS) {
      const gain = isCommandMessage(msg, prefixes) ? BASE_XP + COMMAND_BONUS : BASE_XP
      rec.xp += gain
      rec.messages += 1
      rec.lastXpAt = now
      leveledUp = computeLevel(rec.xp).level > oldLevel
    }

    await moduleData.user.set(sender, KEY, rec)

    if (leveledUp && ctx.sock) {
      const { level, xpInLevel, xpToNext } = computeLevel(rec.xp)
      const percent = progressPercent(xpInLevel, xpToNext)
      const bar = progressBar(percent)
      const rows = await moduleData.getAllByKey('user', KEY)
      const all = rows
        .map((r) => ({ entityId: r.entityId, xp: load(r.value).xp || 0 }))
        .filter((r) => r.xp > 0)
        .sort((a, b) => b.xp - a.xp)
      const pos = all.findIndex((r) => r.entityId === sender)
      const displayName = safeName(rec) || 'Kamu'
      const text = [
        '🎉 Level Up!',
        `🏆 ${displayName}`,
        `Level ${level} • ${rec.xp} XP • Peringkat ${pos >= 0 ? `#${pos + 1}` : '-'}`,
        `${bar} ${percent}%`,
      ].join('\n')
      try {
        await ctx.sock.sendMessage(chat, { text, mentions: [sender] })
      } catch {}
    }
  }
}

function medalFor(i) {
  return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
}

async function showSelf(ctx) {
  const { sock, msg, chat, sender, moduleData } = ctx
  const raw = await moduleData.user.get(sender, KEY)
  const rec = load(raw)

  const name = resolveSenderName(ctx.msg || msg, sender)
  if (!isNumericName(name)) {
    rec.name = name
    await moduleData.user.set(sender, KEY, rec)
  }

  const { level, xpInLevel, xpToNext } = computeLevel(rec.xp)

  const rows = await moduleData.getAllByKey('user', KEY)
  const all = rows
    .map((r) => ({ entityId: r.entityId, xp: load(r.value).xp || 0 }))
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp)
  const pos = all.findIndex((r) => r.entityId === sender)

  const displayName = safeName(rec) || 'Kamu'
  const percent = progressPercent(xpInLevel, xpToNext)
  const bar = progressBar(percent)
  const text = [
    `🏆 Rank \`${displayName}\``,
    `Level ${level} • ${rec.xp} XP • Peringkat ${pos >= 0 ? `#${pos + 1}` : '-'}`,
    `${bar} ${percent}%`,
    `💬 Pesan tercatat: ${rec.messages}`,
  ].join('\n')

  await sock.sendMessage(chat, { text }, { quoted: msg })
}

async function showLeaderboard(ctx) {
  const { sock, msg, chat, moduleData } = ctx
  const rows = await moduleData.getAllByKey('user', KEY)
  const list = rows
    .map((r) => {
      const rec = load(r.value)
      return {
        name: safeName(rec) || 'Anonim',
        xp: rec.xp || 0,
        level: computeLevel(rec.xp || 0).level,
      }
    })
    .filter((e) => e.xp > 0)
    .sort((a, b) => b.xp - a.xp || b.level - a.level)
    .slice(0, 10)

  if (list.length === 0) {
    await sock.sendMessage(chat, { text: '_Belum ada data leveling._' }, { quoted: msg })
    return
  }

  let text = '*🏆 Leaderboard Global*\n\n'
  for (let i = 0; i < list.length; i++) {
    const e = list[i]
    text += `${medalFor(i)} ${e.name}\n   _Level ${e.level} · ${e.xp} XP_\n`
  }
  await sock.sendMessage(chat, { text: text.trim() }, { quoted: msg })
}

async function handleCommand(ctx) {
  const { args } = ctx
  const sub = (args?.[0] || '').toLowerCase()
  const trigger = String(ctx.trigger || ctx.name || '').toLowerCase()

  const wantsLeaderboard =
    sub === 'leaderboard' || sub === 'lb' || sub === 'top' || sub === 'topxp' ||
    sub === 'ranking' || sub === 'toprank' ||
    trigger.includes('leaderboard') || trigger === 'lb' || trigger.includes('top')

  if (wantsLeaderboard) return showLeaderboard(ctx)

  if (sub === 'help' || sub === 'menu') {
    const { sock, msg, chat } = ctx
    const text = [
      '*⭐ Leveling Global*',
      '',
      '`.level` — status & rank diri',
      '`.leaderboard` — top 10 global',
      '',
      'XP didapat dari chat dan penggunaan command.',
    ].join('\n')
    await sock.sendMessage(chat, { text }, { quoted: msg })
    return
  }

  return showSelf(ctx)
}

export default {
  name: 'leveling',
  command: ['level', 'lvl', 'xp', 'rank', 'leaderboard', 'lb', 'top', 'topxp'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'general',
  description: 'Global leveling, rank, and leaderboard (privacy-first)',
  event: ['messages.upsert'],

  async handle(ctx) {
    if (ctx.type === 'event') {
      if (ctx.event !== 'messages.upsert') return
      return handleUpsert(ctx)
    }
    return handleCommand(ctx)
  }
}
