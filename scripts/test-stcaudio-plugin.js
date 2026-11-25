'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')
const { promisify } = require('util')
const execFile = promisify(require('child_process').execFile)

const plugin = require('../plugins/cmd/stcaudio')
const registry = require('../plugins/cmd_registry.json')
const helperPath = require.resolve('../lib/sticker-audio')

function stubHelper (overrides = {}) {
  const calls = { extract: 0, extractAnimated: 0, send: 0, fallback: false }
  require.cache[helperPath] = {
    id: helperPath,
    filename: helperPath,
    loaded: true,
    exports: {
      STICKER_AUDIO_LIMITS: { videoSeconds: 20, audioSeconds: 20, rejectSeconds: 20 },
      extractSoundStickerMedia: async (video, opts) => {
        calls.extract++
        calls.video = video
        calls.extractOpts = opts
        return { image: Buffer.from('WEBPIMAGE'), audio: Buffer.from('OGGAUDIO') }
      },
      extractAnimatedStickerMedia: async (video, opts) => {
        calls.extractAnimated++
        calls.video = video
        calls.extractAnimatedOpts = opts
        return { image: Buffer.from('WEBPIMAGE'), width: 512, height: 512 }
      },
      sendSoundSticker: overrides.sendSoundSticker || (async (conn, jid, media, quoted, opts) => {
        calls.send++
        calls.jid = jid
        calls.media = media
        calls.quoted = quoted
        calls.opts = opts
        return { response: { key: { id: 'SENT' } }, fallback: calls.fallback }
      })
    }
  }
  return calls
}

function setup (overrides = {}) {
  const sent = []
  const replied = []
  const plain = []
  global.db = { users: { '6285602845943@s.whatsapp.net': { limit: 5 } } }
  global.packname = 'Alya'
  global.author = 'Alya'
  const alaya = {
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: 'SENT' } }
    }
  }
  const m = {
    chat: '6285602845943@s.whatsapp.net',
    sender: '6285602845943@s.whatsapp.net',
    key: { id: 'CMD-STCAUDIO' },
    message: {}
  }
  const ctx = {
    prefix: '.',
    command: 'stcaudio',
    mime: 'video/mp4',
    reply: async (t) => { plain.push(String(t)) },
    replyalya: async (t) => { replied.push(String(t)) },
    quoted: {
      mtype: 'videoMessage',
      msg: { videoMessage: {}, seconds: 5 },
      download: async () => Buffer.from('FAKEVIDEO')
    },
    ...overrides
  }
  return { alaya, m, ctx, sent, replied, plain }
}

function makeSampleVideo () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stcaudio-fixture-'))
  const file = path.join(dir, 'source.mp4')
  const bin = require('ffmpeg-static')
  execFileSync(bin, [
    '-y', '-loglevel', 'error',
    '-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=15',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
    '-shortest', '-t', '2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
    file
  ])
  return fs.readFileSync(file)
}

function webpChunks (buf) {
  const chunks = []
  let offset = 12
  while (offset + 8 <= buf.length) {
    const fourcc = buf.toString('ascii', offset, offset + 4)
    const size = buf.readUInt32LE(offset + 4)
    chunks.push({ fourcc, payload: buf.subarray(offset + 8, offset + 8 + size) })
    offset += 8 + size + (size % 2)
  }
  return chunks
}

async function test (name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main () {
  await test('stcaudio terdaftar di registry dan plugin', async () => {
    assert.strictEqual(registry.stcaudio, 'plugins/cmd/stcaudio.js')
    assert.ok(plugin.command.includes('stcaudio'))
  })

  await test('stcvideo terdaftar di registry dan plugin', async () => {
    assert.ok(fs.existsSync(path.join(__dirname, '../plugins/cmd/stcvideo.js')), 'plugin stcvideo belum ada')
    const videoPlugin = require('../plugins/cmd/stcvideo')
    assert.strictEqual(registry.stcvideo, 'plugins/cmd/stcvideo.js')
    assert.strictEqual(registry.stcv, 'plugins/cmd/stcvideo.js')
    assert.ok(videoPlugin.command.includes('stcvideo'))
  })

  await test('helper menetapkan batas default 20 detik', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    assert.strictEqual(helper.STICKER_AUDIO_LIMITS.videoSeconds, 20)
    assert.strictEqual(helper.STICKER_AUDIO_LIMITS.audioSeconds, 20)
    assert.strictEqual(helper.STICKER_AUDIO_LIMITS.rejectSeconds, 20)
  })

  await test('stcaudio memakai batas 20 detik saat memanggil extractor', async () => {
    const calls = stubHelper()
    const s = setup()
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(calls.extractOpts.maxVideoSeconds, 20)
    assert.strictEqual(calls.extractOpts.maxAudioSeconds, 20)
  })

  await test('stcvideo tanpa reply -> instruksi, helper tidak dipanggil', async () => {
    const calls = stubHelper()
    const videoPlugin = require('../plugins/cmd/stcvideo')
    const s = setup({ command: 'stcvideo', quoted: null })
    await videoPlugin.run(s.alaya, s.m, { ...s.ctx, command: 'stcvideo' })
    assert.ok(s.plain.join('\n').includes('.stcvideo'))
    assert.strictEqual(calls.extractAnimated, 0)
    assert.strictEqual(global.db.users[s.m.sender].limit, 5)
  })

  await test('stcvideo reply video -> stiker animasi tanpa audio, limit dipotong', async () => {
    const calls = stubHelper()
    const videoPlugin = require('../plugins/cmd/stcvideo')
    const s = setup({ command: 'stcvideo' })
    await videoPlugin.run(s.alaya, s.m, { ...s.ctx, command: 'stcvideo' })
    assert.strictEqual(calls.extractAnimated, 1)
    assert.strictEqual(calls.extract, 0)
    assert.strictEqual(calls.extractAnimatedOpts.maxVideoSeconds, 20)
    assert.ok(s.sent.some(x => x.content?.sticker?.toString() === 'WEBPIMAGE'))
    assert.ok(!s.sent.some(x => x.content?.audio), 'stcvideo tidak boleh mengirim audio')
    assert.ok(s.sent.some(x => x.content?.react?.text === '⏳'))
    assert.ok(s.sent.some(x => x.content?.react?.text === '✅'))
    assert.strictEqual(global.db.users[s.m.sender].limit, 4)
  })

  await test('stcvideo menolak video lebih dari 20 detik', async () => {
    const calls = stubHelper()
    const videoPlugin = require('../plugins/cmd/stcvideo')
    const s = setup({
      command: 'stcvideo',
      quoted: { mtype: 'videoMessage', msg: { videoMessage: {}, seconds: 21 }, download: async () => Buffer.from('VIDEO') }
    })
    await videoPlugin.run(s.alaya, s.m, { ...s.ctx, command: 'stcvideo' })
    assert.ok(s.replied.some(t => /Maksimal 20 detik/.test(t)), JSON.stringify(s.replied))
    assert.strictEqual(calls.extractAnimated, 0)
  })

  await test('tanpa reply -> instruksi, helper tidak dipanggil', async () => {
    const calls = stubHelper()
    const s = setup({ quoted: null })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.plain.join('\n').includes('.stcaudio'))
    assert.strictEqual(calls.extract, 0)
    assert.strictEqual(global.db.users[s.m.sender].limit, 5)
  })

  await test('reply bukan video -> pesan error', async () => {
    const calls = stubHelper()
    const s = setup({ mime: 'audio/ogg', quoted: { mtype: 'audioMessage', msg: { audioMessage: {} }, download: async () => Buffer.from('AUDIO') } })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.some(t => /Harus reply video/.test(t)), JSON.stringify(s.replied))
    assert.strictEqual(calls.extract, 0)
  })

  await test('video lebih dari 20 detik -> pesan error', async () => {
    const calls = stubHelper()
    const s = setup({ quoted: { mtype: 'videoMessage', msg: { videoMessage: {}, seconds: 21 }, download: async () => Buffer.from('VIDEO') } })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.some(t => /Maksimal 20 detik/.test(t)), JSON.stringify(s.replied))
    assert.strictEqual(calls.extract, 0)
  })

  await test('limit tidak cukup -> pesan error', async () => {
    const calls = stubHelper()
    const s = setup()
    global.db.users[s.m.sender].limit = 0
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.some(t => /Limit kamu tidak cukup/.test(t)), JSON.stringify(s.replied))
    assert.strictEqual(calls.extract, 0)
  })

  await test('video valid -> sound sticker terkirim dan limit dipotong', async () => {
    const calls = stubHelper()
    const s = setup()
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(calls.extract, 1)
    assert.strictEqual(calls.send, 1)
    assert.ok(Buffer.isBuffer(calls.video))
    assert.strictEqual(calls.media.image.toString(), 'WEBPIMAGE')
    assert.strictEqual(calls.media.audio.toString(), 'OGGAUDIO')
    assert.strictEqual(calls.quoted, s.m)
    assert.strictEqual(calls.opts.stickerOptions.packname, 'Alya')
    assert.ok(s.sent.some(x => x.content?.react?.text === '⏳'))
    assert.ok(s.sent.some(x => x.content?.react?.text === '✅'))
    assert.strictEqual(global.db.users[s.m.sender].limit, 4)
  })

  await test('sound sticker ditolak -> fallback stiker visual + catatan', async () => {
    const calls = stubHelper()
    calls.fallback = true
    const s = setup()
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.some(t => /stiker visual saja/.test(t)), JSON.stringify(s.replied))
    assert.strictEqual(global.db.users[s.m.sender].limit, 4)
  })

  await test('konversi gagal -> error, limit tidak dipotong', async () => {
    const originalError = console.error
    console.error = () => {}
    const calls = stubHelper({
      sendSoundSticker: async () => { throw new Error('ffmpeg gagal') }
    })
    const s = setup()
    await plugin.run(s.alaya, s.m, s.ctx)
    console.error = originalError
    assert.ok(s.replied.some(t => /Gagal membuat sticker audio/.test(t)), JSON.stringify(s.replied))
    assert.strictEqual(global.db.users[s.m.sender].limit, 5)
  })

  await test('helper relay sound sticker lewat wrapper field 134', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const relayed = []
    const conn = {
      user: { id: 'bot@s.whatsapp.net' },
      userJid: 'bot@s.whatsapp.net',
      relayMessage: async (jid, message, opts) => {
        relayed.push({ jid, message, opts })
        return {}
      }
    }
    const prepared = {
      stickerMessage: { mimetype: 'image/webp', width: 512, height: 512, isAnimated: true },
      audioMessage: { mimetype: 'audio/ogg; codecs=opus', ptt: true, seconds: 2 }
    }
    const result = await helper.sendSoundSticker(conn, 'jid', { image: Buffer.from('WEBPIMAGE'), audio: Buffer.from('OGGAUDIO') }, { key: { id: 'Q', remoteJid: 'jid', fromMe: true }, message: { conversation: 'video' } }, { prepared })
    assert.strictEqual(result.fallback, false)
    assert.strictEqual(relayed.length, 1)
    assert.ok(relayed[0].message.audioStickerMessage)
    assert.ok(!relayed[0].message.stickerMessage)
    const nested = relayed[0].message.audioStickerMessage.message.stickerMessage
    assert.strictEqual(nested.width, 512)
    assert.strictEqual(nested.height, 512)
    assert.strictEqual(nested.isAnimated, true)
    assert.strictEqual(nested.audioMessage.ptt, true)
  })

  await test('helper fallback ke stiker visual saat relay ditolak', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const sent = []
    const conn = {
      user: { id: 'bot@s.whatsapp.net' },
      userJid: 'bot@s.whatsapp.net',
      relayMessage: async () => { throw new Error('unsupported audioStickerMessage') },
      sendMessage: async (jid, content, opts) => {
        sent.push({ jid, content, opts })
        return { key: { id: 'SENT' } }
      }
    }
    const prepared = {
      stickerMessage: { mimetype: 'image/webp', width: 512, height: 512, isAnimated: true },
      audioMessage: { mimetype: 'audio/ogg; codecs=opus', ptt: true, seconds: 2 }
    }
    const result = await helper.sendSoundSticker(conn, 'jid', { image: Buffer.from('WEBPIMAGE'), audio: Buffer.from('OGGAUDIO') }, { key: { id: 'Q', remoteJid: 'jid', fromMe: true }, message: { conversation: 'video' } }, { prepared })
    assert.strictEqual(result.fallback, true)
    assert.strictEqual(sent.length, 1)
    assert.strictEqual(sent[0].content.sticker.toString(), 'WEBPIMAGE')
  })

  await test('buildSoundStickerMessage bertahan encode/decode proto', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const proto = require('@whiskeysockets/baileys').proto
    const conn = {
      user: { id: 'bot@s.whatsapp.net' },
      userJid: 'bot@s.whatsapp.net'
    }
    const prepared = {
      stickerMessage: { mimetype: 'image/webp', width: 512, height: 512, isAnimated: true },
      audioMessage: { mimetype: 'audio/ogg; codecs=opus', ptt: true, seconds: 2 }
    }
    const waMsg = helper.buildSoundStickerMessage(conn, prepared, { key: { id: 'Q', remoteJid: 'jid', fromMe: true }, message: { conversation: 'video' } })
    const decoded = proto.Message.decode(proto.Message.encode(waMsg.message).finish())
    assert.ok(decoded.audioStickerMessage)
    assert.ok(decoded.audioStickerMessage.message.stickerMessage.audioMessage)
    assert.strictEqual(decoded.audioStickerMessage.message.stickerMessage.audioMessage.ptt, true)
  })

  await test('extractor menghasilkan WebP animasi 512x512 dengan EXIF', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const media = await helper.extractSoundStickerMedia(makeSampleVideo(), { pack: 'Alya', author: 'Alya' })
    assert.strictEqual(media.image.toString('ascii', 0, 4), 'RIFF')
    assert.strictEqual(media.image.toString('ascii', 8, 12), 'WEBP')
    const chunks = webpChunks(media.image)
    const vp8x = chunks.find(c => c.fourcc === 'VP8X')
    const exif = chunks.find(c => c.fourcc === 'EXIF')
    assert.ok(vp8x, 'VP8X tidak ada')
    assert.ok(vp8x.payload[0] & 0x02, 'flag animasi tidak aktif')
    assert.strictEqual(vp8x.payload.readUIntLE(4, 3) + 1, 512)
    assert.strictEqual(vp8x.payload.readUIntLE(7, 3) + 1, 512)
    assert.ok(exif, 'EXIF tidak ada')
    assert.ok(exif.payload.toString('utf8').includes('sticker-pack-id'))
    assert.strictEqual(media.width, 512)
    assert.strictEqual(media.height, 512)
  })

  await test('extractor menghasilkan Opus mono 32 kbps dua pass', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const media = await helper.extractSoundStickerMedia(makeSampleVideo())
    const headAt = media.audio.indexOf(Buffer.from('OpusHead'))
    assert.ok(headAt >= 0, 'OpusHead tidak ada')
    assert.strictEqual(media.audio[headAt + 9], 1)
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stcaudio-opus-'))
    const file = path.join(dir, 'audio.ogg')
    fs.writeFileSync(file, media.audio)
    const bin = helper.ffmpegPath()
    const result = await execFile(bin, ['-hide_banner', '-i', file, '-f', 'null', '-'], { maxBuffer: 4 * 1024 * 1024 })
    const info = result.stderr
    assert.ok(/mono/.test(info), info)
    const rate = info.match(/(\d+(?:\.\d+)?) kb\/s/)
    assert.ok(rate, info)
    assert.ok(Number(rate[1]) <= 40, 'bitrate ' + rate[1] + ' kb/s')
  })

  await test('extractor bisa menghasilkan stiker animasi tanpa audio', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const media = await helper.extractAnimatedStickerMedia(makeSampleVideo(), { pack: 'Alya', author: 'Alya' })
    assert.strictEqual(media.image.toString('ascii', 0, 4), 'RIFF')
    assert.strictEqual(media.audio, null)
    assert.strictEqual(media.animated, true)
  })

  await test('plugin dan helper tidak punya komentar kode', async () => {
    for (const file of ['../plugins/cmd/stcaudio.js', '../plugins/cmd/stcvideo.js', '../lib/sticker-audio.js']) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf-8')
      assert.ok(!/^\s*\/\//m.test(source) && !/^\s*\/\*/m.test(source), file + ' tidak boleh punya komentar kode')
    }
  })

  delete require.cache[helperPath]
  if (!process.exitCode) console.log('STCAUDIO_PLUGIN_TEST_OK')
  else console.log('STCAUDIO_PLUGIN_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
