// scripts/vx-hook-test.js — verifikasi hook pasif vanXone (handler.all/before)
// jalan lewat jalur inbound Alya, state game bertahan antar-pesan.
'use strict'

process.env.VX_SMOKE = '1'
require('../lib/vx/bootstrap')

const results = []
const ok = (n, v, d = '') => results.push(`${v ? 'PASS' : 'FAIL'} ${n}${d ? ' ' + d : ''}`)

;(async () => {
  const sent = []
  const alya = {
    user: { id: '6285181813279@s.whatsapp.net' },
    sendMessage: async (jid, payload, opts) => { sent.push({ jid, payload, opts }); return { key: { id: 'test' } } },
    decodeJid: (j) => j,
    public: true,
  }
  global.db = { users: {}, chats: {} }
  global.owner = ['6285602845943']

  const dispatch = require('../lib/vx/dispatch')
  const { makePassiveConn } = require('../lib/vx/adapter')

  const base = {
    key: { id: 'M1', remoteJid: '628999@s.whatsapp.net', participant: '628999@s.whatsapp.net' },
    id: 'M1', fromMe: false,
    chat: '628999@s.whatsapp.net', sender: '628999@s.whatsapp.net', isGroup: false,
    mtype: 'conversation', body: 'jakarta', text: 'jakarta',
    message: { conversation: 'jakarta' },
    reply: async () => {}, download: async () => Buffer.from(''),
  }

  // Siapkan state game pada socket pasif yang sama dipakai tryPassive.
  const seedCtx = { body: 'start', text: 'start', args: ['start'], command: 'tebakjkt', prefix: '.',
    sender: base.sender, from: base.chat, isGroup: false, Ryuu: false, isPrem: false }
  const conn = makePassiveConn(alya, base, seedCtx)
  conn.tebakjkt = {
    [base.chat]: { jawaban: 'jakarta', rawJawaban: 'Jakarta', timeout: setTimeout(() => {}, 60000) },
  }
  ok('passive_state_persist', conn.tebakjkt[base.chat]?.jawaban === 'jakarta')

  const handled = await dispatch.tryPassive(alya, base, null)
  ok('hook_returned_handled', handled === true)
  const win = sent.find(s => String(s.payload?.text || '').includes('BENAR'))
  ok('game_answer_replied', !!win, win ? JSON.stringify(String(win.payload.text).slice(0, 40)) : '')
  ok('state_cleared_after_win', !conn.tebakjkt[base.chat])

  // Jawaban salah tidak boleh membalas / mengubah state.
  const wrong = { ...base, key: { ...base.key, id: 'M2' }, body: 'salah', text: 'salah', message: { conversation: 'salah' } }
  conn.tebakjkt = { [base.chat]: { jawaban: 'jakarta', rawJawaban: 'Jakarta', timeout: setTimeout(() => {}, 60000) } }
  sent.length = 0
  await dispatch.tryPassive(alya, wrong, null)
  ok('wrong_answer_no_reply', sent.length === 0, `sent=${sent.length}`)
  ok('wrong_answer_keeps_state', !!conn.tebakjkt[base.chat])

  console.log('\n=== HASIL ===')
  for (const r of results) console.log(' ' + r)
  const fails = results.filter(r => r.startsWith('FAIL')).length
  console.log(`TOTAL=${results.length} FAILURES=${fails}`)
  process.exit(fails ? 1 : 0)
})().catch(e => {
  console.error('HANDLE TEST ERROR', e)
  process.exit(1)
})
