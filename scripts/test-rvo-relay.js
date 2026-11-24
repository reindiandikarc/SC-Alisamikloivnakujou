// Offline: jalur relay Experimental-Bell. Tidak butuh HP.
'use strict'
const assert = require('assert')
const baileys = require('@whiskeysockets/baileys')

const ID = 'ACRELAY0000000000000000000000001'
const CHAT = '6285602845943@s.whatsapp.net'
const SENDER = '6285602845943@s.whatsapp.net'
let downloadCalls = 0
baileys.downloadMediaMessage = async () => { downloadCalls++; throw new Error('relay tidak boleh mengunduh') }
baileys.downloadContentFromMessage = async () => { downloadCalls++; throw new Error('relay tidak boleh mengunduh') }

const plugin = require('../plugins/cmd/readviewonce')
const relayMod = require('../lib/rvo-relay')

async function test(name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

function setup(command = 'rvo', quotedMessage = null) {
  const relayed = []
  const sent = []
  const replied = []
  global._rvoCache = new Map()
  global._rvoCacheMeta = new Map()
  global._mediaCache = {}
  global._rawBackup = new Map()
  global._viewonceBuffer = { latest: async () => null, get: () => null }
  global._rvoPending = new Map()
  const alaya = {
    relayMessage: async (jid, content, opts) => { relayed.push({ jid, content, opts }); return 'RELAY-1' },
    sendMessage: async (jid, content, opts) => { sent.push({ jid, content, opts }); return { key: { id: 'SENT' } } },
    requestPlaceholderResend: async () => 'REQ-1',
  }
  const m = {
    chat: CHAT,
    sender: SENDER,
    key: { id: 'CMD-1', remoteJid: CHAT },
    message: {
      extendedTextMessage: {
        text: '.' + command,
        contextInfo: { stanzaId: ID, quotedMessage },
      },
    },
  }
  const ctx = {
    command, prefix: '.', mime: 'image/jpeg',
    quoted: quotedMessage
      ? { id: ID, chat: CHAT, mtype: 'imageMessage', type: 'imageMessage', isViewOnce: true, mimetype: 'image/jpeg', fakeObj: { message: quotedMessage } }
      : { id: ID, chat: CHAT, isViewOnce: true, mimetype: 'image/jpeg' },
    replyalya: async (t) => { replied.push(String(t)) },
  }
  return { alaya, m, ctx, relayed, sent, replied }
}

const materialQuote = () => ({
  imageMessage: {
    viewOnce: true,
    mimetype: 'image/jpeg',
    caption: 'asli',
    mediaKey: Buffer.from(Array.from({ length: 32 }, (_, i) => i + 1)),
    directPath: '/v/rvo.enc',
    url: 'https://example.invalid/rvo.enc',
    fileLength: '71246',
  },
})

async function main() {
  await test('rvome relay ke pengirim, rvo relay ke chat', async () => {
    for (const [cmd, expected] of [['rvome', SENDER], ['rvo', CHAT], ['getviewonce', CHAT]]) {
      downloadCalls = 0
      const s = setup(cmd, materialQuote())
      await plugin.run(s.alaya, s.m, s.ctx)
      assert.strictEqual(s.relayed.length, 1, cmd + ' harus relay sekali: ' + JSON.stringify(s.replied))
      assert.strictEqual(s.relayed[0].jid, expected)
      assert.strictEqual(downloadCalls, 0, 'downloader tidak boleh dipanggil')
    }
  })

  await test('viewOnce dibuang, mediaKey/directPath/url tetap utuh', async () => {
    const s = setup('rvo', materialQuote())
    await plugin.run(s.alaya, s.m, s.ctx)
    const img = s.relayed[0].content.imageMessage
    assert.ok(img, 'content harus imageMessage')
    assert.strictEqual('viewOnce' in img, false)
    assert.ok(Buffer.isBuffer(img.mediaKey) && img.mediaKey.length === 32)
    assert.strictEqual(img.directPath, '/v/rvo.enc')
    assert.strictEqual(img.url, 'https://example.invalid/rvo.enc')
    assert.strictEqual(img.fileLength, '71246')
  })

  await test('quote tanpa mediaKey/directPath tetap di-relay (sama seperti Bell)', async () => {
    const s = setup('rvo', { imageMessage: { viewOnce: true, mimetype: 'image/jpeg', fileSha256: Buffer.alloc(32, 7) } })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(s.relayed.length, 1, 'descriptor metadata harus tetap direlay')
    assert.strictEqual('viewOnce' in s.relayed[0].content.imageMessage, false)
    assert.strictEqual(downloadCalls, 0, 'downloader tidak boleh dipanggil')
  })

  await test('alias getviewonce terdaftar di plugin', async () => {
    assert.ok(plugin.command.includes('getviewonce'), 'plugin harus menerima getviewonce')
  })

  await test('helper tidak mengubah objek asli', async () => {
    const raw = materialQuote()
    const out = relayMod.relayContentFromQuoted(raw)
    assert.strictEqual(raw.imageMessage.viewOnce, true)
    assert.strictEqual('viewOnce' in out.content.imageMessage, false)
  })

  await test('wrapper viewOnceMessageV2 ikut dibuka', async () => {
    const raw = { viewOnceMessageV2: { message: materialQuote() } }
    const out = relayMod.relayContentFromQuoted(raw)
    assert.ok(out && out.content.imageMessage)
    assert.strictEqual(out.mediaType, 'image')
  })

  if (!process.exitCode) console.log('RVO_RELAY_TEST_OK')
  else console.log('RVO_RELAY_TEST_FAIL')
}

main().catch(e => { console.log('RVO_RELAY_TEST_FAIL', e); process.exitCode = 1 })
