// Offline test: perilaku Alya v13 yang sudah di-port ke Baileys fork kita.
// Menjalankan kode ESM asli (bukan bundle) supaya patch benar-benar diuji.
import assert from 'node:assert/strict'
import { decryptMessageNode, NO_MESSAGE_FOUND_ERROR_TEXT } from '../node_modules/@whiskeysockets/baileys/src/Utils/decode-wa-message.js'

const ME = '6285181813279@s.whatsapp.net'
const ME_LID = '151376843796631@lid'
const PN = '6285602845943@s.whatsapp.net'
const LID = '153863378178296@lid'

const logger = { debug() {}, warn() {}, error() {}, info() {} }
const repo = {}

function stanza(attrs = {}, content = []) {
  return {
    attrs: { id: 'AC177E0373C9DB5C3D8AFD922FAF8A09', t: '1763979097', ...attrs },
    content,
  }
}

async function decode(attrs, content) {
  const node = decryptMessageNode(stanza(attrs, content), ME, ME_LID, repo, logger)
  await node.decrypt()
  return node
}

let failures = 0
async function test(name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { failures++; console.log('  FAIL ' + name + ': ' + (e?.message || e)) }
}

await test('view_once placeholder: LID dinormalisasi ke PN + stub auto-resend', async () => {
  const { fullMessage } = await decode(
    { from: LID, sender_pn: PN, category: 'peer' },
    [{ tag: 'unavailable', attrs: { type: 'view_once' } }],
  )
  assert.equal(fullMessage.key.remoteJid, PN)
  assert.equal(fullMessage.key.senderPn, PN)
  assert.equal(fullMessage.key.isViewOnce, true)
  assert.notEqual(fullMessage.messageStubType, undefined) // CIPHERTEXT
  assert.equal(fullMessage.messageStubParameters[0], NO_MESSAGE_FOUND_ERROR_TEXT)
})

await test('tanpa sender_pn: LID tetap dipakai (fallback aman)', async () => {
  const { fullMessage } = await decode(
    { from: LID, category: 'peer' },
    [{ tag: 'unavailable', attrs: { type: 'view_once' } }],
  )
  assert.equal(fullMessage.key.remoteJid, LID)
  assert.equal(fullMessage.key.isViewOnce, true)
  assert.equal(fullMessage.messageStubParameters[0], NO_MESSAGE_FOUND_ERROR_TEXT)
})

await test('grup tidak berubah oleh normalisasi PN', async () => {
  const group = '120363380388430434@g.us'
  const { fullMessage } = await decode(
    { from: group, participant: LID, category: 'peer' },
    [{ tag: 'unavailable', attrs: { type: 'view_once' } }],
  )
  assert.equal(fullMessage.key.remoteJid, group)
  assert.equal(fullMessage.key.participant, LID)
})

if (!failures) console.log('BAILEYS_V13_RVO_TEST_OK')
else { console.log('BAILEYS_V13_RVO_TEST_FAIL'); process.exitCode = 1 }
