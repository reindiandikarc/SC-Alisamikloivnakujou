'use strict'

// Offline regression test for the RVO detector used by index.js and lib/myfunc.js.
// Run: node scripts/test-rvo-detect.js
const assert = require('assert')

const {
    WRAPPERS,
    ensureBuffer,
    scanForViewOnceMedia,
    findAnyMedia,
    cacheRvoMedia,
    hasViewOnceSignal,
    contentHasViewOnce,
} = require('../lib/rvo-detect')

const STANZA = 'ACFAD412828D2080BFCA653049CF8F78'
const CHAT = '120363399123456789@g.us'
const SENDER = '6281234567890@s.whatsapp.net'

const mkMediaKey = (seed) => Buffer.from(Array.from({ length: 32 }, (_, i) => (seed + i) & 0xff))
const KEY_A = mkMediaKey(1)
const KEY_B = mkMediaKey(7)

// Real JSON-shaped Buffer after a Baileys message has gone through the store.
const jsonBuffer = (buf) => ({ type: 'Buffer', data: Array.from(buf) })

const imageNode = (key = KEY_A, extra = {}) => ({
    mimetype: '', // WhatsApp strips mimetype from view-once quotes
    mediaKey: jsonBuffer(key),
    fileEncSha256: jsonBuffer(mkMediaKey(31)),
    directPath: '/v/t428412725/u100/xml/media/image',
    url: 'https://mmg.whatsapp.net/v/t42.8412725/u100/xml/media/image?ccb=9-4',
    fileLength: '2048',
    width: 640,
    height: 480,
    caption: '.rvo',
    viewOnce: true,
    ...extra,
})

const cases = {
    // (a) the shape from the live log: questionReplyMessage hides the media.
    'questionReplyMessage > viewOnceMessageV2 > imageMessage': {
        message: {
            questionReplyMessage: {
                message: {
                    viewOnceMessageV2: { message: { imageMessage: imageNode() } },
                },
            },
        },
    },
    // (a2) questionReplyMessage carrying the flag on the media itself.
    'questionReplyMessage > imageMessage(viewOnce)': {
        message: {
            questionReplyMessage: { message: { imageMessage: imageNode(KEY_B) } },
        },
    },
    // (a3) flag carried outside the media node (messageContextInfo.quotedType),
    //      matching the "only in contextInfo" hypothesis from the runtime log.
    'questionReplyMessage + messageContextInfo.quotedType': {
        message: {
            messageContextInfo: { quotedType: 'viewOnceMessageV2' },
            questionReplyMessage: {
                message: { imageMessage: imageNode(KEY_B, { viewOnce: undefined }) },
            },
        },
    },
    // (b)
    'viewOnceMessageV2Extension > videoMessage': {
        message: {
            viewOnceMessageV2Extension: {
                message: {
                    videoMessage: {
                        ...imageNode(KEY_A),
                        mimetype: 'video/mp4',
                        seconds: '12',
                    },
                },
            },
        },
    },
    // (c)
    'ephemeralMessage > imageMessage(viewOnce)': {
        message: {
            ephemeralMessage: { message: { imageMessage: imageNode(KEY_A) } },
        },
    },
    'ephemeralMessage > viewOnceMessageV2 > imageMessage': {
        message: {
            ephemeralMessage: {
                message: { viewOnceMessageV2: { message: { imageMessage: imageNode(KEY_A) } } },
            },
        },
    },
    // forwardedNewsletterMessageInfo-bearing quote must not hide the media
    'forwardedNewsletterMessageInfo sibling': {
        message: {
            forwardedNewsletterMessageInfo: { newsletterJid: '123456789@newsletter' },
            questionReplyMessage: {
                message: {
                    viewOnceMessageV2Extension: { message: { imageMessage: imageNode(KEY_A) } },
                },
            },
        },
    },
}

let passed = 0
const check = (name, fn) => {
    try {
        fn()
        passed++
        console.log('  ok  ' + name)
    } catch (e) {
        console.error('  NOT OK  ' + name + '\n    ' + (e && e.message ? e.message : e))
        throw e
    }
}

console.log('rvo-detect: wrappers = ' + WRAPPERS.join(','))

console.log('\n[1] scanForViewOnceMedia() detects every real view-once envelope')
for (const [name, raw] of Object.entries(cases)) {
    check(name, () => {
        const found = scanForViewOnceMedia(raw.message)
        assert.ok(found, 'expected a view-once media hit, got null')
        assert.ok(/^(imageMessage|videoMessage|audioMessage)$/.test(found.type), 'bad type: ' + found.type)
        assert.strictEqual(found.viewOnce, true)
        assert.ok(found.content && typeof found.content === 'object', 'missing content')
        assert.ok(ensureBuffer(found.content.mediaKey)?.length === 32, 'mediaKey not revived')
    })
}

console.log('\n[2] ensureBuffer() revives plain JSON Buffer objects')
check('revives {type:"Buffer",data:[...]}', () => {
    assert.strictEqual(ensureBuffer(jsonBuffer(KEY_A)).toString('hex'), KEY_A.toString('hex'))
})
check('revives {type:"Buffer",data:{0:..,1:..}}', () => {
    const obj = { type: 'Buffer', data: {} }
    KEY_B.forEach((b, i) => { obj.data[i] = b })
    assert.strictEqual(ensureBuffer(obj).toString('hex'), KEY_B.toString('hex'))
})
check('revives base64 string / Uint8Array / raw array', () => {
    assert.strictEqual(ensureBuffer(KEY_A.toString('base64')).toString('hex'), KEY_A.toString('hex'))
    assert.strictEqual(ensureBuffer(new Uint8Array(KEY_B)).toString('hex'), KEY_B.toString('hex'))
    assert.strictEqual(ensureBuffer(Array.from(KEY_A)).toString('hex'), KEY_A.toString('hex'))
})

console.log('\n[3] metadata cached under the stanza id the `.rvo` reply quotes')
check('cache key = stanzaId, mediaKey coerced, vo flag kept', () => {
    const cache = new Map()
    const cacheMeta = new Map()
    const raw = cases['questionReplyMessage > viewOnceMessageV2 > imageMessage'].message
    const found = scanForViewOnceMedia(raw)
    const entry = cacheRvoMedia({
        detected: found,
        id: STANZA,
        chat: CHAT,
        sender: SENDER,
        cache,
        cacheMeta,
        limit: 300,
    })
    assert.strictEqual(cache.get(STANZA), entry, 'cache not keyed by stanzaId')
    assert.strictEqual(cacheMeta.get(STANZA).sender, SENDER)
    assert.strictEqual(entry.type, 'imageMessage')
    assert.strictEqual(entry.vo, true)
    assert.strictEqual(entry.buffer, null, 'cache must happen BEFORE download')
    assert.strictEqual(entry.chat, CHAT)
    assert.strictEqual(entry.sender, SENDER)
    assert.ok(Buffer.isBuffer(entry.content.mediaKey), 'mediaKey must be a Buffer in cache')
    assert.strictEqual(entry.content.mediaKey.toString('hex'), KEY_A.toString('hex'))
    assert.ok(entry.mimetype && entry.mimetype.length, 'mimetype must not be empty')
})

check('cache cap stays at 300 entries', () => {
    const cache = new Map()
    const cacheMeta = new Map()
    const found = scanForViewOnceMedia(cases['questionReplyMessage > imageMessage(viewOnce)'].message)
    for (let i = 0; i < 305; i++) {
        cacheRvoMedia({ detected: found, id: 'ID' + i, cache, cacheMeta, limit: 300 })
    }
    assert.strictEqual(cache.size, 300)
    assert.strictEqual(cacheMeta.size, 300)
    assert.ok(cache.has('ID304'), 'newest entry must survive')
    assert.ok(!cache.has('ID0'), 'oldest entry must be evicted')
})

console.log('\n[3a] parity wrapper ryuuxalya (V13) vs reinka baileys')
check('WRAPPERS mencakup semua future-proof wrapper ryuu + questionReply', () => {
    // Diambil verbatim dari ryuuxalya/lib/Utils/messages.js:1694-1717.
    const ryuu = [
        'ephemeralMessage', 'viewOnceMessage', 'documentWithCaptionMessage',
        'viewOnceMessageV2', 'viewOnceMessageV2Extension', 'editedMessage',
        'groupMentionedMessage', 'botInvokeMessage', 'lottieStickerMessage',
        'eventCoverImage', 'statusMentionMessage', 'pollCreationOptionImageMessage',
        'associatedChildMessage', 'groupStatusMentionMessage', 'pollCreationMessageV4',
        'pollCreationMessageV5', 'statusAddYours', 'groupStatusMessage',
        'limitSharingMessage', 'botTaskMessage', 'questionMessage',
        'groupStatusMessageV2', 'botForwardedMessage',
    ]
    for (const w of ryuu) assert.ok(WRAPPERS.includes(w), 'kurang wrapper ryuu: ' + w)
    for (const w of ['questionReplyMessage', 'viewOnceMessageV1', 'futureProofMessage']) {
        assert.ok(WRAPPERS.includes(w), 'kurang wrapper tambahan: ' + w)
    }
    const nested = { botForwardedMessage: { message: { viewOnceMessageV2: { message: { videoMessage: { mimetype: 'video/mp4', mediaKey: mkMediaKey(1), directPath: '/v/x' } } } } } }
    const hit = scanForViewOnceMedia(nested)
    assert.ok(hit && hit.type === 'videoMessage', 'wrapper ryuu harus terbongkar sampai media')
})

console.log('\n[3b] content fallback persis V20/V13 (content.includes viewOnceMessageV2)')
check('contentHasViewOnce membaca string content seperti handler V20/V13', () => {
    assert.strictEqual(contentHasViewOnce({ extendedTextMessage: { text: 'x' } }), false)
    assert.strictEqual(contentHasViewOnce({ viewOnceMessageV2: { message: { imageMessage: {} } } }), true)
    assert.strictEqual(contentHasViewOnce({ extendedTextMessage: { contextInfo: { quotedMessage: { viewOnceMessageV2: {} } } } }), true)
})

console.log('\n[4] plain media is NOT misreported as view-once')
check('plain imageMessage -> scan=null, findAnyMedia=hit', () => {
    const plain = { imageMessage: imageNode(KEY_A, { viewOnce: false }) }
    assert.strictEqual(scanForViewOnceMedia(plain), null)
    const any = findAnyMedia(plain)
    assert.ok(any && any.type === 'imageMessage' && any.viewOnce === false)
})

console.log('\n[5] unknown envelopes are diagnosable without leaking key bytes')
check('logger sees nested keys only', () => {
    const seen = []
    const raw = {
        someNewQuestionWrapper: {
            message: { imageMessage: imageNode(KEY_A) },
        },
    }
    scanForViewOnceMedia(raw, { log: (line) => seen.push(line) })
    assert.ok(seen.length, 'expected a diagnostic line for an unknown wrapper')
    const joined = seen.join('\n')
    assert.ok(/someNewQuestionWrapper/.test(joined), 'wrapper name missing from diagnostic')
    assert.ok(!joined.includes(KEY_A.toString('hex')), 'mediaKey bytes leaked into log!')
    assert.ok(!/mediaKey\s*[:=]/.test(joined.replace(/mediaKey\[/g, '')), 'mediaKey value leaked into log!')
    assert.strictEqual(hasViewOnceSignal(raw), true)
})

console.log('\nALL RVO DETECT TESTS PASSED (' + passed + ' checks)')
