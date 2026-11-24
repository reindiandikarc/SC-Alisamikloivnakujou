// Regresi: jalur `<unavailable>` harus ditangani di socket layer seperti
// ryuuxalya/Alya v13, sebelum decrypt/category filter, dengan messageKey
// LENGKAP (senderPn/senderLid/participantLid) untuk PDO.
import assert from 'node:assert/strict'
import fs from 'node:fs'

const root = new URL('../node_modules/@whiskeysockets/baileys/src/', import.meta.url)
const files = [
  new URL('Socket/messages-recv.js', root),
  new URL('index.bundle.cjs', root),
]

let failures = 0
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const checks = [
    [/ALYA_V13_EARLY_RVO_PATCH/, 'marker patch'],
    [/getBinaryNodeChild\(node, ['"]unavailable['"]\) && !encNode/, 'early unavailable guard'],
    [/decodeMessageNode\(node, authState\.creds\.me\.id, authState\.creds\.me\.lid \|\| ['"]['"]/, 'decode key untuk PDO'],
    [/requestPlaceholderResend\(earlyKey/, 'PDO memakai key lengkap'],
    [/messageStubParameters = \[NO_MESSAGE_FOUND_ERROR_TEXT, earlyRvoResponse\]/, 'requestId ikut stub'],
  ]
  for (const [re, name] of checks) {
    try { assert.match(src, re); console.log(`  ok  ${file.pathname.split('/').pop()}: ${name}`) }
    catch (e) { failures++; console.log(`  FAIL ${file.pathname.split('/').pop()}: ${name}`) }
  }
}

if (!failures) console.log('BAILEYS_V13_EARLY_RVO_TEST_OK')
else { console.log('BAILEYS_V13_EARLY_RVO_TEST_FAIL'); process.exitCode = 1 }
