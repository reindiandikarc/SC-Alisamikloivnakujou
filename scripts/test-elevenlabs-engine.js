'use strict'
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const engine = require('../machine/interactive_ai')
const originalFetch = global.fetch

function jsonResponse(status, payload) {
  return {
    ok: true,
    status,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(payload),
  }
}

function audioResponse(size = 3000) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'audio/mpeg' },
    arrayBuffer: async () => Buffer.from('A'.repeat(size)).buffer,
  }
}

function test(name, fn) {
  try { fn(); console.log('  ok  ' + name) }
  catch (e) { console.log('  FAIL ' + name + ': ' + (e?.message || e)); process.exitCode = 1 }
}

async function main() {
  try {
    const urls = []
    global.fetch = async (url) => { urls.push(String(url)); return jsonResponse(429, { status: 429, message: 'limit reached' }) }
    let err = null
    try { await engine.generateVoice('halo', { voice: 'bella', strict: true, raw: true }) }
    catch (e) { err = e }
    test('strict: JSON error dilempar dengan status dan apiError', () => {
      assert.ok(err, 'harus throw')
      assert.strictEqual(err.status, 429)
      assert.strictEqual(err.apiError, true)
      assert.ok(urls[0].includes('voice=bella'))
      assert.strictEqual(urls.length, 1, 'strict tidak boleh coba voice lain')
    })

    urls.length = 0
    global.fetch = async (url) => { urls.push(String(url)); return audioResponse() }
    const buf = await engine.generateVoice('halo dunia', { voice: 'bella', strict: true, raw: true, speed: 0.9 })
    test('strict: audio berhasil, voice sesuai permintaan, teks tidak diubah', () => {
      assert.ok(Buffer.isBuffer(buf))
      assert.strictEqual(urls.length, 1)
      assert.ok(urls[0].includes('voice=bella'))
      assert.ok(urls[0].includes('speed=0.9') && !urls[0].includes('speed=0.95'), urls[0])
      assert.ok(urls[0].includes('text=halo%20dunia'))
    })

    urls.length = 0
    global.fetch = async (url) => {
      urls.push(String(url))
      return urls.length === 1 ? jsonResponse(429, { status: 429, message: 'limit' }) : audioResponse()
    }
    const fallbackBuf = await engine.generateVoice('halo dunia')
    test('non-strict: fallback voice tetap bekerja seperti sebelumnya', () => {
      assert.ok(Buffer.isBuffer(fallbackBuf))
      assert.ok(urls.length >= 2)
      assert.ok(urls[0].includes('voice='))
      assert.ok(urls[1].includes('voice='))
    })

    const source = fs.readFileSync(path.join(__dirname, '..', 'machine', 'interactive_ai.js'), 'utf-8')
    test('auto AI menerima tool voice legacy dan meneruskan voice ke TTS', () => {
      assert.ok(/case\s+'voice':\s*case\s+'kirim_suara':/.test(source), 'harus ada case voice')
      assert.ok(/generateVoice\(speakText,\s*\{\s*voice:/.test(source), 'harus meneruskan opts.voice')
    })
  } finally {
    global.fetch = originalFetch
  }

  if (!process.exitCode) console.log('ELEVENLABS_ENGINE_TEST_OK')
  else console.log('ELEVENLABS_ENGINE_TEST_FAIL')
}

main().catch(e => { console.error(e); process.exitCode = 1 })
