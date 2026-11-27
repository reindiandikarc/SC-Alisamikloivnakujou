'use strict'
// Helper murni untuk .rvo: menemukan node media di peta quoted WhatsApp,
// menghidupkan kembali Buffer hasil serialisasi JSON, lalu mengunduh memakai
// downloadContentFromMessage (bukan alya.downloadMediaMessage, supaya tidak
// masuk lagi ke wrapper sentral / rekursi).
//
// Tidak ada state global, tidak ada kredensial, dan downloader bisa disuntik
// supaya bisa diuji offline (scripts/test-rvo-extract.js).

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'ptvMessage']
const WRAPPER_TYPES = [
  'viewOnceMessageV2', 'viewOnceMessageV2Extension', 'viewOnceMessage',
  'ephemeralMessage', 'documentWithCaptionMessage', 'editedMessage',
  'questionReplyMessage', 'futureProofMessage', 'questionMessage'
]

const DEFAULT_MIME = {
  imageMessage: 'image/jpeg',
  videoMessage: 'video/mp4',
  ptvMessage: 'video/mp4',
  audioMessage: 'audio/mp4',
  documentMessage: 'application/octet-stream'
}

/** Terima Buffer / Uint8Array / array / {type:'Buffer',data} / base64 -> Buffer. */
function ensureBuffer(val) {
  if (val == null) return null
  if (Buffer.isBuffer(val)) return val
  if (val instanceof Uint8Array) return Buffer.from(val.buffer, val.byteOffset, val.byteLength)
  if (Array.isArray(val)) return Buffer.from(val)
  if (typeof val === 'string') {
    try { return Buffer.from(val, 'base64') } catch (e) { return null }
  }
  if (typeof val === 'object' && val.data != null && /^(Buffer|Uint8Array|ArrayBuffer)$/.test(String(val.type || ''))) {
    if (val.data && typeof val.data === 'object' && !Array.isArray(val.data) && !Buffer.isBuffer(val.data) && !(val.data instanceof Uint8Array)) {
      const keys = Object.keys(val.data).sort((a, b) => Number(a) - Number(b))
      return Buffer.from(keys.map(k => val.data[k]))
    }
    return ensureBuffer(val.data)
  }
  return null
}

function asBuffer(val) {
  const buf = ensureBuffer(val)
  return buf && buf.length ? buf : null
}

/** Buka pembungkus view-once / ephemeral / document-with-caption. */
function unwrapMessage(msg) {
  let curr = msg
  for (let i = 0; i < 6 && curr && typeof curr === 'object'; i++) {
    let next = null
    for (const key of WRAPPER_TYPES) {
      if (curr[key]?.message) { next = curr[key].message; break }
    }
    if (!next) break
    curr = next
  }
  return curr
}

function mediaTypeFromMime(mime) {
  const m = String(mime || '').toLowerCase()
  if (m.startsWith('video/')) return 'videoMessage'
  if (m.startsWith('audio/')) return 'audioMessage'
  if (m.startsWith('image/')) return 'imageMessage'
  if (m && !m.startsWith('text/')) return 'documentMessage'
  return 'imageMessage'
}

function describe(mediaObj, mediaType) {
  if (!mediaObj || typeof mediaObj !== 'object') return null
  const type = mediaType === 'ptvMessage' ? 'videoMessage' : mediaType
  return {
    mediaObj,
    mediaType: type,
    mime: mediaObj.mimetype || mediaObj.mime || DEFAULT_MIME[mediaType] || '',
    caption: mediaObj.caption || '',
    ptt: mediaType === 'audioMessage' ? !!mediaObj.ptt : false,
    fileName: mediaObj.fileName || 'file.bin',
    isViewOnce: !!mediaObj.viewOnce
  }
}

// Objek m.quoted di smsg() bisa berupa node media pipih (bukan map
// {imageMessage: ...}), TAPI ada juga quote yang sudah punya mtype/type pipih
// sambil menyimpan media asli di `.message.imageMessage`. Karena itu mtype/type
// SAJA tidak cukup untuk menyebutnya node media — harus ada field media nyata.
// Kalau tidak, extractMedia akan berhenti di quote pipih yang kosong dan tidak
// pernah masuk ke .message (kasus yang ditemukan oracle Agent T).
function looksLikeMediaNode(obj) {
  if (!obj || typeof obj !== 'object') return false
  if (typeof obj.mimetype === 'string' && obj.mimetype) return true
  return ['mediaKey', 'fileEncSha256', 'fileSha256', 'directPath', 'jpegThumbnail']
    .some(k => obj[k] != null)
}

/**
 * Cari media pada: WAMessage, peta message, contextInfo, quoted map, atau node
 * media mentah. Mengembalikan null bila tidak ada media.
 */
function extractMedia(source, depth = 0, seen = new WeakSet()) {
  if (!source || typeof source !== 'object' || depth > 10 || seen.has(source)) return null
  if (Buffer.isBuffer(source) || source instanceof Uint8Array) return null
  seen.add(source)

  const unwrapped = unwrapMessage(source)
  if (unwrapped && unwrapped !== source) return extractMedia(unwrapped, depth + 1, seen)

  for (const type of MEDIA_TYPES) {
    if (source[type] && typeof source[type] === 'object') return describe(source[type], type)
  }
  if (looksLikeMediaNode(source)) {
    const type = MEDIA_TYPES.includes(source.mtype) ? source.mtype
      : MEDIA_TYPES.includes(source.type) ? source.type
        : mediaTypeFromMime(source.mimetype || source.mime)
    return describe(source, type)
  }

  const keys = ['message', 'msg', 'contextInfo', 'quotedMessage', 'quoted', 'fakeObj']
  for (const key of keys) {
    const found = extractMedia(source[key], depth + 1, seen)
    if (found) return found
  }
  for (const key of Object.keys(source)) {
    if (keys.includes(key) || key === 'mediaKey' || key === 'fileEncSha256' || key === 'fileSha256') continue
    const found = extractMedia(source[key], depth + 1, seen)
    if (found) return found
  }
  return null
}

function findContextInfo(source, depth = 0) {
  if (!source || typeof source !== 'object' || depth > 8) return null
  const ci = source.contextInfo
  if (ci && typeof ci === 'object' &&
      (ci.stanzaId || ci.quotedMessage || ci.questionReplyQuotedMessage || ci.participant)) {
    return ci
  }
  for (const key of [
    'message', 'msg', 'questionReplyMessage', 'viewOnceMessage', 'viewOnceMessageV2',
    'viewOnceMessageV2Extension', 'extendedTextMessage', 'quotedMessage', 'quoted'
  ]) {
    const found = findContextInfo(source[key], depth + 1)
    if (found) return found
  }
  return null
}

/**
 * Kumpulkan semua sumber media yang mungkin dari serialized message m.
 * Async karena m.getQuotedObj() mengembalikan Promise di smsg().
 * Tiap entri: { source: label, node, extract }.
 */
async function findMediaCandidates(m, { includeQuotedObj = true } = {}) {
  const out = []
  // Jangan satukan sumber yang kebetulan memakai node media yang sama:
  // label sumber dipakai untuk debug, dan caller yang memutuskan node mana
  // sudah dicoba (lihat attempted Set di plugin .rvo).
  const push = (node, source) => {
    if (!node || typeof node !== 'object') return
    const extract = extractMedia(node)
    if (!extract) return
    out.push({ source, node, extract })
  }

  const ci = findContextInfo(m)
  push(m?.quoted, 'quoted')
  push(m?.quoted?.fakeObj?.message, 'quoted.fakeObj.message')
  push(ci?.quotedMessage, 'contextInfo.quotedMessage')
  push(m?.message, 'm.message')
  push(m?.msg, 'm.msg')

  if (includeQuotedObj && typeof m?.getQuotedObj === 'function') {
    try {
      const quotedObj = await m.getQuotedObj()
      push(quotedObj, 'getQuotedObj()')
    } catch (e) { /* store bisa kosong; jangan gagalkan jalur lain */ }
  }
  return out
}

/** Salin node media dan kembalikan kunci/hash menjadi Buffer asli. */
function reviveMediaNode(mediaObj) {
  if (!mediaObj || typeof mediaObj !== 'object') return null
  const node = Object.assign({}, mediaObj)
  for (const key of ['mediaKey', 'fileSha256', 'fileEncSha256']) {
    if (node[key] != null) node[key] = ensureBuffer(node[key]) || node[key]
  }
  return node
}

function hasDownloadMaterial(mediaObj) {
  return !!(mediaObj && (asBuffer(mediaObj.mediaKey) || mediaObj.url || mediaObj.directPath))
}

async function readStream(stream) {
  if (!stream) return null
  const direct = asBuffer(stream)
  if (direct) return direct
  const chunks = []
  for await (const chunk of stream) {
    const buf = asBuffer(chunk)
    if (buf) chunks.push(buf)
  }
  const buffer = Buffer.concat(chunks)
  return buffer.length ? buffer : null
}

/**
 * Unduh langsung dari node media. `downloader` opsional (dipakai test);
 * tanpa itu memakai downloadContentFromMessage dari Baileys (lazy require).
 */
async function downloadFromMediaObj(mediaObj, mediaType, downloader, plainFetcher) {
  const node = reviveMediaNode(mediaObj)
  if (!hasDownloadMaterial(node)) return null
  const declared = String(mediaType || mediaTypeFromMime(node.mimetype || node.mime))
  const type = (declared === 'ptvMessage' ? 'videoMessage' : declared)
    .replace(/Message$/i, '').toLowerCase()
  if (!type) return null
  const dl = typeof downloader === 'function'
    ? downloader
    : require('@whiskeysockets/baileys').downloadContentFromMessage
  let buffer = null
  let failure = null
  try {
    buffer = await readStream(await dl(node, type))
  } catch (e) {
    failure = e
  }
  if (buffer) return buffer
  if (asBuffer(node.mediaKey)) {
    if (failure) throw failure
    return null
  }
  const { getUrlFromDirectPath } = require('@whiskeysockets/baileys')
  const url = node.url || (node.directPath ? getUrlFromDirectPath(node.directPath) : null)
  if (!url) {
    if (failure) throw failure
    return null
  }
  const fetchPlain = typeof plainFetcher === 'function' ? plainFetcher : async (target) => {
    const axios = require('axios')
    const res = await axios.get(target, { responseType: 'arraybuffer', timeout: 30000 })
    return Buffer.from(res.data)
  }
  return readStream(await fetchPlain(url))
}

/**
 * Jalur persis ALYA V20/V13 (`alya.downloadMediaMessage`):
 *   let msg = message.msg ? message.msg : message
 *   let messageType = message.mtype ? message.mtype.replace(/Message/gi,'') : mime.split('/')[0]
 *   downloadContentFromMessage(msg, messageType)
 * Dipakai sebagai fallback terakhir — kadang quote pipih punya mtype tetapi
 * extractor berbasis `.message` tidak melihat node media.
 */
async function downloadV20Style(quoted, downloader) {
  const msg = quoted?.msg ? quoted.msg : quoted
  if (!msg || typeof msg !== 'object') return null
  const mime = msg.mimetype || msg.mime || quoted?.mimetype || quoted?.mime || ''
  const type = quoted?.mtype || quoted?.type
    ? String(quoted.mtype || quoted.type).replace(/Message/gi, '')
    : String(mime).split('/')[0]
  if (!type) return null
  if (!msg.mediaKey && !msg.url && !msg.directPath && !msg.thumbnailDirectPath) return null
  const dl = typeof downloader === 'function'
    ? downloader
    : require('@whiskeysockets/baileys').downloadContentFromMessage

  // Jalur persis ryuuxalya/lib/Utils/messages.js:1866-1879:
  // bila hanya thumbnailDirectPath yang ada (url/directPath kosong), pakai
  // { directPath: thumbnailDirectPath, mediaKey } dengan mediaType
  // 'thumbnail-link'. Reinka tidak punya cabang ini, jadi kita tiru di sini.
  if (msg.thumbnailDirectPath && !msg.url && !msg.directPath) {
    const thumb = reviveMediaNode({
      directPath: msg.thumbnailDirectPath,
      mediaKey: msg.mediaKey || quoted?.mediaKey,
    })
    if (thumb?.mediaKey) return readStream(await dl(thumb, 'thumbnail-link'))
  }
  return readStream(await dl(reviveMediaNode(msg), type))
}

/** Varian JID untuk probing store/cache: LID -> PN, group/newsletter tetap. */
function candidateJids(...jids) {
  const out = []
  const pushOne = (jid) => {
    if (typeof jid !== 'string' || !jid) return
    out.push(jid)
    if (jid.endsWith('@lid')) out.push(jid.replace(/@lid$/, '@s.whatsapp.net'))
    if (jid.includes('@s.whatsapp.net:')) out.push(jid.split(':')[0])
  }
  for (const jid of jids) {
    if (Array.isArray(jid)) jid.forEach(pushOne)
    else pushOne(jid)
  }
  return [...new Set(out.filter(Boolean))]
}

module.exports = {
  MEDIA_TYPES,
  ensureBuffer,
  asBuffer,
  unwrapMessage,
  mediaTypeFromMime,
  extractMedia,
  findContextInfo,
  findMediaCandidates,
  reviveMediaNode,
  hasDownloadMaterial,
  downloadFromMediaObj,
  downloadV20Style,
  candidateJids
}
