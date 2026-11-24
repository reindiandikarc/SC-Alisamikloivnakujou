'use strict'

// ── RVO detection / normalization (pure, offline-testable) ─────────────────
// Dipakai oleh index.js (messages.upsert) dan lib/myfunc.js (serializer quote).
// TIDAK boleh require Alya / baileys / store: modul ini harus bisa dijalankan
// di Node polos oleh scripts/test-rvo-detect.js.

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'audioMessage']

// `questionReplyMessage` adalah FutureProofMessage (WAProto: .message), jadi
// merupakan wrapper yang sama dengan viewOnceMessageV2. Jangan sample daftar
// ini hanya ke wrapper view-once: ephemeral / documentWithCaption /
// questionReply sering membungkus media sekali lihat di WhatsApp.
// Daftar lengkap di-port dari `getFutureProofMessage()` di ryuuxalya
// (ALYA V13 lib/Utils/messages.js:1694-1717). Reinka baileys hanya punya 9
// dari 31 wrapper ini — sisanya TIDAK dibongkar oleh extractMessageContent,
// sehingga mtype/migrate media 1x bisa salah terbaca. Kita bongkar sendiri.
// `questionReplyMessage` ditambahkan di sini (ada di WAProto kedua fork, tapi
// tidak masuk daftar ryuu maupun reinka).
const WRAPPERS = [
    'viewOnceMessage',
    'viewOnceMessageV2',
    'viewOnceMessageV2Extension',
    'viewOnceMessageV1',
    'futureProofMessage',
    'questionReplyMessage',
    'ephemeralMessage',
    'documentWithCaptionMessage',
    'editedMessage',
    // ── sisanya dari ryuuxalya ──
    'groupMentionedMessage',
    'botInvokeMessage',
    'lottieStickerMessage',
    'eventCoverImage',
    'statusMentionMessage',
    'pollCreationOptionImageMessage',
    'associatedChildMessage',
    'groupStatusMentionMessage',
    'pollCreationMessageV4',
    'pollCreationMessageV5',
    'statusAddYours',
    'groupStatusMessage',
    'limitSharingMessage',
    'botTaskMessage',
    'questionMessage',
    'groupStatusMessageV2',
    'botForwardedMessage',
]

// Envelope yang menyiratkan view-once. `ephemeralMessage` dan
// `documentWithCaptionMessage` hanya dibuka (WRAPPERS), tetapi tidak
// otomatis berarti view-once — flag harus tetap ada di dalamnya.
const VO_WRAPPERS = new Set([
    'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension',
    'viewOnceMessageV1', 'futureProofMessage', 'questionReplyMessage',
])

const SKIP_KEYS = new Set(['contextInfo', 'messageContextInfo'])
const SENSITIVE_KEY = /key|hash|token|secret|credential|signature|device/i
const MAX_DEPTH = 10

const defaultLog = (line) => {
    if (process.env.ALYA_BUTTON_DEBUG === '1' && typeof console !== 'undefined' && console.log) {
        console.log(line)
    }
}

// Baileys butuh Uint8Array/Buffer untuk dekripsi. Pesan yang lewat JSON/DB
// punya mediaKey berbentuk {type:'Buffer',data:[...]} atau {type:'Buffer',
// data:{0:..,1:..}} — downloadContentFromMessage menolak bentuk itu.
const ensureBuffer = (v) => {
    if (v == null) return null
    if (Buffer.isBuffer(v)) return v
    if (v instanceof Uint8Array) return Buffer.from(v.buffer, v.byteOffset, v.byteLength)
    if (v instanceof ArrayBuffer) return Buffer.from(v)
    if (Array.isArray(v)) return Buffer.from(v)
    if (typeof v === 'string') { try { return Buffer.from(v, 'base64') } catch { return null } }
    if (typeof v === 'object' && v.data != null && /^(Buffer|Uint8Array|ArrayBuffer)$/.test(String(v.type || ''))) {
        if (typeof v.data === 'object' && !Array.isArray(v.data)) {
            const keys = Object.keys(v.data).sort((a, b) => Number(a) - Number(b))
            return Buffer.from(keys.map(k => v.data[k]))
        }
        return ensureBuffer(v.data)
    }
    return null
}

const isBinaryLike = (v) => !!(
    Buffer.isBuffer(v) || v instanceof Uint8Array || v instanceof ArrayBuffer ||
    ArrayBuffer.isView(v) ||
    (v && typeof v === 'object' && v.data != null &&
        /^(Buffer|Uint8Array|ArrayBuffer)$/.test(String(v.type || '')))
)

const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && !isBinaryLike(v)

// Deteksi string persis ALYA V20/V13 (alya.js:553):
//   const isQuotedViewOnce = type === 'extendedTextMessage' &&
//                            content.includes('viewOnceMessageV2')
// Dipakai HANYA sebagai fallback bila scan struktural tidak menemukan wrapper.
const contentHasViewOnce = (raw) => {
  try { return /viewOnceMessageV2/i.test(JSON.stringify(raw)) } catch (_) { return false }
}

const inferMime = (type) => {
    if (/video/i.test(type)) return 'video/mp4'
    if (/audio/i.test(type)) return 'audio/ogg; codecs=opus'
    return 'image/jpeg'
}

// Baca flag view-once yang diletakkan di luar node media. WhatsApp sering
// membuang `viewOnce` dari media di contextInfo.quotedMessage dan hanya
// menyisakan `quotedType` / `messageContextInfo` / `isViewOnce`.
const contextViewOnce = (obj) => {
    if (!isObject(obj)) return false
    for (const key of ['messageContextInfo', 'contextInfo']) {
        const ctx = obj[key]
        if (!isObject(ctx)) continue
        if (ctx.viewOnce === true || ctx.isViewOnce === true) return true
        if (ctx.quotedType && /viewonce/i.test(String(ctx.quotedType))) return true
        if (ctx.quotedType && /^viewonce/i.test(String(ctx.messageType || ''))) return true
    }
    return false
}

const hasViewOnceSignal = (obj, depth = 0) => {
    if (!isObject(obj) || depth > MAX_DEPTH) return false
    if (obj.viewOnce === true || obj.isViewOnce === true) return true
    if (contextViewOnce(obj)) return true
    for (const k of Object.keys(obj)) {
        // Boolean flag keys must carry a TRUE value — a plain image has
        // `viewOnce: false` and must not be reported as view-once.
        if (/^(viewOnce|isViewOnce)$/i.test(k)) {
            if (obj[k] === true) return true
            continue
        }
        if (/viewonce/i.test(k)) return true
        if (/^quotedtype$/i.test(k) && /viewonce/i.test(String(obj[k] || ''))) return true
        if (SKIP_KEYS.has(k)) continue
        const v = obj[k]
        if (isObject(v) && hasViewOnceSignal(v, depth + 1)) return true
    }
    return false
}

// Log only KEY NAMES of an unfamiliar envelope — never values. mediaKey,
// hashes and any credential-ish key are filtered out explicitly.
const logUnknownWrapper = (node, log) => {
    for (const k of Object.keys(node)) {
        if (SKIP_KEYS.has(k) || WRAPPERS.includes(k) || MEDIA_TYPES.includes(k)) continue
        const v = node[k]
        if (!isObject(v) || !isObject(v.message)) continue
        const nested = Object.keys(v.message)
            .filter(key => !SENSITIVE_KEY.test(key))
            .slice(0, 14)
        log(`[RVO detect] unknown wrapper '${k}' nested keys=[${nested.join(',')}]`)
    }
}

const findMedia = (node, opts, inheritedVO, depth) => {
    if (!isObject(node) || depth > MAX_DEPTH) return null
    const requireVO = opts.requireVO !== false
    const log = typeof opts.log === 'function' ? opts.log : defaultLog
    const ctxVO = inheritedVO || contextViewOnce(node)

    for (const type of MEDIA_TYPES) {
        const content = node[type]
        if (!isObject(content)) continue
        const selfVO = content.viewOnce === true || content.isViewOnce === true ||
            hasViewOnceSignal(content) || contextViewOnce(content)
        const viewOnce = !!(ctxVO || selfVO)
        if (!requireVO || viewOnce) return { type, content, viewOnce }
    }

    if (requireVO) logUnknownWrapper(node, log)

    for (const k of Object.keys(node)) {
        if (SKIP_KEYS.has(k)) continue
        const v = node[k]
        if (!isObject(v)) continue
        // Any *viewonce* key on the path flags the subtree; envelope keys
        // (including unknown ones) inherit the current flag so a future
        // wrapper cannot silently lose it.
        const keyVO = /viewonce/i.test(k) || VO_WRAPPERS.has(k)
        const envelopeVO = isObject(v.message) && hasViewOnceSignal(v)
        const r = findMedia(v, opts, ctxVO || keyVO || envelopeVO, depth + 1)
        if (r) return r
    }
    return null
}

// Scan for an image/video/audio node that is marked view-once somewhere along
// its path (wrapper key, media flag, quotedType or messageContextInfo).
const scanForViewOnceMedia = (raw, opts = {}) => findMedia(raw, { ...opts, requireVO: true }, false, 0)

// Same walk without the view-once requirement: used by the caller to cache
// plain-media metadata as a fallback (entry.vo = false).
const findAnyMedia = (raw, opts = {}) => findMedia(raw, { ...opts, requireVO: false }, false, 0)

const unwrapEnvelopes = (raw) => {
    let node = raw
    for (let i = 0; i < 6 && isObject(node); i++) {
        let next = null
        for (const w of WRAPPERS) {
            if (isObject(node[w])) { next = node[w].message || node[w]; break }
        }
        if (!next || next === node) break
        node = next
    }
    return node
}

// Simpan metadata DULU (sebelum download), persis seperti contract lama.
const cacheRvoMedia = ({
    detected,
    id,
    chat,
    sender,
    cache,
    cacheMeta,
    limit = 300,
    now = Date.now(),
}) => {
    if (!detected || !isObject(detected.content) || !id) return null
    const content = detected.content
    if (content.mediaKey != null) content.mediaKey = ensureBuffer(content.mediaKey) || content.mediaKey
    if (content.fileEncSha256 != null) {
        content.fileEncSha256 = ensureBuffer(content.fileEncSha256) || content.fileEncSha256
    }
    const target = cache || global._rvoCache || (global._rvoCache = new Map())
    const meta = cacheMeta || global._rvoCacheMeta || (global._rvoCacheMeta = new Map())
    const entry = {
        type: detected.type,
        content,
        buffer: null,
        mimetype: content.mimetype || inferMime(detected.type),
        caption: content.caption || '',
        ptt: content.ptt || false,
        chat: chat || '',
        sender: sender || 'unknown',
        cachedAt: now,
        vo: detected.viewOnce === true,
    }
    target.set(id, entry)
    meta.set(id, {
        sender: entry.sender,
        time: new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })
    const cap = Number.isFinite(limit) ? limit : 300
    while (target.size > cap) {
        const oldest = target.keys().next().value
        target.delete(oldest)
        meta.delete(oldest)
    }
    return entry
}

module.exports = {
    WRAPPERS,
    VO_WRAPPERS,
    MEDIA_TYPES,
    ensureBuffer,
    hasViewOnceSignal,
    unwrapEnvelopes,
    scanForViewOnceMedia,
    findAnyMedia,
    contentHasViewOnce,
    cacheRvoMedia,
    inferMime,
}
