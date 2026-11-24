// Offline regression untuk pemulihan view-once dari pesan ASLI (metode V13
// lib/antidelete.js: simpan WAMessage mentah keyed by stanzaId), bukan dari
// contextInfo.quotedMessage yang sudah dibuang mediaKey/directPath-nya.
'use strict'

const assert = require('assert')

let rec
try {
  rec = require('../lib/rvo-recover')
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND' && /rvo-recover/.test(e.message)) rec = null
  else throw e
}

const ID = 'AC3447BA173BCD98543C9860B1C9A0AA'
const CHAT = '153863378178296@s.whatsapp.net'
const MEDIA_KEY = Buffer.from(Array.from({ length: 32 }, (_, i) => i + 1))
const EXPECTED = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log('  ok  ' + name))
    .catch((e) => {
      console.log('  FAIL ' + name + ': ' + (e && e.message ? e.message : e))
      process.exitCode = 1
    })
}

// Bentuk setelah JSON.stringify: mediaKey bukan Buffer lagi.
const persistedNode = () => ({
  viewOnce: true,
  mimetype: 'image/jpeg',
  caption: 'foto 1x',
  mediaKey: JSON.parse(JSON.stringify(MEDIA_KEY)),
  directPath: '/v/t62/rvo.enc',
  fileEncSha256: JSON.parse(JSON.stringify(Buffer.alloc(32, 7))),
})

const quotedStripped = () => ({
  viewOnce: true,
  isViewOnce: true,
  mtype: 'imageMessage',
  type: 'imageMessage',
  id: ID,
  mimetype: 'image/jpeg',
  caption: '',
  contextInfo: { stanzaId: ID },
})

function fakeNative(calls) {
  return async (raw) => {
    calls.push({ raw, keys: Object.keys(raw?.message || {}) })
    const node = raw?.message?.imageMessage
    if (!node) throw new Error('bukan imageMessage')
    if (!Buffer.isBuffer(node.mediaKey)) throw new Error('mediaKey bukan Buffer')
    if (node.viewOnce) throw new Error('viewOnce masih menempel')
    return EXPECTED
  }
}

async function main() {
  assert.ok(rec, 'lib/rvo-recover.js harus ada')

  console.log('[1] rehydrateBuffers mengembalikan Buffer asli dari JSON')
  await test('mediaKey {type:Buffer,data} jadi Buffer; nested ikut kebuka', () => {
    const input = { message: { imageMessage: persistedNode() } }
    const out = rec.rehydrateBuffers(input)
    assert.ok(Buffer.isBuffer(out.message.imageMessage.mediaKey))
    assert.strictEqual(out.message.imageMessage.mediaKey.toString('hex'), MEDIA_KEY.toString('hex'))
    assert.ok(Buffer.isBuffer(out.message.imageMessage.fileEncSha256))
  })

  console.log('[1b] BUG load backup: array pasangan tidak boleh jadi key "0","1"')
  await test('loadRawBackup mengembalikan key stanzaId dari JSON [id,entry]', () => {
    const parsed = JSON.parse(JSON.stringify([[ID, { jid: CHAT, message: {}, ts: 1 }]]))
    const map = rec.loadRawBackup(parsed)
    assert.ok(map.has(ID), 'key harus stanzaId, bukan "0"')
    assert.strictEqual(map.get(ID).ts, 1)
    assert.strictEqual(rec.loadRawBackup({ [ID]: { ts: 2 } }).get(ID).ts, 2)
  })

  console.log('[2] recovery dari raw backup V13 (stanzaId -> WAMessage mentah)')
  await test('quote yang sudah dikupas tetap berhasil lewat backup', async () => {
    const calls = []
    const result = await rec.recoverViewOnce({
      id: ID,
      chat: CHAT,
      quoted: quotedStripped(),
      rawBackup: new Map([[ID, { jid: CHAT, message: { viewOnceMessageV2: { message: { imageMessage: persistedNode() } } }, ts: Date.now() }]]),
      nativeDownload: fakeNative(calls),
    })
    assert.ok(result, 'harus ketemu')
    assert.strictEqual(result.buffer.toString('hex'), EXPECTED.toString('hex'))
    assert.strictEqual(result.source, 'rawBackup')
    assert.strictEqual(result.mediaType, 'imageMessage')
    assert.strictEqual(result.caption, 'foto 1x')
    assert.ok(calls.some(c => c.keys.includes('imageMessage')), 'native dipanggil dengan node media')
  })

  await test('questionReplyMessage ikut terbuka dari backup', async () => {
    const calls = []
    const result = await rec.recoverViewOnce({
      id: ID,
      chat: CHAT,
      quoted: quotedStripped(),
      rawBackup: new Map([[ID, {
        jid: CHAT,
        message: { questionReplyMessage: { message: { viewOnceMessageV2: { message: { imageMessage: persistedNode() } } } } },
        ts: Date.now(),
      }]]),
      nativeDownload: fakeNative(calls),
    })
    assert.ok(result)
    assert.strictEqual(result.source, 'rawBackup')
  })

  await test('viewOnce dihapus dari clone, node asli tidak dimutasi', async () => {
    const entry = { jid: CHAT, message: { imageMessage: persistedNode() } }
    const before = JSON.stringify(entry)
    await rec.recoverViewOnce({
      id: ID,
      chat: CHAT,
      quoted: quotedStripped(),
      rawBackup: new Map([[ID, entry]]),
      nativeDownload: fakeNative([]),
    })
    assert.strictEqual(JSON.stringify(entry), before, 'backup asli tidak boleh berubah')
  })

  console.log('[3] jalur lain tetap bekerja')
  await test('media-cache lama (JSON) juga direhydrate', async () => {
    const calls = []
    const result = await rec.recoverViewOnce({
      id: ID,
      chat: CHAT,
      quoted: quotedStripped(),
      mediaCache: { [ID]: { jid: CHAT, message: { imageMessage: persistedNode() } } },
      nativeDownload: fakeNative(calls),
    })
    assert.ok(result)
    assert.strictEqual(result.source, 'mediaCache')
  })

  await test('store LID/PN dicoba dengan JID varian', async () => {
    const calls = []
    const store = {
      loadMessage: async (jid, id) => jid === '153863378178296@s.whatsapp.net' && id === ID
        ? { key: { id, remoteJid: jid }, message: { imageMessage: persistedNode() } }
        : null,
    }
    const result = await rec.recoverViewOnce({
      id: ID,
      chat: '153863378178296@lid',
      quoted: quotedStripped(),
      store,
      nativeDownload: fakeNative(calls),
    })
    assert.ok(result)
    assert.strictEqual(result.source, 'store')
  })

  await test('tanpa sumber asli mengembalikan null (tidak mengarang media)', async () => {
    const result = await rec.recoverViewOnce({
      id: ID,
      chat: CHAT,
      quoted: quotedStripped(),
      nativeDownload: async () => { throw new Error('No valid media URL or directPath present in message') },
    })
    assert.strictEqual(result, null)
  })

  if (!process.exitCode) console.log('RVO_RECOVER_TEST_OK')
  else console.log('RVO_RECOVER_TEST_FAIL')
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
