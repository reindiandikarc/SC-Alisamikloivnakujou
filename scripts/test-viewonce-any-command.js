'use strict'

const assert = require('assert')
const baileys = require('@whiskeysockets/baileys')
const { smsg } = require('../lib/myfunc')
const { fallbackQuoted } = require('../lib/rvo-extract')
const plugin = require('../plugins/cmd/readviewonce')

const CHAT = '153863378178296@lid'
const SENDER = '6285602845943@s.whatsapp.net'
const ID = 'ACVOANY0000000000000000000000001'
const BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])

baileys.downloadMediaMessage = async () => { throw new Error('tidak boleh download dari quote yang kosong') }
baileys.downloadContentFromMessage = async () => { throw new Error('tidak ada directPath') }

const conn = {
  user: { id: '628111111111@s.whatsapp.net' },
  decodeJid: (jid) => String(jid || '').split(':')[0],
  downloadMediaMessage: async () => { throw new Error('tidak ada media') }
}
const store = { loadMessage: async () => null }

function setup (body = '.rvo', withQuote = false) {
  const relayed = []
  const sent = []
  const replied = []
  global._rvoCache = new Map([[ID, {
    type: 'imageMessage',
    content: { imageMessage: { viewOnce: true, mimetype: 'image/jpeg' } },
    buffer: BYTES,
    mimetype: 'image/jpeg',
    caption: 'dari 1x',
    chat: CHAT,
    sender: SENDER,
    cachedAt: Date.now(),
    vo: true,
    fromMe: false
  }]])
  global._rvoCacheMeta = new Map()
  global._mediaCache = {}
  global._rawBackup = new Map()
  global._viewonceBuffer = { get: () => BYTES, latest: async () => null, put: () => {} }
  global._rvoPending = new Map()
  global.db = { users: { [SENDER]: { limit: 10 } } }

  const message = withQuote
    ? { extendedTextMessage: { text: body, contextInfo: { stanzaId: ID, participant: SENDER, quotedMessage: { imageMessage: { viewOnce: true, mimetype: 'image/jpeg', mediaKey: Buffer.from('k') } } } } }
    : { extendedTextMessage: { text: body } }
  const raw = {
    key: { id: 'CMD_ANY', remoteJid: CHAT, participant: SENDER, fromMe: false },
    message
  }
  const m = smsg(conn, raw, store)
  const alaya = {
    relayMessage: async (jid, content) => { relayed.push({ jid, content }); return 'RELAY' },
    sendMessage: async (jid, content) => { sent.push({ jid, content }); return { key: { id: 'SENT' } } },
    requestPlaceholderResend: async () => 'REQ'
  }
  const quoted = m.quoted || fallbackQuoted(m) || m
  const ctx = {
    command: body.replace(/^\./, ''),
    prefix: '.',
    mime: (quoted.msg || quoted).mimetype || '',
    quoted,
    replyalya: async (t) => replied.push(String(t))
  }
  return { m, alaya, ctx, relayed, sent, replied }
}

async function test (name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main () {
  await test('.rvo mengirim media asli, bukan teks descriptor relay', async () => {
    const s = setup('.rvo', true)
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.sent.some(x => x.content?.image), 'harus mengirim image: ' + JSON.stringify(s.replied))
    assert.strictEqual(s.relayed.length, 0, 'relay descriptor tidak boleh dipakai')
    assert.ok(!s.replied.some(t => /diteruskan dari descriptor/.test(t)), 'teks descriptor tidak boleh dikirim')
  })

  await test('reply tanpa contextInfo tetap punya quoted dari cache', async () => {
    const s = setup('.rvo', false)
    assert.strictEqual(s.m.quoted, null)
    assert.ok(s.ctx.quoted, 'fallback quoted harus ada')
    assert.strictEqual(s.ctx.quoted.mimetype, 'image/jpeg')
    const buffer = await s.ctx.quoted.download()
    assert.strictEqual(buffer.toString('hex'), BYTES.toString('hex'))
  })

  await test('.stiker bisa membaca media 1x walau reply tanpa contextInfo', async () => {
    const s = setup('.stiker', false)
    assert.ok(/image/.test(s.ctx.mime), 'mime harus image/jpeg, dapat: ' + s.ctx.mime)
    const buffer = await s.ctx.quoted.download()
    assert.strictEqual(buffer.toString('hex'), BYTES.toString('hex'))
  })

  await test('fallback tidak memakai entry lama atau chat lain', async () => {
    const s = setup('.rvo', false)
    global._rvoCache.clear()
    assert.strictEqual(fallbackQuoted(s.m), null)
    global._rvoCache.set(ID, {
      type: 'imageMessage', content: { imageMessage: { mimetype: 'image/jpeg' } }, buffer: BYTES,
      mimetype: 'image/jpeg', chat: '628999999999@s.whatsapp.net', sender: SENDER,
      cachedAt: Date.now(), vo: true, fromMe: false
    })
    assert.strictEqual(fallbackQuoted(s.m), null, 'chat lain tidak boleh dipakai')
  })

  if (!process.exitCode) console.log('VIEWONCE_ANY_COMMAND_TEST_OK')
  else console.log('VIEWONCE_ANY_COMMAND_TEST_FAIL')
  process.exit(process.exitCode || 0)
}

main().catch(e => { console.error(e); process.exit(1) })
