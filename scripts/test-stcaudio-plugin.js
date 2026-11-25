'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const plugin = require('../plugins/cmd/stcaudio')
const registry = require('../plugins/cmd_registry.json')
const helperPath = require.resolve('../lib/sticker-audio')

function stubHelper (overrides = {}) {
  const calls = { extract: 0, send: 0, fallback: false }
  require.cache[helperPath] = {
    id: helperPath,
    filename: helperPath,
    loaded: true,
    exports: {
      extractSoundStickerMedia: async (video) => {
        calls.extract++
        calls.video = video
        return { image: Buffer.from('WEBPIMAGE'), audio: Buffer.from('OGGAUDIO') }
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

async function test (name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main () {
  await test('stcaudio terdaftar di registry dan plugin', async () => {
    assert.strictEqual(registry.stcaudio, 'plugins/cmd/stcaudio.js')
    assert.ok(plugin.command.includes('stcaudio'))
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

  await test('video lebih dari 30 detik -> pesan error', async () => {
    const calls = stubHelper()
    const s = setup({ quoted: { mtype: 'videoMessage', msg: { videoMessage: {}, seconds: 31 }, download: async () => Buffer.from('VIDEO') } })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.some(t => /Maksimal 30 detik/.test(t)), JSON.stringify(s.replied))
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

  await test('helper mengirim sticker dengan audio tersemat', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const sent = []
    const conn = {
      sendMessage: async (jid, content, opts) => {
        sent.push({ jid, content, opts })
        return { key: { id: 'SENT' } }
      }
    }
    const result = await helper.sendSoundSticker(conn, 'jid', { image: Buffer.from('WEBPIMAGE'), audio: Buffer.from('OGGAUDIO') }, { key: { id: 'Q' } }, { stickerOptions: { packname: 'Alya' } })
    assert.strictEqual(result.fallback, false)
    assert.strictEqual(sent.length, 1)
    assert.strictEqual(sent[0].content.sticker.toString(), 'WEBPIMAGE')
    assert.strictEqual(sent[0].content.stickerAudio.toString(), 'OGGAUDIO')
    assert.strictEqual(sent[0].content.packname, 'Alya')
    assert.strictEqual(sent[0].opts.quoted.key.id, 'Q')
  })

  await test('helper fallback ke stiker visual saat sound sticker ditolak', async () => {
    delete require.cache[helperPath]
    const helper = require('../lib/sticker-audio')
    const sent = []
    const conn = {
      sendMessage: async (jid, content, opts) => {
        sent.push({ jid, content, opts })
        if (sent.length === 1) throw new Error('unsupported stickerAudio')
        return { key: { id: 'SENT' } }
      }
    }
    const result = await helper.sendSoundSticker(conn, 'jid', { image: Buffer.from('WEBPIMAGE'), audio: Buffer.from('OGGAUDIO') }, { key: { id: 'Q' } })
    assert.strictEqual(result.fallback, true)
    assert.strictEqual(sent.length, 2)
    assert.ok(!sent[1].content.stickerAudio)
    assert.strictEqual(sent[1].content.sticker.toString(), 'WEBPIMAGE')
  })

  await test('plugin dan helper tidak punya komentar kode', async () => {
    for (const file of ['../plugins/cmd/stcaudio.js', '../lib/sticker-audio.js']) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf-8')
      assert.ok(!/^\s*\/\//m.test(source) && !/^\s*\/\*/m.test(source), file + ' tidak boleh punya komentar kode')
    }
  })

  delete require.cache[helperPath]
  if (!process.exitCode) console.log('STCAUDIO_PLUGIN_TEST_OK')
  else console.log('STCAUDIO_PLUGIN_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
