'use strict'
const assert = require('assert')
const Module = require('module')
const path = require('path')

const registry = require('../plugins/cmd_registry.json')
const calls = []
const RESULT = Buffer.from('IMAGE-RESULT')

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === 'axios') {
    return {
      post: async (url) => { calls.push({ kind: 'upload', url }); return { data: { data: { url: 'https://tmpfiles.org/dl/foto.jpg' } } } },
      get: async (url) => { calls.push({ kind: 'api', url }); return { data: RESULT } },
    }
  }
  if (request === 'form-data') {
    return class FormData {
      append() {}
      getHeaders() { return {} }
    }
  }
  return originalLoad.apply(this, arguments)
}

const hitam = require('../plugins/cmd/tohitam')
const putih = require('../plugins/cmd/toputih')
Module._load = originalLoad

function setup(command) {
  const sent = []
  const replied = []
  const alaya = {
    sendMessage: async (jid, content, opts) => { sent.push({ jid, content, opts }); return { key: { id: 'SENT' } } },
  }
  const m = {
    chat: '6285602845943@s.whatsapp.net',
    sender: '6285602845943@s.whatsapp.net',
    key: { id: 'CMD-JADI' },
    message: {},
    quoted: {
      mimetype: 'image/jpeg',
      download: async () => Buffer.from('IMAGE-SOURCE'),
    },
    reply: async (t) => { replied.push(String(t)) },
  }
  const ctx = { prefix: '.', command, isPrem: false }
  return { alaya, m, ctx, sent, replied }
}

async function test(name, fn) {
  try { await fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main() {
  await test('registry memetakan jadihitam/jadiputih ke plugin yang ada', async () => {
    assert.strictEqual(registry.jadihitam, 'plugins/cmd/tohitam.js')
    assert.strictEqual(registry.jadiputih, 'plugins/cmd/toputih.js')
    assert.ok(hitam.command.includes('jadihitam'))
    assert.ok(putih.command.includes('jadiputih'))
  })

  await test('.jadihitam memakai endpoint tohitam dan mengirim hasil', async () => {
    calls.length = 0
    const s = setup('jadihitam')
    await hitam.run(s.alaya, s.m, s.ctx)
    const api = calls.find(c => c.kind === 'api')
    assert.ok(api, 'harus ada panggilan API: ' + JSON.stringify(s.replied))
    assert.ok(api.url.includes('https://api-faa.my.id/faa/tohitam?url='), api.url)
    const image = s.sent.find(x => x.content?.image)
    assert.ok(image, 'harus kirim image')
    assert.strictEqual(image.content.caption, '✨ *Done Bujank*')
  })

  await test('.jadiputih memakai endpoint toputih dan mengirim hasil', async () => {
    calls.length = 0
    const s = setup('jadiputih')
    await putih.run(s.alaya, s.m, s.ctx)
    const api = calls.find(c => c.kind === 'api')
    assert.ok(api, 'harus ada panggilan API: ' + JSON.stringify(s.replied))
    assert.ok(api.url.includes('https://api-faa.my.id/faa/toputih?url='), api.url)
    assert.ok(s.sent.find(x => x.content?.image), 'harus kirim image')
  })

  await test('tanpa quote gambar -> petunjuk, tanpa API', async () => {
    calls.length = 0
    const s = setup('jadihitam')
    s.m.quoted = null
    await hitam.run(s.alaya, s.m, s.ctx)
    assert.strictEqual(calls.length, 0)
    assert.ok(s.replied.some(t => /Kirim\/reply gambar/.test(t)), JSON.stringify(s.replied))
  })

  await test('plugin bukan no-op', () => {
    assert.ok(hitam.run.length > 0 || /photoEdit/.test(hitam.run.toString()))
    assert.ok(putih.run.length > 0 || /photoEdit/.test(putih.run.toString()))
  })

  if (!process.exitCode) console.log('JADI_ALIAS_TEST_OK')
  else console.log('JADI_ALIAS_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
