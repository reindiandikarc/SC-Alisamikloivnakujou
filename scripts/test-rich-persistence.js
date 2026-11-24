#!/usr/bin/env node
// Offline regression test: kartu AI Rich harus tetap bisa dirender setelah chat
// dibuka ulang. Klien hanya mempertahankan richResponseMessage bila stanza
// membawa biz -> interactive native_flow (v:9, name:mixed). Edit type 14 hanya
// memberi render live; tanpa biz node, history reload kehilangan kartunya.

'use strict'

const assert = require('assert')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const richui = require(path.join(ROOT, 'lib/rich/richui.cjs'))
const { MessageBuilder } = require('@whiskeysockets/baileys')

global.botname = global.botname || 'Alya Bot'
global.footer = global.footer || ''
global.uiBanner = false

const JID = '6281234567890@s.whatsapp.net'
const HTML = '<div class="wrap"><div class="card">KARTU PERSISTEN <script>window.__X="e30="</script></div></div>'
const GAME_RESPONSE_ID = '11111111-2222-3333-4444-555555555555'
const pass = (name, extra = '') => console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`)

function stubSock() {
  const calls = []
  return {
    calls,
    public: true,
    logger: { warn() {}, debug() {} },
    e: { warn() {}, debug() {} },
    relayMessage: async (jid, message, options = {}) => {
      calls.push({ jid, message, options })
      return options.messageId || `relay-${calls.length}`
    },
  }
}

function hasRichBiz(call) {
  const nodes = Array.isArray(call.options?.additionalNodes) ? call.options.additionalNodes : []
  return nodes.some((node) =>
    node?.tag === 'biz' &&
    Array.isArray(node.content) &&
    node.content.some((child) =>
      child?.tag === 'interactive' &&
      child?.attrs?.type === 'native_flow' &&
      child?.attrs?.v === '1' &&
      Array.isArray(child.content) &&
      child.content.some((leaf) => leaf?.tag === 'native_flow' && leaf?.attrs?.v === '9' && leaf?.attrs?.name === 'mixed')
    )
  )
}

function richPayload(call) {
  const msg = call.message || {}
  const wrapper = msg.botForwardedMessage?.message || {}
  const protocol = wrapper.protocolMessage
  const rr = wrapper.richResponseMessage || protocol?.editedMessage?.botForwardedMessage?.message?.richResponseMessage || protocol?.editedMessage?.richResponseMessage
  if (!rr) return null
  const raw = rr.unifiedResponse?.data
  const data = Buffer.isBuffer(raw) ? raw : Buffer.from(String(raw || ''), 'base64')
  let unified = null
  try { unified = JSON.parse(data.toString('utf8')) } catch {}
  return {
    rr,
    unified,
    payload: unified?.sections?.[0]?.view_model?.primitive?.payload || '',
    protocol,
  }
}

// Simulasi "chat dibuka lagi": simulator history WhatsApp membuang stanza yang
// tidak punya biz handshake, lalu mengambil ulang payload dari sisa stanza.
function cardsAfterReopen(calls) {
  return calls.filter(hasRichBiz).map(richPayload).filter(Boolean)
}

async function menuScenario() {
  const sock = stubSock()
  const receipt = await richui.sendHtml(sock, JID, HTML, 'Menu Persisten')
  return { sock, responseId: receipt.key.id }
}

async function gameScenario() {
  assert.strictEqual(
    typeof richui.withRichBizClient,
    'function',
    'game: richui.withRichBizClient belum ada; AIRich.send() game masih mengirim stanza tanpa biz node'
  )
  const sock = stubSock()
  const AIRich = MessageBuilder.AIRich
  const rich = new AIRich(richui.withRichBizClient(sock), { dynamic: false })
  rich.setResponseId(GAME_RESPONSE_ID)
  rich.setBotResponseId(GAME_RESPONSE_ID)
  rich.addSection(
    AIRich.newLayout('Single', {
      __typename: 'GenAIaeacdsnwHtmlPrimitive',
      payload: HTML,
      trusted_sources: [],
    }),
    { text: 'Game Persisten' }
  )
  await rich.send(JID, { messageId: GAME_RESPONSE_ID })
  return { sock, responseId: GAME_RESPONSE_ID }
}

async function verify(name, scenario) {
  const { sock, responseId } = await scenario()
  const relays = sock.calls.filter((c) => c.jid === JID)
  assert.strictEqual(relays.length, 2, `${name}: harus ada 2 stanza (main + edit), dapat ${relays.length}`)
  relays.forEach((call, index) => {
    assert.ok(hasRichBiz(call), `${name}: stanza ${index} tidak punya biz native_flow v9 mixed`)
  })

  const edit = richPayload(relays[1])
  assert.ok(edit?.protocol, `${name}: stanza kedua bukan protocolMessage edit`)
  assert.strictEqual(edit.protocol.type, 14, `${name}: edit bukan type 14`)
  assert.strictEqual(edit.protocol.key.id, responseId, `${name}: edit tidak menargetkan id pesan utama`)

  const cards = cardsAfterReopen(relays)
  assert.ok(cards.length >= 1, `${name}: setelah reopen tidak ada kartu yang tersisa`)
  assert.ok(
    cards.every((card) => card.payload === HTML),
    `${name}: payload kartu setelah reopen tidak sama dengan HTML asli`
  )
  pass(name, `relay=${relays.length}, survive-reopen=${cards.length}, edit.type=14`)
}

;(async () => {
  await verify('menu card', menuScenario)
  await verify('game card', gameScenario)
  console.log('ALL PASS')
})().catch((err) => {
  console.error('FAIL', err && err.stack ? err.stack : err)
  process.exitCode = 1
})
