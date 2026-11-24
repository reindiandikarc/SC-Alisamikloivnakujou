'use strict'

// Pemulihan media sekali lihat dari PESAN ASLI, bukan dari salinan quote.
//
// Metode ini di-port dari ALYA V13 (lib/antidelete.js registerListener):
// setiap WAMessage mentah disimpan keyed by stanzaId, lalu saat .rvo dipanggil
// pesan asli itu diunduh memakai downloader Baileys. Di sini ditambah dua hal
// yang tidak ada di V13:
//   1. unwrap wrapper questionReplyMessage / viewOnceMessageV2 (fork Baileys
//      mana pun tidak membongkar questionReplyMessage secara otomatis),
//   2. rehydrate Buffer hasil JSON.stringify (mediaKey/fileEncSha256).
//
// Modul ini murni & offline-testable: downloader disuntik oleh pemanggil.

const { ensureBuffer, findAnyMedia, inferMime } = require('./rvo-detect')
const { candidateJids: detectJids } = require('./rvo-extract')

const MAX_DEPTH = 12

/** Salin objek dan kembalikan field biner menjadi Buffer asli. */
function rehydrateBuffers(value, depth = 0, seen = new WeakMap()) {
  if (value == null || depth > MAX_DEPTH) return value
  if (Buffer.isBuffer(value)) return Buffer.from(value)
  if (value instanceof Uint8Array) return Buffer.from(value.buffer, value.byteOffset, value.byteLength)
  if (value instanceof ArrayBuffer) return Buffer.from(value)
  if (Array.isArray(value)) {
    if (seen.has(value)) return seen.get(value)
    const out = []
    seen.set(value, out)
    for (const v of value) out.push(rehydrateBuffers(v, depth + 1, seen))
    return out
  }
  if (typeof value !== 'object') return value

  const buf = ensureBuffer(value)
  if (buf) return buf
  if (seen.has(value)) return seen.get(value)
  const out = {}
  seen.set(value, out)
  for (const k of Object.keys(value)) out[k] = rehydrateBuffers(value[k], depth + 1, seen)
  return out
}

/** Clone node media tanpa flag viewOnce — Baileys menolak node bertanda viewOnce. */
function plainMediaNode(node, type) {
  const clone = rehydrateBuffers(node)
  if (!clone || typeof clone !== 'object' || Array.isArray(clone)) return null
  delete clone.viewOnce
  delete clone.isViewOnce
  clone.mtype = clone.mtype || type
  return clone
}

function candidateJids(...args) {
  return detectJids(...args.filter(Boolean))
}

function messageFromEntry(entry, fallbackJid) {
  if (!entry || typeof entry !== 'object') return null
  if (Array.isArray(entry)) return entry.length ? entry[0] : null
  return entry.message || entry.msg || (entry.key && entry.message ? entry : null) || null
}

function entryJid(entry, fallback) {
  return entry?.jid || entry?.key?.remoteJid || entry?.chat || fallback || ''
}

async function collectSources({ id, chat, jids, rawBackup, store, mediaCache, quoted }) {
  const sources = []
  const push = (source, entry, fallbackJid = chat) => {
    const message = messageFromEntry(entry, fallbackJid)
    if (!message) return
    sources.push({ source, message, jid: entryJid(entry, fallbackJid) })
  }

  // 1. Backup WAMessage mentah (V13 antidelete), kunci = stanzaId persis.
  if (id && rawBackup) {
    const direct = typeof rawBackup.get === 'function' ? rawBackup.get(id) : rawBackup[id]
    if (direct) push('rawBackup', direct)
  }

  // 2. Store in-memory Baileys: coba LID dan PN.
  if (id && store && typeof store.loadMessage === 'function') {
    for (const jid of jids) {
      try {
        const raw = await store.loadMessage(jid, id)
        if (raw) { push('store', raw, jid); break }
      } catch (_) { /* lanjut ke varian JID berikutnya */ }
    }
  }

  // 3. Cache pesan bermedia persisten dari index.js.
  if (id && mediaCache) {
    const cached = typeof mediaCache.get === 'function' ? mediaCache.get(id) : mediaCache[id]
    if (cached) push('mediaCache', cached)
  }

  // 4. Kalau quote-nya sendiri adalah serialized pesan lengkap (kasus log
  //    terbaru: quoted.keys=key,category,...,message,msg), pakai pesan aslinya.
  const quotedMessage = quoted?.message || quoted?.msg?.message || quoted?.msg
  if (quotedMessage && quotedMessage !== quoted) {
    sources.push({ source: 'quoted.message', message: quotedMessage, jid: quoted?.chat || quoted?.key?.remoteJid || chat })
  }

  return sources
}

/**
 * Coba pulihkan media dari sumber asli. Mengembalikan null bila tidak ada
 * salinan yang masih punya mediaKey/url/directPath.
 */
async function recoverViewOnce({
  id,
  chat = '',
  jids = [],
  quoted = null,
  rawBackup = null,
  store = null,
  mediaCache = null,
  nativeDownload = null,
  contentDownload = null,
} = {}) {
  if (!id) return null
  const allJids = candidateJids(chat, ...jids, quoted?.chat, quoted?.key?.remoteJid)
  if (!allJids.length) allJids.push(chat)

  const quotedCaption = quoted?.caption || quoted?.text || ''
  const quotedMime = quoted?.mimetype || quoted?.mime || ''
  const sources = await collectSources({ id, chat, jids: allJids, rawBackup, store, mediaCache, quoted })

  for (const src of sources) {
    const message = src.message
    const container = message?.message || message
    const found = findAnyMedia(container) || findAnyMedia(message)
    if (!found?.content) continue
    const node = plainMediaNode(found.content, found.type)
    if (!node) continue
    const hasMaterial = !!(node.mediaKey || node.url || node.directPath || node.thumbnailDirectPath)
    if (!hasMaterial) continue

    const remoteJid = src.jid || allJids[0] || chat
    const rawKey = message?.key || {}
    const raw = {
      key: { id, remoteJid: remoteJid || rawKey.remoteJid || chat, participant: rawKey.participant },
      message: { [found.type]: node },
    }

    if (typeof nativeDownload === 'function') {
      try {
        const buffer = await nativeDownload(raw, 'buffer', {})
        if (buffer?.length) {
          return {
            buffer,
            mediaType: found.type,
            mime: node.mimetype || quotedMime || inferMime(found.type),
            caption: node.caption || quotedCaption,
            ptt: !!node.ptt,
            fileName: node.fileName || 'file.bin',
            source: src.source,
          }
        }
      } catch (_) { /* coba downloader berikutnya */ }
    }

    if (typeof contentDownload === 'function') {
      try {
        const stream = await contentDownload(node, found.type.replace(/Message$/i, '').toLowerCase())
        const chunks = []
        for await (const chunk of stream) chunks.push(Buffer.from(chunk))
        const buffer = Buffer.concat(chunks)
        if (buffer.length) {
          return {
            buffer,
            mediaType: found.type,
            mime: node.mimetype || quotedMime || inferMime(found.type),
            caption: node.caption || quotedCaption,
            ptt: !!node.ptt,
            fileName: node.fileName || 'file.bin',
            source: src.source,
          }
        }
      } catch (_) { /* lanjut ke sumber berikutnya */ }
    }
  }
  return null
}

/**
 * Baca raw-backup.json yang ditulis sebagai `[...map]` (array pasangan).
 * BUG lama: dibaca pakai Object.entries(array) sehingga key-nya jadi "0","1",
 * bukan stanzaId — semua lookup by id meleset. Terima dua-duanya: array
 * pasangan ATAU objek { id: entry }.
 */
function loadRawBackup(parsed) {
  const out = new Map()
  if (!parsed) return out
  const pairs = Array.isArray(parsed) ? parsed : Object.entries(parsed)
  for (const pair of pairs) {
    if (!Array.isArray(pair) || pair.length < 2) continue
    const [id, entry] = pair
    if (id != null && entry && typeof entry === 'object') out.set(String(id), entry)
  }
  return out
}

module.exports = { rehydrateBuffers, plainMediaNode, collectSources, loadRawBackup, recoverViewOnce }
