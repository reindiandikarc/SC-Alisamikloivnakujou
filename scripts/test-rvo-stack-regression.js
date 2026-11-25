// Regresi untuk dua bug yang membuat `.rvo` balas "Maximum call stack size exceeded"
// dan socket Baileys melempar "Cannot access 'earlyRvoResponse' before initialization".
'use strict'
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const { relayContentFromQuoted, copyPlain } = require('../lib/rvo-relay')

let failures = 0
function test(name, fn) {
  try { fn(); console.log('  ok  ' + name) }
  catch (e) { failures++; console.log('  FAIL ' + name + ': ' + (e?.message || e)) }
}

test('copyPlain tahan objek melingkar (fakeObj dari myfunc.js)', () => {
  const a = { x: 1 }
  a.self = a
  const out = copyPlain(a)
  assert.strictEqual(out.x, 1)
  assert.strictEqual(out.self, out, 'siklus harus dipetakan ke salinan, bukan diikuti terus')
})

test('relay tidak meledak pada quote dengan fakeObj melingkar', () => {
  const qm = {
    imageMessage: {
      viewOnce: true,
      mimetype: 'image/jpeg',
      mediaKey: Buffer.alloc(32, 1),
      directPath: '/v/x.enc',
      caption: 'asli',
    },
  }
  // lib/myfunc.js menaruh fakeObj di node media; fakeObj.message = quotedMessage.
  qm.imageMessage.fakeObj = { message: qm }
  const out = relayContentFromQuoted(qm)
  assert.ok(out && out.content.imageMessage, 'harus tetap menghasilkan imageMessage')
  assert.strictEqual('viewOnce' in out.content.imageMessage, false)
  assert.strictEqual(out.content.imageMessage.fakeObj, undefined, 'helper fakeObj tidak boleh ikut di-relay')
  assert.ok(Buffer.isBuffer(out.content.imageMessage.mediaKey))
})

for (const rel of [
  'node_modules/@whiskeysockets/baileys/src/Socket/messages-recv.js',
  'node_modules/@whiskeysockets/baileys/src/index.bundle.cjs',
]) {
  test('deklarasi earlyRvoResponse sebelum pemakaian: ' + path.basename(rel), () => {
    const s = fs.readFileSync(path.join(ROOT, rel), 'utf8')
    const use = s.indexOf('earlyRvoResponse = await requestPlaceholderResend')
    const decl = s.indexOf('let earlyRvoResponse = null')
    if (use < 0 && decl < 0) return
    assert.ok(use >= 0, 'pemakaian tidak ditemukan')
    assert.ok(decl >= 0, 'deklarasi tidak ditemukan')
    assert.ok(decl < use, `deklarasi (${decl}) harus sebelum pemakaian (${use}) — TDZ`)
  })
}

if (!failures) console.log('RVO_STACK_REGRESSION_OK')
else { console.log('RVO_STACK_REGRESSION_FAIL'); process.exitCode = 1 }
