'use strict'

const assert = require('assert')
const { smsg } = require('../lib/myfunc')
const quoteFlags = require('../lib/quote-flags')
const { relayContentFromQuoted } = require('../lib/rvo-relay')
const { extractMedia, findContextInfo, downloadFromMediaObj } = require('../lib/rvo-extract')

const CHAT = '120363424132521336@newsletter'
const SENDER = '6285602845943@s.whatsapp.net'
const ID = 'VO_REPLY_CHAIN'

const conn = {
  user: { id: '628111111111@s.whatsapp.net' },
  decodeJid: (jid) => String(jid || '').split(':')[0],
  downloadMediaMessage: async () => { throw new Error('media tidak tersedia') }
}
const store = { loadMessage: async () => null }

function setupGlobals () {
  global._rvoCache = new Map()
  global._rvoCacheMeta = new Map()
  global._mediaCache = {}
  global._rawBackup = new Map()
  global._viewonceBuffer = { get: () => null, latest: () => null, put: () => {} }
  global._rvoPending = new Map()
  global.db = { users: { [SENDER]: { limit: 10 } } }
}

function quotedViewOncePtv () {
  return {
    viewOnceMessageV2: {
      message: {
        ptvMessage: {
          mimetype: 'video/mp4',
          viewOnce: true,
          seconds: 7,
          caption: 'asli',
          mediaKey: Buffer.from(Array.from({ length: 32 }, (_, i) => i + 1)),
          directPath: '/v/vo-ptv.enc',
          fileLength: '9000'
        }
      }
    }
  }
}

function questionReplyCommand () {
  return {
    key: { id: 'CMD_VO_REPLY', remoteJid: CHAT, participant: SENDER, fromMe: false },
    message: {
      questionReplyMessage: {
        message: {
          extendedTextMessage: {
            text: '.rvo',
            previewType: 'NONE',
            contextInfo: {
              stanzaId: ID,
              participant: SENDER,
              remoteJid: CHAT,
              questionReplyQuotedMessage: {
                serverQuestionId: 1138,
                quotedQuestion: {
                  questionMessage: {
                    message: quotedViewOncePtv()
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

async function test (name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main () {
  await test('smsg membuka wrapper questionReplyMessage sehingga command terbaca', async () => {
    setupGlobals()
    const m = smsg(conn, questionReplyCommand(), store)
    assert.strictEqual(m.type, 'extendedTextMessage')
    assert.strictEqual(m.body, '.rvo')
  })

  await test('smsg menemukan media sekali lihat pada quote questionReplyMessage', async () => {
    setupGlobals()
    const m = smsg(conn, questionReplyCommand(), store)
    assert.ok(m.quoted, 'quoted tidak ditemukan')
    assert.strictEqual(m.quoted.mtype, 'videoMessage')
    assert.strictEqual(m.quoted.mimetype, 'video/mp4')
    assert.strictEqual(m.quoted.isViewOnce, true)
    assert.strictEqual(m.quoted.seconds, 7)
  })

  await test('flag dispatcher melihat quote PTV 1x pada questionReplyMessage', async () => {
    setupGlobals()
    const m = smsg(conn, questionReplyCommand(), store)
    const flags = quoteFlags.resolve(m)
    assert.strictEqual(flags.isQuotedVideo, true)
    assert.strictEqual(flags.isQuotedViewOnce, true)
  })

  await test('findContextInfo membaca contextInfo di dalam questionReplyMessage', async () => {
    const m = questionReplyCommand()
    const ci = findContextInfo(m)
    assert.ok(ci, 'contextInfo tidak ditemukan')
    assert.strictEqual(ci.stanzaId, ID)
    assert.ok(ci.questionReplyQuotedMessage, 'quote asli tidak ikut')
  })

  await test('relay .rvo menerima PTV sekali lihat sebagai video biasa', async () => {
    const relay = relayContentFromQuoted(quotedViewOncePtv())
    assert.ok(relay, 'relay tidak dibuat untuk ptvMessage')
    assert.ok(relay.content.videoMessage, 'PTV harus dinormalkan ke videoMessage')
    assert.strictEqual(relay.content.videoMessage.viewOnce, undefined)
    assert.strictEqual(relay.hadViewOnce, true)
    assert.ok(relay.content.videoMessage.mediaKey, 'mediaKey asli harus terbawa')
  })

  await test('relay .rvo menerima PTV dari questionReplyQuotedMessage', async () => {
    const ci = findContextInfo(questionReplyCommand())
    const relay = relayContentFromQuoted(ci.questionReplyQuotedMessage)
    assert.ok(relay, 'relay gagal membaca quote bersarang')
    assert.ok(relay.content.videoMessage)
  })

  await test('extractMedia membaca node ptvMessage sebagai video', async () => {
    const extract = extractMedia({ ptvMessage: { mimetype: 'video/mp4', mediaKey: Buffer.from('k') } })
    assert.ok(extract, 'node PTV tidak dikenali')
    assert.strictEqual(extract.mediaType, 'videoMessage')
  })

  await test('media publik tanpa mediaKey tetap bisa diunduh dari URL', async () => {
    const node = { mimetype: 'image/jpeg', url: 'https://example.invalid/publik.jpg' }
    const failing = async () => { throw new Error('Media Key tidak ditemukan') }
    const plain = async (url) => Buffer.from('PUBLIK:' + url)
    const buffer = await downloadFromMediaObj(node, 'imageMessage', failing, plain)
    assert.strictEqual(buffer.toString(), 'PUBLIK:https://example.invalid/publik.jpg')
  })

  if (!process.exitCode) console.log('VIEWONCE_REPLY_CHAIN_TEST_OK')
  else console.log('VIEWONCE_REPLY_CHAIN_TEST_FAIL')
  process.exit(process.exitCode || 0)
}

main().catch(e => { console.error(e); process.exit(1) })
