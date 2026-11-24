'use strict'
// Placeholder view-once = pesan 1x yang datang TANPA `message` sama sekali.
//
// Fakta dari Baileys (node_modules/@whiskeysockets/baileys/src):
//   Utils/decode-wa-message.js:234-236 -> `<unavailable type="view_once">`
//     menandai `fullMessage.key.isViewOnce = true`.
//   Socket/messages-recv.js:1296-1301 -> auto-resend bawaan hanya jalan kalau
//     stub CIPHERTEXT DAN category !== 'peer' (PM), jadi PM 1x terlewat.
//   Socket/messages-recv.js -> patch ALYA_V13_EARLY_RVO_PATCH menangani
//     `<unavailable>` lebih awal (seperti ryuuxalya) dengan messageKey lengkap.
//   Socket/messages-recv.js:55-88 -> `requestPlaceholderResend(messageKey, msgData)`.
//     Hasil media kembali lewat `messages.upsert` (Utils/process-message.js),
//     bukan lewat `messages.update`. Modul ini dipakai sebagai fallback manual
//     jika jalur socket tidak aktif.
//
// Modul ini murni (tanpa socket) supaya bisa diuji offline.

const RESEND_TTL_MS = 30 * 1000

function isViewOncePlaceholder(msg) {
  if (!msg || typeof msg !== 'object') return false
  if (!msg.key?.id || msg.message) return false
  if (msg.key.fromMe) return false
  return msg.key.isViewOnce === true
}

function buildResendArgs(msg) {
  const k = msg.key || {}
  // v13/ryuuxalya menormalkan chat pribadi LID -> PN sebelum membangun
  // messageKey untuk PDO. Patch Baileys kita melakukan itu di decode; ini
  // fallback kalau stanza tidak membawa `sender_pn` tapi `remoteJidAlt` PN.
  const isLid = jid => /@lid$/i.test(String(jid || ''))
  const isPn = jid => /@s\.whatsapp\.net$/i.test(String(jid || ''))
  let remoteJid = k.remoteJid
  if (isLid(remoteJid)) {
    if (isPn(k.senderPn)) remoteJid = k.senderPn
    else if (isPn(k.remoteJidAlt)) remoteJid = k.remoteJidAlt
    else if (isPn(k.participantAlt)) remoteJid = k.participantAlt
  }
  // ryuuxalya mengirim messageKey LENGKAP hasil decodeMessageNode ke PDO.
  // Jangan buang senderPn/senderLid/participantLid — server butuh itu untuk
  // mencari pesan 1x pada chat LID.
  const key = { ...k, remoteJid }
  return {
    key,
    msgData: {
      key,
      messageTimestamp: msg.messageTimestamp,
      pushName: msg.pushName,
      participant: msg.participant,
      verifiedBizName: msg.verifiedBizName,
    },
  }
}

function trackPending(store, msg, now = Date.now(), ttl = RESEND_TTL_MS) {
  if (!isViewOncePlaceholder(msg)) return { tracked: false, request: false }
  const map = store instanceof Map ? store : null
  if (!map) return { tracked: false, request: false }

  const id = msg.key.id
  const prev = map.get(id)
  if (prev && now - (prev.ts || 0) < ttl) {
    return { tracked: true, request: false, pending: prev }
  }

  const { key, msgData } = buildResendArgs(msg)
  const pending = {
    id,
    key,
    msgData,
    chat: msg.key.remoteJid || '',
    sender: msg.key.participant || msg.key.remoteJid || '',
    ts: now,
  }
  map.set(id, pending)
  return { tracked: true, request: true, pending }
}

// messages.update hanya membawa requestId, bukan media. Dicatat supaya
// diagnostik .rvo bisa menjelaskan "resend sedang berjalan".
function recordRequestId(store, updates) {
  let changed = 0
  for (const item of updates || []) {
    const p = item?.update?.messageStubParameters
    if (!Array.isArray(p)) continue
    const requestId = p.slice(1).find(v => typeof v === 'string' && v.trim())
    if (!requestId) continue
    const isAbsent = p.some(v => typeof v === 'string' && /absent|NO_MESSAGE_FOUND/i.test(v))
    if (!isAbsent) continue
    const id = item?.key?.id
    if (!id || !(store instanceof Map)) continue
    const pending = store.get(id)
    if (pending && pending.requestId !== requestId) {
      pending.requestId = requestId
      changed++
    }
  }
  return changed
}

function describe(msg) {
  return `id=${msg?.key?.id || '-'} fromMe=${!!msg?.key?.fromMe} ` +
    `stub=${msg?.messageStubType ?? 'none'} isViewOnce=${!!msg?.key?.isViewOnce} ` +
    `params=${JSON.stringify(msg?.messageStubParameters || [])}`
}

module.exports = {
  RESEND_TTL_MS,
  isViewOncePlaceholder,
  buildResendArgs,
  trackPending,
  recordRequestId,
  describe,
}
