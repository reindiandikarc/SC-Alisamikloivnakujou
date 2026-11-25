'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '..', 'node_modules', '@whiskeysockets', 'baileys')
const bundlePath = path.join(base, 'src', 'index.bundle.cjs')
const esmPath = path.join(base, 'src', 'Utils', 'messages.js')

async function test (name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main () {
  const bundle = fs.readFileSync(bundlePath, 'utf-8')
  const esm = fs.readFileSync(esmPath, 'utf-8')

  await test('patch marker hadir di bundle dan ESM', async () => {
    assert.ok(bundle.includes('ALYA_SOUND_STICKER_PATCH'))
    assert.ok(esm.includes('ALYA_SOUND_STICKER_PATCH'))
    assert.ok(bundle.includes('w.uint32(210)'))
    assert.ok(bundle.includes('case 26:'))
  })

  await test('bundle mendukung audioStickerMessage field 134', async () => {
    assert.ok(bundle.includes('Message.prototype.audioStickerMessage'))
    assert.ok(bundle.includes('w.uint32(1074)'))
    assert.ok(bundle.includes('case 134:'))
  })

  await test('patch script menjaga marker RVO', async () => {
    const patcher = fs.readFileSync(path.join(__dirname, 'patch-baileys-sticker-audio.py'), 'utf-8')
    assert.ok(patcher.includes('marker_counts'))
    assert.ok(patcher.includes('check_markers_unchanged'))
  })

  await test('proto field 26 encode/decode bertahan', async () => {
    const baileys = require('@whiskeysockets/baileys')
    const proto = baileys.proto
    const message = proto.Message.fromObject({
      stickerMessage: {
        audioMessage: { url: 'https://example.invalid/audio', mimetype: 'audio/ogg; codecs=opus' }
      }
    })
    const encoded = proto.Message.encode(message).finish()
    const decoded = proto.Message.decode(encoded)
    assert.ok(decoded.stickerMessage && decoded.stickerMessage.audioMessage)
    assert.strictEqual(decoded.stickerMessage.audioMessage.mimetype, 'audio/ogg; codecs=opus')
    assert.strictEqual(decoded.stickerMessage._audioMessage, 'audioMessage')
  })

  await test('getter oneof audio dan mediaKeyDomain saling independen', async () => {
    const proto = require('@whiskeysockets/baileys').proto
    const sticker = proto.Message.StickerMessage.create({})
    sticker.mediaKeyDomain = 1
    sticker.audioMessage = { mimetype: 'audio/ogg; codecs=opus' }
    assert.strictEqual(sticker._mediaKeyDomain, 'mediaKeyDomain')
    assert.strictEqual(sticker._audioMessage, 'audioMessage')
    assert.strictEqual(sticker.mediaKeyDomain, 1)
  })

  await test('proto field 134 encode/decode bertahan dengan audio bersarang', async () => {
    const proto = require('@whiskeysockets/baileys').proto
    const message = proto.Message.fromObject({
      audioStickerMessage: {
        message: {
          stickerMessage: {
            mimetype: 'image/webp',
            isAnimated: true,
            width: 512,
            height: 512,
            audioMessage: {
              url: 'https://example.invalid/audio',
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true,
              seconds: 4
            }
          }
        }
      }
    })
    const encoded = proto.Message.encode(message).finish()
    const decoded = proto.Message.decode(encoded)
    const sticker = decoded.audioStickerMessage?.message?.stickerMessage
    assert.ok(sticker, 'sticker bersarang hilang')
    assert.strictEqual(sticker.width, 512)
    assert.strictEqual(sticker.isAnimated, true)
    assert.ok(sticker.audioMessage)
    assert.strictEqual(sticker.audioMessage.mimetype, 'audio/ogg; codecs=opus')
    assert.strictEqual(sticker.audioMessage.ptt, true)
  })

  await test('prepareWAMessageMedia menyisipkan audio ke stickerMessage', async () => {
    const baileys = require('@whiskeysockets/baileys')
    const logger = { debug () {}, info () {}, warn () {}, error () {} }
    const options = {
      logger,
      upload: async () => ({ mediaUrl: 'https://example.invalid/media', directPath: '/media' }),
      mediaCache: { get: async () => null, set: async () => {} }
    }
    const prepared = await baileys.prepareWAMessageMedia({
      sticker: Buffer.from('WEBPIMAGE'),
      stickerAudio: Buffer.from('OGGAUDIO')
    }, options)
    assert.ok(prepared.stickerMessage)
    assert.ok(prepared.stickerMessage.audioMessage)
    assert.strictEqual(prepared.stickerMessage.audioMessage.mimetype, 'audio/ogg; codecs=opus')
    assert.strictEqual(prepared.stickerMessage.audioMessage.ptt, true)
    assert.ok(!Object.prototype.hasOwnProperty.call(prepared.stickerMessage, 'stickerAudio'))
  })

  if (!process.exitCode) console.log('BAILEYS_STICKER_AUDIO_TEST_OK')
  else console.log('BAILEYS_STICKER_AUDIO_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
