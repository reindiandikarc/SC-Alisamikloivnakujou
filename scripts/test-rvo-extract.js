// Offline regression test untuk lib/rvo-extract.js.
// Reproduksi runtime 03:13:17: reply .rvo pada view-once image, cache/store kosong.
// Tidak menyalakan bot, tidak butuh kredensial, downloader Baileys di-stub.
'use strict'

const assert = require('assert')

let rvo
try {
  rvo = require('../lib/rvo-extract')
} catch (e) {
  // RED yang bersih: modul belum ada ⇒ assertion gagal, bukan crash require.
  if (e.code === 'MODULE_NOT_FOUND' && /rvo-extract/.test(e.message)) rvo = null
  else throw e
}

const STANZA_ID = 'ACFAD7A9C2B41E8D3F6A0C5B7E92D418'
const CHAT = '120363425735076548@g.us'
const SENDER_LID = '153863378178296@lid'
const EXPECTED_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
const MEDIA_KEY_BYTES = [11, 22, 33, 44, 55, 66, 77, 88, 99, 100, 111, 122, 133, 144, 155, 166, 177, 188, 199, 200, 211, 222, 233, 244, 255, 1, 2, 3, 4, 5, 6, 7]
const HASH_BYTES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]

// Salinan quotedMessage persis seperti di log: contextInfo tidak punya remoteJid,
// quotedType = imageMessage, viewOnce = true, directPath = null. mediaKey sudah
// terserialisasi jadi {type:'Buffer',data:[...]} (bukan Buffer asli).
function originalQuotedMap() {
  return {
    viewOnceMessageV2: {
      message: {
        imageMessage: {
          mimetype: 'image/jpeg',
          mediaKey: { type: 'Buffer', data: MEDIA_KEY_BYTES },
          fileEncSha256: { type: 'Buffer', data: HASH_BYTES },
          directPath: null,
          viewOnce: true,
          caption: '',
          fileLength: EXPECTED_BYTES.length
        }
      }
    }
  }
}

// Bentuk m.quoted setelah smsg(): node media sudah di-flatten, map asli
// disimpan di fakeObj.message (lihat lib/myfunc.js:401-454).
function serializedM() {
  const quotedMap = originalQuotedMap()
  const node = quotedMap.viewOnceMessageV2.message.imageMessage
  return {
    key: { id: 'CMD_1', remoteJid: CHAT },
    chat: CHAT,
    sender: SENDER_LID,
    message: {
      extendedTextMessage: {
        text: '.rvo',
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          statusAttributions: [],
          stanzaId: STANZA_ID,
          participant: SENDER_LID,
          quotedType: 'imageMessage',
          quotedMessage: quotedMap
        }
      }
    },
    msg: {
      text: '.rvo',
      contextInfo: {
        stanzaId: STANZA_ID,
        participant: SENDER_LID,
        quotedType: 'imageMessage',
        quotedMessage: quotedMap
      }
    },
    quoted: {
      ...node,
      mtype: 'imageMessage',
      type: 'imageMessage',
      mime: '', // sesuai log runtime
      id: STANZA_ID,
      chat: CHAT,
      sender: SENDER_LID,
      isViewOnce: true,
      fakeObj: { message: quotedMap },
      download: async () => Buffer.alloc(0) // jalur ini yang gagal di log
    },
    getQuotedObj: async () => ({
      key: { id: STANZA_ID, remoteJid: CHAT, participant: SENDER_LID },
      message: originalQuotedMap()
    })
  }
}

function stubDownloader(calls) {
  return async (node, type) => {
    calls.push({ node, type })
    assert.strictEqual(type, 'image', 'tipe download harus "image"')
    assert.ok(Buffer.isBuffer(node.mediaKey), 'mediaKey HARUS Buffer, bukan {type,data} mentah')
    assert.strictEqual(node.mediaKey.length, MEDIA_KEY_BYTES.length)
    assert.strictEqual(node.mediaKey.toString('hex'), Buffer.from(MEDIA_KEY_BYTES).toString('hex'))
    assert.ok(Buffer.isBuffer(node.fileEncSha256), 'fileEncSha256 juga harus Buffer')
    return (async function* () {
      yield Buffer.from([0xff, 0xd8, 0xff])
      yield Buffer.from([0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
    })()
  }
}

const cases = []
const test = (name, fn) => cases.push({ name, fn })

test('ensureBuffer mengubah {type:"Buffer",data:[...]} jadi Buffer asli', () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const buf = rvo.ensureBuffer({ type: 'Buffer', data: MEDIA_KEY_BYTES })
  assert.ok(Buffer.isBuffer(buf))
  assert.strictEqual(buf.toString('hex'), Buffer.from(MEDIA_KEY_BYTES).toString('hex'))
})

test('extractMedia menemukan media di quoted map viewOnceMessageV2', () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const found = rvo.extractMedia({ extendedTextMessage: { contextInfo: { stanzaId: STANZA_ID, quotedType: 'imageMessage', quotedMessage: originalQuotedMap() } } })
  assert.ok(found, 'extractor harus menemukan node media')
  assert.strictEqual(found.mediaType, 'imageMessage')
  assert.strictEqual(found.mime, 'image/jpeg')
  assert.strictEqual(found.caption, '')
  assert.ok(found.mediaObj.viewOnce)
})

test('extractMedia mengutamakan quoted.message.imageMessage walau quote punya mtype pipih', () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  // Skenario oracle Agent T: mtype/type pipih ada, tapi media asli ada di .message.
  const quoted = {
    mtype: 'imageMessage', type: 'imageMessage', mime: '', id: STANZA_ID,
    message: {
      imageMessage: {
        mimetype: 'image/jpeg',
        mediaKey: { type: 'Buffer', data: MEDIA_KEY_BYTES },
        directPath: '/rvo/offline/normalized',
        caption: 'normalized quoted caption',
        viewOnce: true
      }
    }
  }
  const found = rvo.extractMedia(quoted)
  assert.ok(found, 'extractor harus menemukan node di .message')
  assert.strictEqual(found.mime, 'image/jpeg')
  assert.strictEqual(found.caption, 'normalized quoted caption')
  assert.ok(found.mediaObj.mediaKey, 'mediaKey asli harus dipakai, bukan node pipih kosong')
})

test('downloadV20Style memakai mtype.replace(/Message/gi) dan quoted.msg', async () => {
  assert.ok(rvo && typeof rvo.downloadV20Style === 'function', 'helper V20 harus ada')
  const quoted = {
    mtype: 'imageMessage',
    type: 'imageMessage',
    msg: { mimetype: 'image/jpeg', mediaKey: { type: 'Buffer', data: MEDIA_KEY_BYTES }, directPath: '/v/rvo.enc' },
  }
  const calls = []
  const buffer = await rvo.downloadV20Style(quoted, (node, type) => {
    calls.push({ node, type })
    return (async function* () { yield EXPECTED_BYTES })()
  })
  assert.strictEqual(calls.length, 1)
  assert.strictEqual(calls[0].type, 'image')
  assert.ok(Buffer.isBuffer(calls[0].node.mediaKey), 'mediaKey harus Buffer')
  assert.strictEqual(buffer.toString('hex'), EXPECTED_BYTES.toString('hex'))
})

test('downloadV20Style memakai thumbnail-link ala ryuuxalya bila directPath/url kosong', async () => {
  const quoted = {
    mtype: 'videoMessage',
    msg: {
      mimetype: 'video/mp4',
      mediaKey: { type: 'Buffer', data: MEDIA_KEY_BYTES },
      thumbnailDirectPath: '/v/t62/thumb.enc',
    },
  }
  const calls = []
  const buffer = await rvo.downloadV20Style(quoted, (node, type) => {
    calls.push({ node, type })
    return (async function* () { yield EXPECTED_BYTES })()
  })
  assert.strictEqual(calls.length, 1)
  assert.strictEqual(calls[0].type, 'thumbnail-link')
  assert.strictEqual(calls[0].node.directPath, '/v/t62/thumb.enc')
  assert.ok(Buffer.isBuffer(calls[0].node.mediaKey))
  assert.strictEqual(buffer.toString('hex'), EXPECTED_BYTES.toString('hex'))
})

test('downloadFromMediaObj mengembalikan Buffer dan mengirim mediaKey yang sudah revived', async () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const found = rvo.extractMedia(originalQuotedMap())
  assert.ok(found, 'extractor harus menemukan node media')
  const calls = []
  const buffer = await rvo.downloadFromMediaObj(found.mediaObj, found.mediaType, stubDownloader(calls))
  assert.strictEqual(calls.length, 1, 'downloader dipanggil tepat sekali')
  assert.ok(Buffer.isBuffer(buffer))
  assert.strictEqual(buffer.toString('hex'), EXPECTED_BYTES.toString('hex'))
  assert.strictEqual(found.mediaObj.mediaKey.type, 'Buffer', 'objek asli tidak boleh dimutasi')
})

test('findMediaCandidates menemukan media lewat m.quoted.fakeObj.message', async () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const list = await rvo.findMediaCandidates(serializedM())
  const found = list.find(x => x.source.includes('fakeObj'))
  assert.ok(found, 'fakeObj.message harus ikut dipertimbangkan')
  assert.strictEqual(found.extract.mediaType, 'imageMessage')
  assert.ok(found.extract.mediaObj.mediaKey)
})

test('findMediaCandidates menemukan media lewat hasil m.getQuotedObj()', async () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const list = await rvo.findMediaCandidates(serializedM())
  const found = list.find(x => x.source.includes('getQuotedObj'))
  assert.ok(found, 'getQuotedObj harus ikut dipertimbangkan')
  assert.strictEqual(found.extract.mediaType, 'imageMessage')
})

test('findMediaCandidates menemukan media dari contextInfo.quotedMessage mentah', async () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const list = await rvo.findMediaCandidates(serializedM())
  const found = list.find(x => x.source.includes('quotedMessage'))
  assert.ok(found, 'contextInfo.quotedMessage harus ikut dipertimbangkan')
  assert.strictEqual(found.extract.mediaType, 'imageMessage')
})

test('candidateJids menyediakan varian LID dan @s.whatsapp.net', () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const jids = rvo.candidateJids(SENDER_LID, CHAT)
  assert.ok(jids.includes(SENDER_LID))
  assert.ok(jids.includes('153863378178296@s.whatsapp.net'), 'varian PN harus ada')
  assert.ok(jids.includes(CHAT))
})

test('plugin .rvo sukses lewat fakeObj.message saat quote & cache kosong (skenario log)', async () => {
  assert.ok(rvo, 'lib/rvo-extract.js harus ada')
  const root = require('path').join(__dirname, '..')
  const baileysId = require.resolve('@whiskeysockets/baileys', { paths: [root] })
  const previousModule = require.cache[baileysId]
  const previousGlobals = {
    rvoCache: global._rvoCache,
    rvoCacheMeta: global._rvoCacheMeta,
    mediaCache: global._mediaCache,
    viewonceBuffer: global._viewonceBuffer
  }
  require.cache[baileysId] = {
    id: baileysId,
    filename: baileysId,
    loaded: true,
    children: [],
    paths: [],
    exports: { downloadContentFromMessage: stubDownloader([]) }
  }

  try {
    const plugin = require('../plugins/cmd/readviewonce')
    assert.deepStrictEqual(plugin.command, ['rvo', 'readviewonce', 'rvome'])
    assert.deepStrictEqual(plugin.tags, ['general'])

    global._rvoCache = new Map()
    global._rvoCacheMeta = new Map()
    global._mediaCache = {}
    delete global._viewonceBuffer

    const m = serializedM()
    const quotedMap = m.message.extendedTextMessage.contextInfo.quotedMessage
    quotedMap.viewOnceMessageV2.message.imageMessage.caption = 'lihat dong'
    let nativeQuoteCalls = 0
    // Salinan quoted dari contextInfo sudah kehilangan mediaKey/url/directPath.
    m.quoted = {
      mtype: 'imageMessage', type: 'imageMessage', mimetype: '', caption: '',
      viewOnce: true, isViewOnce: true, id: STANZA_ID, chat: CHAT, sender: SENDER_LID,
      fakeObj: { message: quotedMap },
      download: async () => { nativeQuoteCalls++; throw new Error('native quote failed: No valid media URL or directPath present in message') }
    }
    m.getQuotedObj = async () => null // store miss (LID/PN)

    const sent = []
    const failed = []
    const storeJids = []
    const alaya = {
      sendMessage: async (chat, content, opts) => { sent.push({ content, opts }); return {} },
      downloadMediaMessage: async () => { throw new Error('downloader sentral tidak boleh dipanggil dengan objek berkunci') }
    }
    const ctx = {
      command: 'rvo', prefix: '.', quoted: m.quoted, mime: '',
      replyalya: async (text) => failed.push(text),
      store: { loadMessage: async (jid) => { storeJids.push(jid); return null } }
    }

    await plugin.run(alaya, m, ctx)

    assert.strictEqual(failed.length, 0, 'plugin tidak boleh gagal: ' + failed.join(' '))
    const image = sent.find(s => Buffer.isBuffer(s.content.image))
    assert.ok(image, 'plugin harus mengirim image')
    assert.strictEqual(image.content.image.toString('hex'), EXPECTED_BYTES.toString('hex'))
    assert.ok(image.content.caption.includes('@153863378178296'), 'caption harus punya tag pengirim')
    assert.ok(image.content.caption.includes('lihat dong'), 'caption asli harus ikut')
    assert.deepStrictEqual(sent.filter(s => s.content.react).map(s => s.content.react.text), ['⏱️', '✅'])
    assert.strictEqual(nativeQuoteCalls, 0, 'jalur quoted.download() yang gagal tidak boleh jadi andalan')
    assert.ok(storeJids.includes(SENDER_LID) && storeJids.includes('153863378178296@s.whatsapp.net'),
      'store harus diprobe dengan varian LID dan PN')
  } finally {
    if (previousModule) require.cache[baileysId] = previousModule
    else delete require.cache[baileysId]
    for (const [key, value] of Object.entries(previousGlobals)) {
      if (value === undefined) delete global[key]
      else global[key] = value
    }
  }
})

async function main() {
  let passed = 0
  const failures = []
  for (const c of cases) {
    try {
      await c.fn()
      passed++
      console.log('  ok   ' + c.name)
    } catch (e) {
      failures.push(c.name)
      console.log('  FAIL ' + c.name + ': ' + (e && e.message))
    }
  }
  console.log(`\nRVO_EXTRACT_TEST ${passed}/${cases.length} passed`)
  if (failures.length) {
    console.error('RVO_EXTRACT_TEST_FAIL: ' + failures.join(' | '))
    process.exitCode = 1
  } else {
    console.log('RVO_EXTRACT_TEST_OK')
  }
}

main()
