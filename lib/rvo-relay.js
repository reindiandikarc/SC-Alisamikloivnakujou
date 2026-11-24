'use strict'

const WRAPPERS = [
  'ephemeralMessage',
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension',
  'documentWithCaptionMessage',
]
const MEDIA_KEY = /^(image|video|audio|document|sticker)Message$/
// Helper lokal dari smsg()/myfunc.js: bukan bagian dari node proto, dan
// `fakeObj.message` bisa menunjuk balik ke pesan induknya (siklus).
const RELAY_HELPER_KEYS = new Set([
  'fakeObj', 'isViewOnce', 'isMedia', 'isBaileys', 'mtype', 'type',
  'id', 'chat', 'sender', 'fromMe', 'mentionedJid', 'text', 'mime',
  'delete', 'copyNForward', 'download', 'getQuotedObj', 'getQuotedMessage',
])

function unwrap(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6) return value
  for (const w of WRAPPERS) {
    const inner = value[w]?.message || value[w]
    if (inner && typeof inner === 'object' && Object.keys(inner).some(k => MEDIA_KEY.test(k))) {
      return unwrap(inner, depth + 1)
    }
  }
  return value
}

// Salin objek polos supaya `delete viewOnce` tidak merusak cache/_rawBackup.
// `seen` memetakan siklus ke salinan yang sudah dibuat (fakeObj -> message ->
// node media -> fakeObj), dan skipKeys membuang helper lokal dari relay.
function copyPlain(value, seen = new WeakMap(), skipKeys = null) {
  if (!value || typeof value !== 'object') return value
  if (Buffer.isBuffer(value) || value instanceof Uint8Array || ArrayBuffer.isView(value)) return value
  if (seen.has(value)) return seen.get(value)
  if (Array.isArray(value)) {
    const out = []
    seen.set(value, out)
    for (const item of value) out.push(copyPlain(item, seen, skipKeys))
    return out
  }
  const out = {}
  seen.set(value, out)
  for (const [k, v] of Object.entries(value)) {
    if (skipKeys?.has(k) || typeof v === 'function') continue
    out[k] = copyPlain(v, seen, skipKeys)
  }
  return out
}

function relayContentFromQuoted(raw) {
  const msg = unwrap(raw)
  if (!msg || typeof msg !== 'object') return null
  const type = Object.keys(msg).find(k => MEDIA_KEY.test(k))
  const src = msg[type]
  if (!type || !src || typeof src !== 'object') return null

  const node = copyPlain(src, new WeakMap(), RELAY_HELPER_KEYS)
  const hadViewOnce = node.viewOnce === true
  delete node.viewOnce
  const material = !!(node.mediaKey || node.directPath || node.url || node.thumbnailDirectPath)

  return {
    content: { [type]: node },
    mediaType: type.replace(/Message$/, ''),
    hadViewOnce,
    material,
  }
}

module.exports = { relayContentFromQuoted, unwrap, copyPlain }
