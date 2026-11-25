'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const tests = []
let failed = false

function test(name, fn) {
  tests.push({ name, fn })
}

function stub(id, exports) {
  const resolved = require.resolve(id)
  require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports }
  return resolved
}

function restore(id, saved) {
  const resolved = require.resolve(id)
  if (saved) require.cache[resolved] = saved
  else delete require.cache[resolved]
}

function clear(id) {
  delete require.cache[require.resolve(id)]
}

test('pickIzukaDownloadUrl menolak payload rusak tanpa melempar', () => {
  const { pickIzukaDownloadUrl } = require('../lib/yt-browser')
  assert.strictEqual(pickIzukaDownloadUrl({ result: { download_url: 'https://yotomp3.com/a.mp3' } }), 'https://yotomp3.com/a.mp3')
  assert.strictEqual(pickIzukaDownloadUrl({ result: { url: 'http://x.test/b.mp3' } }), 'http://x.test/b.mp3')
  assert.strictEqual(pickIzukaDownloadUrl({ result: { downloadUrl: 'https://x.test/c.mp3' } }), 'https://x.test/c.mp3')
  assert.strictEqual(pickIzukaDownloadUrl({ download_url: '  https://x.test/d.mp3  ' }), 'https://x.test/d.mp3')
  assert.strictEqual(pickIzukaDownloadUrl({ result: {} }), null)
  assert.strictEqual(pickIzukaDownloadUrl({ result: { download_url: undefined } }), null)
  assert.strictEqual(pickIzukaDownloadUrl({ result: { download_url: 123 } }), null)
  assert.strictEqual(pickIzukaDownloadUrl(null), null)
  assert.strictEqual(pickIzukaDownloadUrl('string'), null)
})

async function providerChain() {
  const saved = {
    axios: require.cache[require.resolve('axios')],
    browser: require.cache[require.resolve('../lib/yt-browser')],
    nodeFetch: require.cache[require.resolve('node-fetch')],
    ydl: require.cache[require.resolve('../fitur/youtubedl')]
  }
  let mode = 'ok'
  let apiCalls = 0
  const browserCalls = []
  try {
    stub('axios', {
      get: async (url) => {
        apiCalls++
        if (String(url).includes('oembed')) return { data: { title: 'Judul Dari oEmbed' } }
        assert.ok(String(url).includes('my.izuka-api.xyz'), 'request download harus ke Izuka')
        if (mode === 'broken') return { data: { result: { title: 'Tanpa link' } } }
        return { data: { result: { title: 'Lagu Test', download_url: 'https://yotomp3.com/download-file/x_192kbps' } } }
      },
      post: async () => { throw new Error('offline') }
    })
    stub('../lib/yt-browser', {
      pickIzukaDownloadUrl: (d) => (d?.result?.download_url || null),
      fetchBuffer: async (u) => {
        browserCalls.push(u)
        return { status: 200, type: 'audio/mpeg', buffer: Buffer.alloc(2048, 1) }
      }
    })
    stub('node-fetch', async () => { throw new Error('offline') })
    clear('../fitur/youtubedl')

    const { ytmp3 } = require('../fitur/youtubedl')
    const res = await ytmp3('https://www.youtube.com/watch?v=JKwgz21y3So')
    assert.strictEqual(apiCalls, 2, 'Izuka + oEmbed dipanggil sekali_each')
    assert.strictEqual(browserCalls.length, 1, 'browser fetch dipanggil sekali')
    assert.ok(Buffer.isBuffer(res.buffer) && res.buffer.length >= 1024, 'hasil harus membawa buffer audio')
    assert.strictEqual(res.title, 'Judul Dari oEmbed')
    assert.strictEqual(res.source, 'izuka-browser')

    mode = 'broken'
    browserCalls.length = 0
    const callsBeforeRetry = apiCalls
    let message = ''
    try { await ytmp3('https://www.youtube.com/watch?v=JKwgz21y3So') } catch (e) { message = e?.message || String(e) }
    assert.ok(apiCalls - callsBeforeRetry >= 3, 'Izuka harus retry saat gagal')
    assert.ok(message.includes('Semua server audio gagal'), 'harus error jelas: ' + message)
    assert.ok(!/undefined/i.test(message), 'tidak boleh membocorkan error undefined')
    assert.strictEqual(browserCalls.length, 0, 'tidak ada fetch saat API tidak memberi link')
  } finally {
    restore('axios', saved.axios)
    restore('../lib/yt-browser', saved.browser)
    restore('node-fetch', saved.nodeFetch)
    restore('../fitur/youtubedl', saved.ydl)
  }
}
test('ytmp3 memakai provider Izuka + buffer, error rusak tidak menyingkap undefined', providerChain)

async function pluginBuffer() {
  const savedYdl = require.cache[require.resolve('../fitur/youtubedl')]
  const savedPlugin = require.cache[require.resolve('../plugins/cmd/ytmp3')]
  const previousDb = global.db
  try {
    const bytes = Buffer.from('audio-bytes-dari-browser')
    stub('../fitur/youtubedl', { ytmp3: async () => ({ title: 'Judul', buffer: bytes, downloadUrl: 'https://yotomp3.com/x.mp3' }) })
    clear('../plugins/cmd/ytmp3')
    const plugin = require('../plugins/cmd/ytmp3')
    const sender = '6285@s.whatsapp.net'
    global.db = { users: { [sender]: { limit: 10 } } }
    const sent = []
    const alya = { sendMessage: async (_chat, msg) => { sent.push(msg) } }
    await plugin.run(alya, { chat: 'chat@g.us', key: {}, sender }, {
      text: 'https://youtu.be/JKwgz21y3So', prefix: '.', command: 'ytmp3', replyalya: async () => {}
    })
    const audioMsg = sent.find((s) => s.audio)
    assert.ok(audioMsg, 'harus mengirim pesan audio')
    assert.ok(Buffer.isBuffer(audioMsg.audio), 'audio harus dikirim sebagai buffer')
    assert.strictEqual(audioMsg.audio, bytes)
    assert.strictEqual(global.db.users[sender].limit, 8, 'limit dipotong setelah audio terkirim')
  } finally {
    restore('../fitur/youtubedl', savedYdl)
    restore('../plugins/cmd/ytmp3', savedPlugin)
    global.db = previousDb
  }
}
test('plugin ytmp3 mengirim buffer dan memotong limit setelah sukses', pluginBuffer)

async function pluginFailure() {
  const savedYdl = require.cache[require.resolve('../fitur/youtubedl')]
  const savedPlugin = require.cache[require.resolve('../plugins/cmd/ytmp3')]
  const previousDb = global.db
  try {
    stub('../fitur/youtubedl', { ytmp3: async () => { throw new Error('Semua server audio gagal') } })
    clear('../plugins/cmd/ytmp3')
    const plugin = require('../plugins/cmd/ytmp3')
    const sender = '6285@s.whatsapp.net'
    global.db = { users: { [sender]: { limit: 10 } } }
    await plugin.run({ sendMessage: async () => {} }, { chat: 'c', key: {}, sender }, {
      text: 'https://youtu.be/JKwgz21y3So', prefix: '.', command: 'ytmp3', replyalya: async () => {}
    })
    assert.strictEqual(global.db.users[sender].limit, 10, 'limit tidak boleh terpotong saat gagal')
  } finally {
    restore('../fitur/youtubedl', savedYdl)
    restore('../plugins/cmd/ytmp3', savedPlugin)
    global.db = previousDb
  }
}
test('plugin ytmp3 tidak memotong limit saat download gagal', pluginFailure)

test('alya.js menormalkan body sebelum dipakai slice', () => {
  const src = fs.readFileSync(path.join(ROOT, 'alya.js'), 'utf8')
  assert.ok(src.includes("const bodyRaw = (m.mtype === 'conversation')"), 'bodyRaw harus ada')
  assert.ok(src.includes("const body = typeof bodyRaw === 'string' ? bodyRaw : ''"), 'normalisasi body harus ada')
})

;(async () => {
  for (const { name, fn } of tests) {
    try {
      await fn()
      console.log('  ok  ' + name)
    } catch (e) {
      failed = true
      console.log('  FAIL ' + name + ': ' + (e?.message || e))
    }
  }
  console.log(failed ? 'YT_DOWNLOAD_TEST_FAIL' : 'YT_DOWNLOAD_TEST_OK')
  if (failed) process.exitCode = 1
})()
