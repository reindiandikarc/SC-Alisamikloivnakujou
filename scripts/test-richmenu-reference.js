#!/usr/bin/env node
// Offline parity/regression test untuk .menu rich.
// Tidak memakai WhatsApp live: sock.relayMessage dan sendMessage di-stub.
// Menjalankan generator milik Hitoshi & vanXone, lalu generator kita dengan input yang sama,
// membandingkan payload yang benar-benar dikirim, dan memastikan .menu/.allmenu SELALU
// menghasilkan pesan teks yang terlihat bila rich gagal / mode text.

'use strict'

const assert = require('assert')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const REF_HITOSHI = '/data/tmp/opencode/sc-sources/hitoshi/merged'
const REF_VANXONE = '/data/workspace/vanXone-V4/vanXone V4'

const richui = require(path.join(ROOT, 'lib/rich/richui.cjs'))
const uimode = require(path.join(ROOT, 'lib/rich/uimode.cjs'))
const richmenu = require(path.join(ROOT, 'lib/richmenu.js'))

global.botname = global.botname || 'Alya Bot'
global.footer = global.footer || ''
global.uiBanner = false // samakan HTML ketiga generator (tidak ada banner lokal)
global.db = { users: {} }
global.ownernomer = '6281234567890'
global.tele = 'alyaofficial'
global.ig = 'alya.bot'

const JID = '6281234567890@s.whatsapp.net'
const SENDER = '6281234567890@s.whatsapp.net'
const m = {
  chat: JID,
  sender: SENDER,
  pushName: 'Uji',
  key: { remoteJid: JID, participant: SENDER, id: 'AABBCCDDEEFF0011' },
  message: { extendedTextMessage: { text: '.menu' } },
}

const pass = (name, extra = '') => console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`)

function stubSock(mode = 'ok') {
  const calls = []
  const sock = {
    calls,
    public: true,
    profilePictureUrl: async () => { throw new Error('offline: tanpa avatar') },
    sendMessage: async (jid, content, opts) => {
      calls.push({ kind: 'sendMessage', jid, content, opts })
      return { key: { remoteJid: jid, id: 'text-' + calls.length, fromMe: true } }
    },
    relayMessage: async (jid, message, options = {}) => {
      calls.push({ kind: 'relayMessage', jid, message, options })
      if (mode === 'reject') throw new Error('offline: relay ditolak')
      if (mode === 'silent') return undefined
      return options.messageId || 'relay-' + calls.length
    },
  }
  return sock
}

function richOf(call) {
  const msg = call.message || {}
  const rr =
    msg?.botForwardedMessage?.message?.richResponseMessage ||
    msg?.botForwardedMessage?.richResponseMessage ||
    msg?.richResponseMessage ||
    msg?.botForwardedMessage?.message?.protocolMessage?.editedMessage?.message?.richResponseMessage ||
    msg?.botForwardedMessage?.message?.protocolMessage?.editedMessage?.botForwardedMessage?.message?.richResponseMessage
  if (!rr) return null
  const data = Buffer.isBuffer(rr.unifiedResponse?.data)
    ? rr.unifiedResponse.data
    : Buffer.from(String(rr.unifiedResponse?.data || ''), 'base64')
  let unified = null
  try { unified = JSON.parse(data.toString('utf8')) } catch {}
  return { rr, msg, data, b64: data.toString('base64'), unified, options: call.options || {} }
}

function wireBytes(html) {
  return Buffer.byteLength(
    JSON.stringify(String(html)).replace(/[\u007f-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')),
    'utf8'
  )
}

function checkStructure(name, rep) {
  assert.ok(rep, `${name}: tidak ada richResponseMessage`)
  assert.ok(rep.unified, `${name}: unifiedResponse.data bukan JSON yang bisa dibaca`)
  assert.strictEqual(rep.unified.sections?.[0]?.view_model?.__typename, 'GenAISingleLayoutViewModel', `${name}: layout view_model berubah`)
  const prim = rep.unified.sections[0].view_model.primitive
  assert.strictEqual(prim?.__typename, 'GenAIaeacdsnwHtmlPrimitive', `${name}: primitive bukan HTML`)
  assert.ok(prim.payload && prim.payload.includes('<div'), `${name}: payload HTML kosong`)
  assert.ok(Array.isArray(prim.trusted_sources), `${name}: trusted_sources tidak ada`)
  assert.strictEqual(rep.unified.response_id, rep.msg.messageContextInfo?.botMetadata?.botResponseId, `${name}: response_id tidak cocok dengan botResponseId`)
  assert.strictEqual(rep.unified.response_id, rep.options.messageId, `${name}: response_id tidak cocok dengan messageId`)
  assert.strictEqual(rep.rr.messageType, 1, `${name}: messageType bukan 1`)
  assert.strictEqual(rep.rr.contextInfo?.forwardOrigin, 4, `${name}: forwardOrigin bukan 4`)
  assert.ok(rep.rr.contextInfo?.forwardedAiBotMessageInfo?.botJid, `${name}: botJid tidak ada`)
  assert.strictEqual(rep.rr.submessages?.[0]?.messageType, 2, `${name}: submessage bukan teks`)
}

function cardData() {
  const { groups, order, totals } = richmenu.collect(false)
  const cats = order.map((c) => ({
    id: c,
    icon: 'ℹ️', label: c.toUpperCase(), desc: `${groups[c].length} perintah`,
    hot: false,
    items: groups[c].slice(0, 8).map((it) => ({ i: 'ℹ️', c: it.c, d: it.d || '' })),
  }))
  return {
    prefix: '.', start: 'home', cat: '', link: '',
    user: {
      greeting: 'Selamat Malam', name: 'Uji', status: 'MEMBER', chat: 'Pribadi', avatar: '',
      level: 1, pct: 7, exp: '7', expNeed: '100', money: 'Rp0', bank: 'Rp0',
      limit: 'Free', rank: 0, rankTotal: 1,
    },
    info: {
      mode: 'Public', users: 1, total: totals.total, caseTotal: totals.caseTotal,
      pluginTotal: totals.pluginTotal, uptime: 12,
    },
    legal: null,
    cats,
  }
}

async function referenceRun(name, modulePath) {
  const ui = require(modulePath)
  const sock = stubSock('ok')
  const card = ui.menuApp(cardData())
  await ui.sendHtml(sock, JID, card.html, card.label)
  const relay = sock.calls.filter((c) => c.kind === 'relayMessage')
  const rep = richOf(relay[0])
  checkStructure(name, rep)
  assert.strictEqual(relay.length, 1, `${name}: reference mengirim ${relay.length} stanza`)
  const prim = rep.unified.sections[0].view_model.primitive
  assert.strictEqual(prim.payload, card.html, `${name}: payload HTML tidak sama dengan HTML generator`)
  return {
    name,
    htmlBytes: Buffer.byteLength(card.html),
    b64: rep.b64.length,
    wire: wireBytes(card.html),
    relay: relay.length,
    rep,
  }
}

// Plugin dijalankan dengan ctx stub; tidak ada jaringan, tidak ada WA.
async function runMenuPlugin(file, sock, capture) {
  const axiosPath = require.resolve('axios')
  const realAxios = require.cache[axiosPath] ? require.cache[axiosPath].exports : null
  require.cache[axiosPath] = {
    id: axiosPath, filename: axiosPath, loaded: true, children: [], paths: [],
    exports: { get: async () => { throw new Error('offline: weather dilewati') } },
  }
  try {
    delete require.cache[require.resolve(path.join(ROOT, 'plugins/cmd', file))]
    const plugin = require(path.join(ROOT, 'plugins/cmd', file))
    const ctx = {
      prefix: '.', pushname: 'Uji',
      Ryuu: false, isPrem: false, isOwn: false, isPT: false,
      isAdminP: false, isReseller: false,
      reply: async (t) => { capture.texts.push(String(t)) },
      replyalya: async (t) => { capture.texts.push(String(t)) },
      replytolak: async (t) => { capture.texts.push(String(t)) },
      listbut2: async (jid, text, list, msg) => { capture.legacy.push({ file, jid, text, list, msg }) },
      listbut3: async (jid, text, list, msg) => { capture.legacy.push({ file, jid, text, list, msg }) },
      alyaFitur: () => 1500,
      runtime: () => '1d 0h 0m 0s',
      user: { money: 0, bank: 0, limit: 0 },
    }
    await plugin.run(sock, m, ctx)
  } finally {
    if (realAxios) require.cache[axiosPath].exports = realAxios
    else delete require.cache[axiosPath]
  }
}

function checkLegacy(file, capture, label) {
  const sent = capture.legacy.filter((x) => x.file === file)
  assert.ok(sent.length, `${label}: tidak ada pesan menu legacy`)
  const text = String(sent[0].text || '')
  assert.ok(text.length > 200, `${label}: body menu legacy terlalu pendek (${text.length} char)`)
  assert.ok(sent[0].list?.sections?.length > 0 || sent[0].list?.title, `${label}: interactive list kosong`)
}

;(async () => {
  const savedIsRich = uimode.isRich
  const savedWarn = console.warn
  const warnings = []
  console.warn = (...a) => { warnings.push(a.map(String).join(' ')) }

  try {
    // ── 1. Generator referensi ───────────────────────────────────────────────
    const hitoshi = await referenceRun('Hitoshi', path.join(REF_HITOSHI, 'lib/rich/richui.cjs'))
    const vanXone = await referenceRun('vanXone', path.join(REF_VANXONE, 'lib/richui.js'))
    pass('reference generator Hitoshi & vanXone', `HTML ${hitoshi.htmlBytes}/${vanXone.htmlBytes} B, unified b64 ${hitoshi.b64}/${vanXone.b64} char`)
    assert.strictEqual(hitoshi.rep.unified.response_id.length, 36)
    assert.strictEqual(vanXone.rep.unified.response_id.length, 36)

    // ── 2. Generator kita dengan input identik ───────────────────────────────
    const ourUiSock = stubSock('ok')
    const ourCard = richui.menuApp(cardData())
    await richui.sendHtml(ourUiSock, JID, ourCard.html, ourCard.label)
    const ourRelay = ourUiSock.calls.filter((c) => c.kind === 'relayMessage')
    assert.ok(ourRelay.length >= 2, `kita: hanya satu stanza relay (${ourRelay.length}); Android butuh pesan utama + edit type 14`)
    const ourMain = richOf(ourRelay[0])
    checkStructure('kita', ourMain)
    assert.strictEqual(ourMain.unified.sections[0].view_model.primitive.payload, ourCard.html, 'kita: payload HTML tidak sama dengan HTML generator')
    const edit = richOf(ourRelay[1])
    assert.ok(edit, 'kita: stanza kedua bukan rich edit')
    assert.strictEqual(edit.msg.botForwardedMessage?.message?.protocolMessage?.type, 14, 'kita: edit bukan protocolMessage type 14')
    assert.strictEqual(edit.unified?.sections?.[0]?.view_model?.primitive?.__typename, 'GenAIaeacdsnwHtmlPrimitive', 'kita: edit primitive berubah')
    assert.strictEqual(edit.unified.response_id, ourMain.unified.response_id, 'kita: response_id edit tidak sama dengan pesan utama')
    const html = ourMain.unified.sections[0].view_model.primitive.payload
    const wire = wireBytes(html)
    console.log(`INFO sizes: ours HTML=${Buffer.byteLength(html)}B wire=${wire}B b64=${ourMain.b64.length}ch | Hitoshi HTML=${hitoshi.htmlBytes}B b64=${hitoshi.b64}ch | vanXone HTML=${vanXone.htmlBytes}B b64=${vanXone.b64}ch`)
    assert.ok(wire < 900 * 1024, `kita: wire ${wire} B melebihi batas aman 900KB`)
    pass('payload parity + dua stanza + response_id linkage', `relay=${ourRelay.length}, edit type=14`)

    // ── 3. Sock fake-silent / reject tidak boleh membuat .menu hening ───────
    uimode.isRich = () => true
    for (const mode of ['reject', 'silent']) {
      for (const file of ['menu.js', 'allmenu.js']) {
        const sock = stubSock(mode)
        const capture = { legacy: [], texts: [] }
        await runMenuPlugin(file, sock, capture)
        checkLegacy(file, capture, `rich-${mode}/${file}`)
      }
    }
    pass('rich reject + silent fallback', '.menu/.allmenu tetap kirim menu legacy')

    // ── 4. Mode text: pesan legacy harus keluar ──────────────────────────────
    uimode.isRich = () => false
    for (const file of ['menu.js', 'allmenu.js']) {
      const sock = stubSock('ok')
      const capture = { legacy: [], texts: [] }
      await runMenuPlugin(file, sock, capture)
      checkLegacy(file, capture, `text/${file}`)
      assert.ok(!sock.calls.some((c) => c.kind === 'relayMessage'), `text/${file}: masih ada relay kartu`)
      assert.ok(sock.calls.some((c) => c.kind === 'sendMessage'), `text/${file}: tidak ada sendMessage sama sekali`)
    }
    pass('mode text', 'legacy sendMessage + listbut2/listbut3 terpanggil')

    // ── 5. Default uimode harus text (rich opt-in) ───────────────────────────
    const dbMode = JSON.parse(require('fs').readFileSync(path.join(ROOT, 'database/uimode.json'), 'utf8')).mode
    assert.strictEqual(dbMode, 'text', 'database/uimode.json harus text secara default')
    pass('default uimode = text', '.uimode rich = opt-in')

    console.log('ALL PASS')
  } finally {
    uimode.isRich = savedIsRich
    console.warn = savedWarn
    void warnings
  }
})().catch((err) => {
  console.error('FAIL', err && err.stack ? err.stack : err)
  process.exitCode = 1
})
