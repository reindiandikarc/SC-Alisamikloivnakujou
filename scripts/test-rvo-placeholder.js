// RED→GREEN untuk placeholder view-once (pesan 1x tanpa `message`).
// Fakta pendukung ada di komentar lib/rvo-placeholder.js.
'use strict'

const assert = require('assert')
const h = require('../lib/rvo-placeholder')

function test(name, fn) {
  try { fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

const base = () => ({
  key: { id: 'ACA70EAAB32A4208FC1CECE051A207E4', remoteJid: '6285602845943@s.whatsapp.net', participant: '6285602845943@s.whatsapp.net', fromMe: false, isViewOnce: true },
  messageTimestamp: 1763971200,
  pushName: 'Uji',
})

test('placeholder 1x terdeteksi hanya saat message kosong + key.isViewOnce', () => {
  assert.strictEqual(h.isViewOncePlaceholder(base()), true)
  assert.strictEqual(h.isViewOncePlaceholder({ ...base(), message: { imageMessage: {} } }), false)
  assert.strictEqual(h.isViewOncePlaceholder({ ...base(), key: { ...base().key, isViewOnce: false } }), false)
  assert.strictEqual(h.isViewOncePlaceholder({ ...base(), key: { ...base().key, fromMe: true } }), false)
  assert.strictEqual(h.isViewOncePlaceholder({ key: { id: 'x' } }), false)
})

test('argumen requestPlaceholderResend mengikuti bentuk Baileys', () => {
  const msg = base()
  const { key, msgData } = h.buildResendArgs(msg)
  assert.strictEqual(key.remoteJid, '6285602845943@s.whatsapp.net')
  assert.strictEqual(key.fromMe, false)
  assert.strictEqual(key.id, 'ACA70EAAB32A4208FC1CECE051A207E4')
  assert.strictEqual(key.participant, '6285602845943@s.whatsapp.net')
  assert.strictEqual(key.isViewOnce, true)
  assert.notStrictEqual(msgData.key, msg.key, 'key harus clone, bukan referensi pesan asli')
  assert.strictEqual(msgData.messageTimestamp, 1763971200)
  assert.strictEqual(msgData.pushName, 'Uji')
})

test('LID -> PN untuk messageKey PDO (v13 normalization)', () => {
  const msg = {
    ...base(),
    key: {
      ...base().key,
      remoteJid: '153863378178296@lid',
      remoteJidAlt: '6285602845943@s.whatsapp.net',
      senderPn: '6285602845943@s.whatsapp.net',
      senderLid: '153863378178296@lid',
      participantLid: '153863378178296@lid',
      isViewOnce: true,
    },
  }
  const { key } = h.buildResendArgs(msg)
  assert.strictEqual(key.remoteJid, '6285602845943@s.whatsapp.net')
  assert.strictEqual(key.id, msg.key.id)
  assert.strictEqual(key.senderPn, msg.key.senderPn)
  assert.strictEqual(key.isViewOnce, true)
})

test('trackPending hanya request sekali dalam TTL', () => {
  const store = new Map()
  const t = 1000000
  const a = h.trackPending(store, base(), t)
  assert.strictEqual(a.request, true)
  assert.strictEqual(a.pending.key.id, base().key.id)
  const b = h.trackPending(store, base(), t + 1000)
  assert.strictEqual(b.request, false, 'dedupe')
  const c = h.trackPending(store, base(), t + h.RESEND_TTL_MS + 1)
  assert.strictEqual(c.request, true, 'boleh request lagi setelah TTL')
})

test('recordRequestId membaca requestId dari messages.update', () => {
  const store = new Map([[base().key.id, { id: base().key.id }]])
  const n = h.recordRequestId(store, [{
    key: { id: base().key.id },
    update: { messageStubParameters: ['Message absent from node', 'REQ-123'] },
  }])
  assert.strictEqual(n, 1)
  assert.strictEqual(store.get(base().key.id).requestId, 'REQ-123')
})

test('describe tidak membocorkan mediaKey/hash', () => {
  const msg = { ...base(), mediaKey: Buffer.from('rahasia'), fileSha256: Buffer.from('hash') }
  const s = h.describe(msg)
  assert.ok(/isViewOnce=true/.test(s))
  assert.ok(!/rahasia|hash/.test(s))
})

if (!process.exitCode) console.log('RVO_PLACEHOLDER_TEST_OK')
else console.log('RVO_PLACEHOLDER_TEST_FAIL')
