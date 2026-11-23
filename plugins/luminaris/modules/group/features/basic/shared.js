// Helper bersama untuk command grup dasar (kick/add/groupinfo/linkgc/
// openclose/tagall/delete). File ini tidak punya `handle`, jadi loader
// mengabaikannya sebagai plugin — sama seperti moderation/shared.js.

import { jidDecode, jidNormalizedUser } from '@whiskeysockets/baileys'
import { config, getTargetJid, jidNum, toJid } from '../../../../_runtime/core-shim.js'

export function resolveTarget(ctx) {
  const mentioned = getTargetJid(ctx.msg)
  if (mentioned) return mentioned

  const first = ctx.args[0]
  if (!first) return null

  const digits = String(first).replace(/\D/g, '')
  if (digits.length < 6) return null
  return toJid(first)
}

export function botJid(sock) {
  const raw = sock?.user?.id || ''
  if (!raw) return null
  try {
    return jidNormalizedUser(raw)
  } catch {
    return raw
  }
}

export function sameUser(a, b) {
  const ua = typeof a === 'string' ? jidDecode(a)?.user : null
  const ub = typeof b === 'string' ? jidDecode(b)?.user : null
  return !!ua && ua === ub
}

export function isRootOwner(jid) {
  const owner = toJid(config.ownerJid)
  return !!owner && sameUser(owner, jid)
}

export function participantJid(participant) {
  const raw = participant?.phoneNumber || participant?.id || participant?.lid
  if (!raw) return null
  try {
    return jidNormalizedUser(raw)
  } catch {
    return raw
  }
}

export function participantMentions(meta) {
  const seen = new Set()
  const out = []
  for (const participant of meta?.participants || []) {
    const jid = participantJid(participant)
    if (!jid || seen.has(jid)) continue
    seen.add(jid)
    out.push(jid)
  }
  return out
}

export function mentionList(jids) {
  return jids.map((jid) => `@${jidNum(jid)}`).join(' ')
}

export function formatDate(unixSeconds) {
  if (!unixSeconds) return '—'
  const date = new Date(Number(unixSeconds) * 1000)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export function adminCount(meta) {
  if (Array.isArray(meta?.admins)) return meta.admins.length
  return (meta?.participants || []).filter((p) => p.admin).length
}

export function ownerOf(meta) {
  if (!meta) return null
  if (meta.owner) return meta.owner
  const superadmin = (meta.participants || []).find(
    (p) => p.admin === 'superadmin' || p.superadmin === true
  )
  return superadmin ? participantJid(superadmin) : null
}
