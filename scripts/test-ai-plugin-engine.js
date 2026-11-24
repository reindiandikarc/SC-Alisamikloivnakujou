'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const pluginSrc = fs.readFileSync(path.join(ROOT, 'plugins/cmd/ai.js'), 'utf8')
const engineSrc = fs.readFileSync(path.join(ROOT, 'machine/interactive_ai.js'), 'utf8')

assert.ok(/runAIInteractive/.test(pluginSrc), 'plugin AI harus memakai engine runAIInteractive')
assert.ok(!/askBell\s*\(/.test(pluginSrc), 'plugin AI tidak boleh lagi memakai askBell')
assert.ok(!/askAI\s*\(/.test(pluginSrc), 'plugin AI tidak boleh lagi memakai askAI')
assert.ok(engineSrc.includes("cmd: 'kirim_stiker'"), 'engine harus menyediakan tool kirim_stiker')
assert.ok(engineSrc.includes('sendImageAsSticker'), 'engine harus benar-benar bisa kirim stiker')

const handlerSrc = fs.readFileSync(path.join(ROOT, 'alya.js'), 'utf8')
const autoStart = handlerSrc.indexOf('ChatAlya1.includes(m.chat)')
const autoEnd = handlerSrc.indexOf('if (!global.alisaDisabled && m.isGroup && !m.key.fromMe && isAutosimi)')
assert.ok(autoStart > 0 && autoEnd > autoStart, 'blok auto-AI ChatAlya1 tidak ditemukan')
const autoBlock = handlerSrc.slice(autoStart, autoEnd)
assert.ok(/runAIInteractive/.test(autoBlock), 'auto-AI ChatAlya1 harus memakai engine yang bisa kirim stiker')
assert.ok(!/gemmy\.chat/.test(autoBlock), 'auto-AI ChatAlya1 tidak boleh lagi memakai gemmy.chat')

const plugin = require('../plugins/cmd/ai')

const called = []
const ctx = {
  text: 'terusin',
  pushname: 'User',
  botNumber: '6285181813279@s.whatsapp.net',
  from: '120363430503081796@g.us',
  sender: '6285602845943@s.whatsapp.net',
  runAIInteractive: async (opts) => { called.push(opts) },
}

const m = {
  key: { fromMe: false },
  fromMe: false,
  isBaileys: false,
  isGroup: true,
  mtype: 'conversation',
  chat: ctx.from,
  sender: ctx.sender,
  pushName: 'User',
  mentionedJid: [],
  quoted: {
    sender: '151376843796631@lid',
    text: 'Hmph, lagi? Kamu kalau cuma bilang halo mulu...',
    id: 'DBCA05E7A19E791366AA74317E579324',
  },
}

;(async () => {
  await plugin.run({
    user: {
      id: '6285181813279:9@s.whatsapp.net',
      lid: '151376843796631:9@lid',
    },
  }, m, ctx)

  assert.strictEqual(called.length, 1, 'plugin harus memanggil engine tepat sekali')
  const opts = called[0]
  assert.strictEqual(opts.m, m)
  assert.strictEqual(opts.from, ctx.from)
  assert.strictEqual(opts.sender, ctx.sender)
  assert.strictEqual(opts.pushname, ctx.pushname)
  assert.strictEqual(opts.isGroup, true)
  assert.ok(opts.body.includes('terusin'), 'body harus memuat pertanyaan user')
  assert.ok(opts.body.includes('Kamu kalau cuma bilang halo'), 'body harus memuat konteks reply ke AI')

  console.log('AI_PLUGIN_ENGINE_OK')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
