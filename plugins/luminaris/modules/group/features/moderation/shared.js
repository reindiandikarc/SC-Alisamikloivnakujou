// Submodule bersama untuk moderasi grup (antilink, blacklist, antibot).
//
// Pola yang dipakai: peringatan 1-2, kick di pelanggaran ke-3, hitungan
// kedaluwarsa 24 jam, owner + admin dikecualikan.
// File ini TIDAK punya `handle`/`execute` — loader mengabaikannya sebagai
// plugin (lihat welcome/* yang polanya sama).

import { jidDecode } from '@whiskeysockets/baileys'
import { senderJid, toJid, jidNum, config } from '../../../../_runtime/core-shim.js'

export const MOD_LIMIT = 3
export const MOD_COUNT_TTL_MS = 24 * 60 * 60 * 1000

// Satu pesan hanya boleh diproses satu moderator. Event plugin berjalan
// berurutan, jadi pengaman ini mencegah link + badword + kartu menghasilkan
// beberapa peringatan untuk pesan yang sama.
const moderated = new WeakSet()

export function isModerated(msg) {
  return !!msg && typeof msg === 'object' && moderated.has(msg)
}

function markModerated(msg) {
  if (msg && typeof msg === 'object') moderated.add(msg)
}

// Cache status on/off per grup. Default true, TTL pendek supaya perubahan
// dari command langsung terlihat di proses yang sama.
export function createToggle(key, defaultValue = true, ttlMs = 5000) {
  const cache = new Map()
  return {
    async get(moduleData, chat) {
      const hit = cache.get(chat)
      const now = Date.now()
      if (hit && now - hit.at < ttlMs) return hit.value

      const stored = moduleData ? await moduleData.group.get(chat, key) : null
      const value = stored == null ? defaultValue : stored !== false
      cache.set(chat, { value, at: now })
      return value
    },
    set(chat, value) {
      cache.set(chat, { value, at: Date.now() })
    }
  }
}

export function pruneExpired(violations, now = Date.now()) {
  const out = {}
  for (const [jid, entry] of Object.entries(violations || {})) {
    if (entry && now - (entry.at || 0) < MOD_COUNT_TTL_MS) out[jid] = entry
  }
  return out
}

// Teks yang bisa dimoderasi: pesan biasa, reply ber-teks, dan caption media.
export function extractModText(message) {
  const m = message || {}
  return (
    m.conversation ??
    m.extendedTextMessage?.text ??
    m.imageMessage?.caption ??
    m.videoMessage?.caption ??
    m.documentMessage?.caption ??
    ''
  )
}

const sameUser = (a, b) => {
  const ua = typeof a === 'string' ? jidDecode(a)?.user : null
  const ub = typeof b === 'string' ? jidDecode(b)?.user : null
  return !!ua && ua === ub
}

export function isGroupAdmin(meta, jid) {
  if (!meta) return false
  if (Array.isArray(meta.admins) && meta.admins.length) {
    return meta.admins.some((admin) => sameUser(admin, jid))
  }
  const admins = (meta.participants || []).filter((p) => p.admin)
  return admins.some((p) =>
    [p.id, p.phoneNumber, p.lid].filter(Boolean).some((field) => sameUser(field, jid))
  )
}

export function isExempt(meta, sender) {
  if (!sender) return true
  const owner = toJid(config.ownerJid)
  if (owner && sender === owner) return true
  return isGroupAdmin(meta, sender)
}

export function tagOf(sender) {
  return `@${jidNum(sender)}`
}

// Siklus penuh satu pelanggaran: hapus pesan (best-effort) → peringatan
// di bawah limit → kick tepat di limit. Mengembalikan 'warned' | 'kicked'
// | 'kick-failed', atau null bila dilewati (moduleData kosong, sender tidak
// ada, admin/owner, atau pesan sudah ditangani moderator lain).
export async function recordViolation(ctx, msg, chat, { countsKey, warnLines, kickLines, kickFailLines }) {
  const { sock, moduleData } = ctx
  if (!moduleData) return null

  const sender = senderJid(msg)
  if (!sender) return null
  if (isModerated(msg)) return null

  const meta = await sock.groupMetadata(chat).catch(() => null)
  if (isExempt(meta, sender)) return null

  markModerated(msg)

  // Hapus pesan pelanggar dulu — gagal (bot bukan admin) bukan fatal,
  // peringatan/kick tetap jalan.
  try {
    await sock.sendMessage(chat, { delete: msg.key })
  } catch {}

  const tag = tagOf(sender)
  const violations = pruneExpired(await moduleData.group.get(chat, countsKey))
  const count = (violations[sender]?.count || 0) + 1

  if (count < MOD_LIMIT) {
    violations[sender] = { count, at: Date.now() }
  
    await moduleData.group.set(chat, countsKey, violations)
    await sock.sendMessage(chat, {
      text: warnLines(tag, count).join('\n'),
      mentions: [sender]
    })
    return 'warned'
  }

  try {
    await sock.groupParticipantsUpdate(chat, [sender], 'remove')
  } catch (error) {
    violations[sender] = { count, at: Date.now() }
  
    await moduleData.group.set(chat, countsKey, violations)
    await sock.sendMessage(chat, {
      text: kickFailLines(tag, error).join('\n'),
      mentions: [sender]
    })
    return 'kick-failed'
  }

  delete violations[sender]

  if (Object.keys(violations).length) await moduleData.group.set(chat, countsKey, violations)
  else await moduleData.group.delete(chat, countsKey)
  await sock.sendMessage(chat, {
    text: kickLines(tag).join('\n'),
    mentions: [sender]
  })
  return 'kicked'
}
