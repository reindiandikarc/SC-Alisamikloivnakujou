'use strict'
// Utilitas bersama untuk media WhatsApp "sekali lihat" (view-once).
//
// Masalahnya: pada pesan yang di-reply, WhatsApp mengirim salinan
// `contextInfo.quotedMessage` yang sudah WITHOUT mediaKey/url/directPath.
// Jadi `downloadContentFromMessage` pada salinan itu selalu gagal. Satu-satunya
// objek yang masih bisa didownload adalah pesan ASLI di store Baileys, atau
// salinan persisten di database/media-cache.json (index.js).
//
// Helper ini dipakai oleh downloader sentral di index.js sehingga semua command
// yang membaca media via reply (.rvo, .swgc, .tovid, dan lain-lain) memakai
// satu jalur yang sama.

const { proto, getContentType } = require('@whiskeysockets/baileys')

const VIEW_ONCE_TYPES = new Set([
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension'
])

function typeOf(obj) {
  if (!obj || typeof obj !== 'object') return null
  try { return getContentType(obj) || null } catch (e) { return null }
}

/**
 * Buka pembungkus viewOnceMessage/V2/V2Extension sampai ke node media asli.
 * Menerima WAMessage ({ key, message }), map message, atau node media itu sendiri.
 */
function unwrapViewOnce(message) {
  let root = message
  if (root && typeof root === 'object' && root.message && !VIEW_ONCE_TYPES.has(typeOf(root))) {
    root = root.message
  }
  let type = typeOf(root)
  let node = type ? root?.[type] : root
  let depth = 0

  while (VIEW_ONCE_TYPES.has(type) && node?.message && depth < 5) {
    root = node.message
    type = typeOf(root)
    node = type ? root?.[type] : root
    depth++
  }

  // Node media mentah (m.quoted dari smsg) tidak punya key "*Message", jadi
  // getContentType() mengembalikan null. Ambil dari mtype/mimetype bila perlu.
  if (!type && node && typeof node === 'object') {
    type = node.mtype || (node.mimetype ? String(node.mimetype).split('/')[0] + 'Message' : null)
  }

  return { root, type, node, isViewOnce: depth > 0 }
}

function toWaMessage(raw, protoImpl) {
  if (!raw?.message) return raw
  try {
    return protoImpl?.WebMessageInfo?.fromObject ? protoImpl.WebMessageInfo.fromObject(raw) : raw
  } catch (e) {
    return raw
  }
}

function candidateJids(message, extra = []) {
  const out = []
  const push = (jid) => {
    if (typeof jid !== 'string' || !jid) return
    out.push(jid)
    // @lid dipakai WhatsApp untuk identitas privat; store/cache menyimpan
    // pesan memakai JID nomor (@s.whatsapp.net). Coba keduanya.
    if (jid.endsWith('@lid')) out.push(jid.replace(/@lid$/, '@s.whatsapp.net'))
  }
  push(message?.key?.remoteJid)
  push(message?.chat)
  push(message?.jid)
  for (const jid of extra) push(jid)
  return [...new Set(out)]
}

async function tryNative(raw, native) {
  if (!native || !raw) return null
  try {
    const buf = await native(raw, 'buffer')
    return buf && buf.length ? buf : null
  } catch (e) {
    return null
  }
}

/**
 * Buat fungsi download(message) -> Buffer.
 * Urutan: download() milik objek -> native pada objek asli -> store -> cache.
 */
function createDownloader({ store, cache, bufferCache, native, protoImpl = proto } = {}) {
  return async function download(message) {
    if (!message || typeof message !== 'object') return Buffer.alloc(0)

    const id = message?.key?.id || message?.id || message?.stanzaId

    // 0) Buffer yang sudah diunduh saat pesan view-once tiba (pola vanXone).
    //    Paling diandalkan: tidak bergantung pada mediaKey/url yang bisa
    //    dibuang WhatsApp dari quote atau kedaluwarsa setelah dilihat.
    if (id && typeof bufferCache?.get === 'function') {
      try {
        const buffered = await bufferCache.get(id)
        if (buffered && buffered.length) return buffered
      } catch (e) { /* lanjut ke jalur lain */ }
    }

    // 1) smsg sudah memasang m.quoted.download() yang tahu cara cari store/cache.
    if (typeof message.download === 'function') {
      try {
        const buf = await message.download()
        if (buf && buf.length) return buf
      } catch (e) { /* lanjut ke jalur lain */ }
    }

    const { node, type } = unwrapViewOnce(message)
    const media = node || {}

    // 2) Objek masih punya kunci asli -> download langsung.
    if (media.mediaKey || media.url || media.directPath) {
      const raw = message?.key
        ? message
        : { key: { id: message.id, remoteJid: message.chat }, message: { [type || 'imageMessage']: media } }
      const buf = await tryNative(toWaMessage(raw, protoImpl), native)
      if (buf) return buf
    }

    // 3) Quote sekali lihat: mediaKey sudah dibuang. Ambil pesan aslinya.
    if (id) {
      for (const jid of candidateJids(message, [media.chat])) {
        let raw = null
        try {
          raw = typeof store?.loadMessage === 'function'
            ? await store.loadMessage(jid, id)
            : null
        } catch (e) { raw = null }
        const buf = await tryNative(toWaMessage(raw, protoImpl), native)
        if (buf) return buf
      }

      const cached = cache?.[id]
      if (cached?.message) {
        const jid = cached.jid || candidateJids(message)[0]
        const raw = { key: { id, remoteJid: jid }, message: cached.message }
        const buf = await tryNative(toWaMessage(raw, protoImpl), native)
        if (buf) return buf
      }
    }

    return Buffer.alloc(0)
  }
}

module.exports = { VIEW_ONCE_TYPES, unwrapViewOnce, createDownloader, candidateJids }
