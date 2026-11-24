// Integrasi offline untuk plugins/cmd/readviewonce.js:
// reply .rvo pada quote yang sudah dikupas harus memakai backup WAMessage
// mentah (metode V13) dan mengirim ulang medianya.
'use strict'

const assert = require('assert')
const baileys = require('@whiskeysockets/baileys')

const ID = 'AC3447BA173BCD98543C9860B1C9A0AA'
const CHAT = '6285602845943@s.whatsapp.net'
const SENDER = '6285602845943@s.whatsapp.net'
const MEDIA_KEY = JSON.parse(JSON.stringify(Buffer.from(Array.from({ length: 32 }, (_, i) => i + 1))))
const BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])

// Stub downloader SEBELUM plugin di-require (plugin destructures saat load).
let nativeCalls = 0
baileys.downloadMediaMessage = async (raw) => {
  nativeCalls++
  const node = raw?.message?.imageMessage
  if (!node || !Buffer.isBuffer(node.mediaKey) || node.viewOnce) throw new Error('stub: node tidak valid')
  return BYTES
}
baileys.downloadContentFromMessage = async () => { throw new Error('stub: tidak ada directPath') }

const plugin = require('../plugins/cmd/readviewonce')

function setup({ backup = true, buffers = {}, pending = null } = {}) {
  const sent = []
  const replied = []
  global._rvoCache = new Map()
  global._rvoCacheMeta = new Map()
  global._mediaCache = {}
  global._viewonceBuffer = { latest: async () => null, get: (id) => buffers[id] || null }
  global._rvoPending = pending ? new Map([[ID, pending]]) : new Map()
  global._rawBackup = backup ? new Map([[ID, {
    jid: CHAT,
    message: { viewOnceMessageV2: { message: { imageMessage: {
      viewOnce: true, mimetype: 'image/jpeg', caption: 'foto asli',
      mediaKey: JSON.parse(JSON.stringify(MEDIA_KEY)),
      directPath: '/v/rvo.enc',
    } } } },
    ts: Date.now(),
  }]]) : new Map()
  const resends = []
  const alaya = {
    user: { id: '6285181813279@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => { sent.push({ jid, content, opts }); return { key: { id: 'SENT' } } },
    requestPlaceholderResend: async (key, msgData) => { resends.push({ key, msgData }); return 'REQ-1' },
  }
  const m = {
    chat: CHAT,
    sender: SENDER,
    key: { id: 'CMD-1', remoteJid: CHAT },
    message: { extendedTextMessage: { text: '.rvo', contextInfo: { stanzaId: ID, quotedMessage: { imageMessage: { viewOnce: true } } } } },
  }
  const ctx = {
    command: 'rvo', prefix: '.', mime: 'image/jpeg',
    quoted: { id: ID, chat: CHAT, mtype: 'imageMessage', type: 'imageMessage', isViewOnce: true, mimetype: 'image/jpeg' },
    replyalya: async (t) => { replied.push(String(t)) },
  }
  return { alaya, m, ctx, sent, replied, resends }
}

async function test(name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main() {
  await test('backup ada -> .rvo mengirim ulang image dari pesan asli', async () => {
    nativeCalls = 0
    const s = setup({ backup: true })
    await plugin.run(s.alaya, s.m, s.ctx)
    const image = s.sent.find(x => x.content?.image)
    assert.ok(image, 'harus ada pesan image: ' + JSON.stringify(s.replied))
    assert.strictEqual(Buffer.isBuffer(image.content.image) || !!image.content.image.url, true)
    assert.ok(nativeCalls >= 1, 'downloader native dipanggil')
    assert.ok(/Read View Once/.test(image.content.caption || ''))
  })

  await test('backup kosong -> .rvo gagal dengan pesan, bukan image', async () => {
    nativeCalls = 0
    const s = setup({ backup: false })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(!s.sent.some(x => x.content?.image), 'tidak boleh mengirim image')
    assert.ok(s.replied.some(t => /Media sekali lihat tidak ditemukan/.test(t)), 'harus membalas pesan gagal')
  })

  await test('buffer saat pesan asli tiba dipakai walau deteksi view-once meleset', async () => {
    nativeCalls = 0
    const s = setup({ backup: false, buffers: { [ID]: BYTES } })
    await plugin.run(s.alaya, s.m, s.ctx)
    const image = s.sent.find(x => x.content?.image)
    assert.ok(image, 'harus mengirim image dari buffer: ' + JSON.stringify(s.replied))
    assert.strictEqual(nativeCalls, 0, 'tidak perlu download ulang')
  })

  await test('placeholder 1x: .rvo meminta resend ke HP, bukan pesan gagal umum', async () => {
    nativeCalls = 0
    const pending = {
      id: ID,
      key: { remoteJid: CHAT, fromMe: false, id: ID, participant: SENDER },
      msgData: { key: { id: ID }, messageTimestamp: 1 },
      chat: CHAT, sender: SENDER, ts: 1,
    }
    const s = setup({ backup: false, pending })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(!s.sent.some(x => x.content?.image), 'belum boleh kirim image')
    assert.strictEqual(s.resends.length, 1, 'harus ada 1 requestPlaceholderResend')
    assert.strictEqual(s.resends[0].key.id, ID)
    assert.ok(s.replied.some(t => /diminta ulang dari HP/i.test(t)), 'harus memberi tahu user: ' + JSON.stringify(s.replied))
    assert.strictEqual(pending.requestId, 'REQ-1')
  })

  await test('bentuk log terbaru: .rvo sebagai caption media (ctx.quoted === m)', async () => {
    nativeCalls = 0
    const s = setup({ backup: true })
    // Tanpa contextInfo → alya.js melakukan fallback `quoted = m`.
    s.m.message = { imageMessage: {
      viewOnce: true, isViewOnce: true, mimetype: 'image/jpeg', caption: '.rvo',
      mediaKey: JSON.parse(JSON.stringify(MEDIA_KEY)), directPath: '/v/rvo.enc',
    } }
    s.m.msg = s.m.message.imageMessage
    s.m.mtype = s.m.type = 'imageMessage'
    s.m.body = s.m.text = '.rvo'
    s.ctx.quoted = s.m
    s.ctx.mime = 'image/jpeg'
    s.ctx.command = 'rvo'
    await plugin.run(s.alaya, s.m, s.ctx)
    const image = s.sent.find(x => x.content?.image)
    assert.ok(image, 'caption-on-media harus tetap mengirim image: ' + JSON.stringify(s.replied))
    assert.ok(nativeCalls >= 1, 'harus mengunduh dari pesan asli di backup')
  })

  if (!process.exitCode) console.log('RVO_PLUGIN_TEST_OK')
  else console.log('RVO_PLUGIN_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
