'use strict'
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const plugin = require('../plugins/cmd/elevenlabs')
const registry = require('../plugins/cmd_registry.json')

function setup(overrides = {}) {
  const sent = []
  const replied = []
  const ttsCalls = []
  const presence = []
  const alaya = {
    sendMessage: async (jid, content, opts) => { sent.push({ jid, content, opts }); return { key: { id: 'SENT' } } },
    sendPresenceUpdate: async (state, jid) => { presence.push({ state, jid }) },
  }
  const m = {
    chat: '6285602845943@s.whatsapp.net',
    sender: '6285602845943@s.whatsapp.net',
    key: { id: 'CMD-ELEVEN' },
    message: {},
  }
  const ctx = {
    prefix: '.',
    command: 'elevenlabs',
    text: 'bella|halo dunia',
    q: 'bella|halo dunia',
    replyalya: async (t) => { replied.push(String(t)) },
    generateVoice: async (text, opts) => {
      ttsCalls.push({ text, opts })
      return Buffer.from('AUDIOTEST-' + text)
    },
    getVoiceList: () => ['prabowo', 'bella', 'adam', 'echilling'],
    ...overrides,
  }
  return { alaya, m, ctx, sent, replied, ttsCalls, presence }
}

async function test(name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main() {
  await test('elevenlabs terdaftar di registry dan plugin', async () => {
    assert.strictEqual(registry.elevenlabs, 'plugins/cmd/elevenlabs.js')
    for (const alias of ['elevenlabs', 'eleven', 'ttsel']) {
      assert.ok(plugin.command.includes(alias), alias + ' harus ada di command array')
    }
  })

  await test('tanpa argumen -> daftar voice, tanpa TTS', async () => {
    const s = setup({ text: '', q: '' })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.join('\n').includes('List voice models:'))
    assert.ok(s.replied.join('\n').includes('Contoh: .elevenlabs prabowo|halo'))
    assert.strictEqual(s.ttsCalls.length, 0)
    assert.strictEqual(s.sent.length, 0)
  })

  await test('voice tidak dikenal -> daftar voice, tanpa TTS', async () => {
    const s = setup({ text: 'unknown|halo', q: 'unknown|halo' })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.join('\n').includes('List voice models:'))
    assert.strictEqual(s.ttsCalls.length, 0)
  })

  await test('elevenlabs bella|halo -> audio PTT dengan voice diminta', async () => {
    const s = setup()
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(s.ttsCalls.length, 1)
    assert.strictEqual(s.ttsCalls[0].text, 'halo dunia')
    assert.strictEqual(s.ttsCalls[0].opts.voice, 'bella')
    assert.strictEqual(s.ttsCalls[0].opts.strict, true)
    assert.strictEqual(s.ttsCalls[0].opts.raw, true)
    assert.strictEqual(s.presence.some(p => p.state === 'recording'), true)
    const audio = s.sent.find(x => x.content?.audio)
    assert.ok(audio, 'harus kirim audio: ' + JSON.stringify(s.replied))
    assert.strictEqual(audio.content.mimetype, 'audio/mpeg')
    assert.strictEqual(audio.content.ptt, true)
    assert.strictEqual(audio.opts.quoted, s.m)
  })

  await test('shortcut voice .bella halo -> voice bella', async () => {
    const s = setup({ command: 'bella', text: 'halo', q: 'halo' })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(s.ttsCalls.length, 1)
    assert.strictEqual(s.ttsCalls[0].opts.voice, 'bella')
    assert.strictEqual(s.ttsCalls[0].text, 'halo')
  })

  await test('teks dari quoted dipakai kalau tidak ada argumen', async () => {
    const s = setup({ text: 'bella|', q: 'bella|', quoted: { text: 'dari quote' } })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(s.ttsCalls.length, 1)
    assert.strictEqual(s.ttsCalls[0].text, 'dari quote')
  })

  await test('error API -> pesan status ala Bell, tanpa audio', async () => {
    const s = setup({
      generateVoice: async () => {
        const e = new Error('limit reached')
        e.status = 429
        e.apiError = true
        throw e
      },
    })
    await plugin.run(s.alaya, s.m, s.ctx)
    assert.ok(s.replied.some(t => /API RESPONSE STATUS: 429/.test(t)), JSON.stringify(s.replied))
    assert.ok(s.replied.some(t => /termai\.cc#pricing/.test(t)))
    assert.strictEqual(s.sent.length, 0)
  })

  await test('semua shortcut voice tidak menimpa command registry yang ada', async () => {
    const voices = ['prabowo', 'yanzgpt', 'bella', 'megawati', 'echilling', 'adam', 'thomas_shelby', 'michi_jkt48', 'nokotan', 'jokowi', 'boboiboy', 'keqing', 'anya', 'yanami_anna', 'maskhanid', 'myka', 'raiden', 'celzoid']
    for (const v of voices) {
      if (v === 'anya') continue
      assert.ok(plugin.command.includes(v), v + ' harus jadi shortcut')
    }
    assert.ok(!plugin.command.includes('anya'), 'anya sengaja dilewati (tabrakan command sticker)')
  })

  const source = fs.readFileSync(path.join(__dirname, '..', 'plugins', 'cmd', 'elevenlabs.js'), 'utf-8')
  assert.ok(!/^\s*\/\//m.test(source) && !/^\s*\/\*/m.test(source), 'plugin tidak boleh punya komentar kode')

  if (!process.exitCode) console.log('ELEVENLABS_PLUGIN_TEST_OK')
  else console.log('ELEVENLABS_PLUGIN_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
