'use strict'

const assert = require('assert')
const { scanForViewOnceMedia, findAnyMedia } = require('../lib/rvo-detect')
const { smsg } = require('../lib/myfunc')
const quoteFlags = require('../lib/quote-flags')

const CHAT = '120363425735076548@g.us'
const SENDER = '6285602845943@s.whatsapp.net'
const ID = 'VO_PTV_TEST'

const conn = {
  user: { id: '628111111111@s.whatsapp.net' },
  decodeJid: (jid) => String(jid || '').split(':')[0],
  downloadMediaMessage: async () => { throw new Error('media tidak tersedia') }
}
const store = { loadMessage: async () => null }

function ptvVoMessage () {
  return {
    viewOnceMessageV2: {
      message: {
        ptvMessage: {
          mimetype: 'video/mp4',
          viewOnce: true,
          seconds: 5,
          mediaKey: Buffer.from('kunci-asli'),
          fileEncSha256: Buffer.from('sha'),
          caption: '.stcaudio'
        }
      }
    }
  }
}

function incomingCommand () {
  return {
    key: { id: 'CMD_PTV', remoteJid: CHAT, participant: SENDER, fromMe: false },
    message: {
      extendedTextMessage: {
        text: '.stcaudio',
        contextInfo: {
          stanzaId: ID,
          participant: SENDER,
          remoteJid: CHAT,
          quotedMessage: {
            viewOnceMessageV2: {
              message: {
                ptvMessage: {
                  mimetype: 'video/mp4',
                  viewOnce: true,
                  seconds: 5,
                  jpegThumbnail: Buffer.from('thumb')
                }
              }
            }
          }
        }
      }
    }
  }
}

function setupGlobals () {
  global._rvoCache = new Map()
  global._rvoCacheMeta = new Map()
  global._viewonceBuffer = { get: () => null, latest: () => null, put: () => {} }
  global._mediaCache = {}
  global.db = { users: { [SENDER]: { limit: 10 } } }
}

const helperPath = require.resolve('../lib/sticker-audio')
function stubHelper () {
  const calls = { extract: 0, extractAnimated: 0, send: 0 }
  require.cache[helperPath] = {
    id: helperPath,
    filename: helperPath,
    loaded: true,
    exports: {
      STICKER_AUDIO_LIMITS: { videoSeconds: 20, audioSeconds: 20, rejectSeconds: 20 },
      extractSoundStickerMedia: async (video, opts) => {
        calls.extract++
        calls.extractOpts = opts
        return { image: Buffer.from('WEBP'), audio: Buffer.from('OGG') }
      },
      extractAnimatedStickerMedia: async (video, opts) => {
        calls.extractAnimated++
        calls.extractOpts = opts
        return { image: Buffer.from('WEBP'), audio: null, width: 512, height: 512 }
      },
      sendSoundSticker: async () => { calls.send++; return { response: {}, fallback: false } }
    }
  }
  return calls
}

async function test (name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main () {
  await test('detektor mengenali ptvMessage sekali lihat sebagai video', async () => {
    const message = ptvVoMessage()
    const vo = scanForViewOnceMedia(message)
    const any = findAnyMedia(message)
    assert.ok(vo, 'scanForViewOnceMedia tidak menemukan PTV')
    assert.strictEqual(vo.type, 'videoMessage')
    assert.ok(any, 'findAnyMedia tidak menemukan PTV')
    assert.strictEqual(any.type, 'videoMessage')
  })

  await test('smsg menormalkan pesan PTV sekali lihat menjadi video', async () => {
    setupGlobals()
    const m = smsg(conn, {
      key: { id: ID, remoteJid: CHAT, participant: SENDER },
      message: ptvVoMessage()
    }, store)
    assert.strictEqual(m.mtype, 'videoMessage')
    assert.strictEqual(m.type, 'videoMessage')
    assert.strictEqual(m.mime, 'video/mp4')
    assert.strictEqual(m.body, '.stcaudio')
  })

  await test('smsg menormalkan quote PTV sekali lihat untuk semua command', async () => {
    setupGlobals()
    const m = smsg(conn, incomingCommand(), store)
    assert.strictEqual(m.quoted.mtype, 'videoMessage')
    assert.strictEqual(m.quoted.mime, 'video/mp4')
    assert.strictEqual(m.quoted.isViewOnce, true)
    assert.strictEqual(m.quoted.seconds, 5)
  })

  await test('flag dispatcher melihat reply PTV sekali lihat sebagai video', async () => {
    setupGlobals()
    const m = smsg(conn, incomingCommand(), store)
    const flags = quoteFlags.resolve(m)
    assert.strictEqual(flags.type, 'extendedTextMessage')
    assert.strictEqual(flags.isQuotedVideo, true)
    assert.strictEqual(flags.isQuotedViewOnce, true)
    assert.strictEqual(flags.isVideo, false)
  })

  await test('stcaudio menerima quote PTV yang sudah dinormalkan', async () => {
    setupGlobals()
    const calls = stubHelper()
    const m = smsg(conn, incomingCommand(), store)
    m.quoted.download = async () => Buffer.from('FAKEVIDEO')
    const sent = []
    const replied = []
    const plugin = require('../plugins/cmd/stcaudio')
    await plugin.run({
      sendMessage: async (jid, content) => { sent.push(content); return { key: { id: 'SENT' } } }
    }, m, {
      prefix: '.',
      command: 'stcaudio',
      quoted: m.quoted,
      mime: m.quoted.mime,
      reply: async () => {},
      replyalya: async (t) => replied.push(String(t))
    })
    assert.strictEqual(calls.extract, 1)
    assert.strictEqual(calls.send, 1)
    assert.deepStrictEqual(replied, [])
  })

  await test('stcvideo menerima quote PTV yang sudah dinormalkan', async () => {
    setupGlobals()
    const calls = stubHelper()
    const m = smsg(conn, incomingCommand(), store)
    m.quoted.download = async () => Buffer.from('FAKEVIDEO')
    const sent = []
    const plugin = require('../plugins/cmd/stcvideo')
    await plugin.run({
      sendMessage: async (jid, content) => { sent.push(content); return { key: { id: 'SENT' } } }
    }, m, {
      prefix: '.',
      command: 'stcvideo',
      quoted: m.quoted,
      mime: m.quoted.mime,
      reply: async () => {},
      replyalya: async () => {}
    })
    assert.strictEqual(calls.extractAnimated, 1)
    assert.ok(sent.some(x => x.sticker?.toString() === 'WEBP'))
  })

  delete require.cache[helperPath]
  if (!process.exitCode) console.log('VIEWONCE_PTV_TEST_OK')
  else console.log('VIEWONCE_PTV_TEST_FAIL')
  process.exit(process.exitCode || 0)
}

main().catch(e => { console.error(e); process.exit(1) })
