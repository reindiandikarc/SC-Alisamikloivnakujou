'use strict'






const assert = require('assert')
const AI = require('../machine/interactive_ai')

const BOT = '153863378178296@s.whatsapp.net'
const LID = '153863378178296@lid'

function msg(extra = {}) {
  return {
    mtype: 'conversation',
    key: { fromMe: false },
    isBaileys: false,
    isGroup: true,
    quoted: null,
    mentionedJid: [],
    ...extra,
  }
}

function triggered(m, body = 'Hmm', isAutoAiGc = true) {
  return AI.isAITriggered({ body, m, botNumber: BOT, isAutoAiGc })
}

assert.strictEqual(typeof AI.isReplyToBot, 'function', 'isReplyToBot helper harus diekspor')
assert.strictEqual(typeof AI.resolveAIPrompt, 'function', 'resolveAIPrompt helper harus diekspor')


const qLid = { sender: LID, fromMe: false, text: 'aku tadi bilang apa?' }
assert.strictEqual(AI.isReplyToBot(msg({ quoted: qLid }), BOT), true,
  'reply dengan JID @lid harus dikenali sebagai reply ke bot')
assert.strictEqual(triggered(msg({ quoted: qLid })), true,
  'AI harus terpicu oleh reply @lid saat status grup aktif')


assert.strictEqual(AI.isReplyToBot(msg({ quoted: { fromMe: true } }), BOT), true,
  'quoted.fromMe saja cukup (v13)')
assert.strictEqual(triggered(msg({ quoted: { fromMe: true } })), true,
  'AI harus terpicu walau quoted.sender tidak ada')


assert.strictEqual(AI.isReplyToBot(msg({ quoted: { isBaileys: true } }), BOT), true,
  'quoted.isBaileys saja cukup (v13)')


assert.strictEqual(AI.isReplyToBot(msg({ quoted: { sender: '628999999999@s.whatsapp.net', fromMe: false } }), BOT), false)


assert.strictEqual(triggered(msg(), 'alisa halo'), true, 'panggilan alisa harus terpicu')


assert.strictEqual(triggered(msg({ quoted: qLid }), 'Hmm', false), false,
  'reply tidak boleh menembus gerbang AI grup yang nonaktif')


assert.deepStrictEqual(AI.resolveAIPrompt(msg({ body: '', text: '', quoted: qLid })),
  { text: 'aku tadi bilang apa?', source: 'quoted' })
assert.deepStrictEqual(AI.resolveAIPrompt(msg({ body: 'Hmm', text: 'Hmm', quoted: qLid })),
  { text: 'Hmm', source: 'text' })


const runtimeMsg = msg({ body: '', text: '', message: { conversation: 'alisa halo' } })
const runtimePrompt = AI.resolveAIPrompt(runtimeMsg, 'alisa halo')
assert.deepStrictEqual(runtimePrompt, { text: 'alisa halo', source: 'budy' })
assert.strictEqual(AI.isAITriggered({
  body: runtimePrompt.text,
  m: runtimeMsg,
  botNumber: BOT,
  isAutoAiGc: true,
}), true)

const BOT_PN = '6285181813279@s.whatsapp.net'
const BOT_LID = '151376843796631:9@lid'
const replyKeBot = msg({
  quoted: { sender: '151376843796631@lid', text: 'Hmph, lagi? Kamu kalau cuma bilang halo mulu...', id: 'DBCA05E7A19E791366AA74317E579324' },
})
assert.strictEqual(AI.isReplyToBot(replyKeBot, BOT_PN, BOT_LID), true,
  'reply ke LID bot harus dikenali walau botNumber memakai nomor HP')
assert.strictEqual(AI.isAITriggered({
  body: 'terusin', m: replyKeBot, botNumber: BOT_PN, botLid: BOT_LID, isAutoAiGc: true,
}), true, 'reply ke pesan AI bot harus membuka gate AI grup')

const ctxReply = msg({
  body: '',
  text: '',
  message: { conversation: 'terusin' },
  quoted: replyKeBot.quoted,
})
const ctxPrompt = AI.resolveAIPrompt(ctxReply, 'terusin', BOT_PN, BOT_LID)
assert.ok(ctxPrompt.text.includes('terusin'), 'prompt harus memuat balasan user')
assert.ok(ctxPrompt.text.includes('Hmph, lagi?'), 'reply ke pesan AI harus ikut jadi konteks AI')

console.log('AI_REPLY_TRIGGER_OK')
