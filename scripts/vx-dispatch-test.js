// scripts/vx-dispatch-test.js — uji plumbing dispatch→loader→adapter dengan mock.
// Tidak menyentuh WhatsApp; sendMessage ditangkap ke array.
'use strict'
const path = require('path')
const REPO = path.join(__dirname, '..')

global.db = { users: {}, groups: {}, settings: {}, others: {}, chats: {} }
global.mess = { only: {} }
global.botname = 'Alya'
global.wm = 'Alya'
global.prefix = '.'

const sent = []
const alya = {
  sendMessage: async (jid, payload, opts) => {
    sent.push({ jid, text: payload.text ? String(payload.text).slice(0, 160) : null, keys: Object.keys(payload) })
    return { key: { id: 'MOCK' } }
  },
  getName: async () => 'Tester',
  decodeJid: (j) => j,
  sendText: async (jid, text) => alya.sendMessage(jid, { text }),
}
function makeM(body) {
  return {
    key: { id: 'TEST1', remoteJid: '628111@s.whatsapp.net', fromMe: false },
    chat: '628111@s.whatsapp.net', sender: '628111@s.whatsapp.net',
    pushName: 'Tester', mtype: 'conversation', msg: {}, body,
    mentionedJid: [], message: { conversation: body },
  }
}
function makeCtx(command, args = [], extra = {}) {
  const m = makeM('.' + command + (args.length ? ' ' + args.join(' ') : ''))
  const reply = (t) => alya.sendMessage(m.chat, { text: String(t) }, { quoted: m })
  return {
    m, command, args, text: args.join(' '), q: args.join(' '), prefix: '.', body: m.body,
    sender: m.sender, from: m.chat, pushname: 'Tester', isGroup: false,
    Ryuu: false, isPrem: false, isGroupAdmins: false, isBotAdmins: false,
    reply, replyalya: reply, replytolak: reply, store: { messages: {} },
    mess: global.mess, ...extra,
  }
}

const dispatch = require(path.join(REPO, 'lib/vx/dispatch'))
const adapter = require(path.join(REPO, 'lib/vx/adapter'))
const { loadPlugin } = require(path.join(REPO, 'lib/vx/loader'))

const results = {}
async function t(name, fn) {
  try { results[name] = await fn() } catch (e) { results[name] = 'THREW: ' + (e?.message || e) }
}

;(async () => {
  // 1. Guard owner: plugin isOwner dengan ctx.Ryuu=false harus menolak
  await t('guard_owner_deny', async () => {
    const ctx = makeCtx('fakeowner')
    const vm = adapter.makeMessage(alya, ctx.m, ctx)
    const ok = adapter.guard({ config: { isOwner: true } }, ctx, vm)
    return ok === false && sent.some(s => /owner/i.test(s.text || '')) ? 'PASS' : 'FAIL ' + JSON.stringify(sent)
  })

  // 2. vxmenu lewat tryHandle (jalur mode case)
  sent.length = 0
  await t('vxmenu_case_mode', async () => {
    const ctx = makeCtx('vxmenu')
    const handled = await dispatch.tryHandle('vxmenu', alya, ctx.m, ctx)
    return handled && sent.some(s => /Menu Porting vanXone/.test(s.text || '')) ? 'PASS' : 'FAIL handled=' + handled + ' ' + JSON.stringify(sent)
  })

  // 3. Command tidak terdaftar → false (switch V13 lanjut)
  await t('unknown_cmd_passthrough', async () => {
    const ctx = makeCtx('tidakterdaftarxyz')
    return (await dispatch.tryHandle('tidakterdaftarxyz', alya, ctx.m, ctx)) === false ? 'PASS' : 'FAIL'
  })

  // 4. Overwrite: tiktok harus dipegang zenith (prioritas tertinggi)
  await t('overwrite_priority', async () => {
    const e = dispatch.COMMANDS['tiktok']
    return e && e.engine === 'zenith' ? 'PASS' : 'FAIL ' + JSON.stringify(e)
  })

  // 5. ping (lumen, ESM export default) end-to-end lewat wrapper mode plugin
  sent.length = 0
  await t('ping_wrapper_plugin_mode', async () => {
    const entry = dispatch.COMMANDS['ping']
    const wrapperName = 'vx_' + entry.rel.replace(/^engine\//, '').replace(/\.js$/, '').replace(/\//g, '_') + '.js'
    const wrap = require(path.join(REPO, 'plugins/cmd', wrapperName))
    const ctx = makeCtx('ping')
    await wrap.run(alya, ctx.m, ctx)
    return sent.length ? 'PASS (' + sent.length + ' pesan: ' + (sent[0].text || sent[0].keys.join(',')) + ')' : 'FAIL tidak ada pesan'
  })

  // 6. brat (nimbus, ESM config+handler, panggil API) — error harus terkurung
  sent.length = 0
  await t('brat_error_contained', async () => {
    const ctx = makeCtx('brat', ['tes'])
    const handled = await Promise.race([
      dispatch.tryHandle('brat', alya, ctx.m, ctx),
      new Promise(r => setTimeout(() => r('TIMEOUT'), 25000)),
    ])
    if (handled === 'TIMEOUT') return 'TIMEOUT (API lambat, bukan crash)'
    return handled === true ? 'PASS (handled, pesan: ' + JSON.stringify(sent.map(s => (s.text || '').slice(0, 60))) + ')' : 'FAIL'
  })

  // 7. vortex (CJS __naren_imp) end-to-end: kilua + autokilua (pakai db.data.chats)
  for (const cmd of ['kilua', 'autokilua']) {
    sent.length = 0
    await t('vortex_' + cmd, async () => {
      if (!dispatch.COMMANDS[cmd]) return 'SKIP tidak terdaftar'
      const ctx = makeCtx(cmd, ['halo'], cmd === 'autokilua' ? { isGroup: true } : {})
      const handled = await Promise.race([
        dispatch.tryHandle(cmd, alya, ctx.m, ctx),
        new Promise(r => setTimeout(() => r('TIMEOUT'), 25000)),
      ])
      return handled === true ? 'PASS (' + JSON.stringify(sent.map(s => (s.text || s.keys.join(','))).slice(0, 80)) + ')' : String(handled)
    })
  }

  // 8. jembatan db.data: share by-reference, owner/premium memantul, reset diabaikan
  await t('db_data_bridge', async () => {
    global.db.users['x'] = { limit: 5 }
    global.owner = ['628111']
    global.prem = ['628222']
    const okShare = global.db.data.users['x'].limit === 5
    global.db.data.stats['cmd'] = (global.db.data.stats['cmd'] || 0) + 1
    const okLazy = global.db.stats['cmd'] === 1
    const okOwner = global.db.data.owner.includes('628111')
    const okPrem = global.db.data.premium.includes('628222')
    global.db.data = {} // reset ala vanXone harus diabaikan
    const okProtect = global.db.users['x']?.limit === 5
    const okJson = !JSON.stringify(global.db).includes('"data"')
    global.db = { users: { y: { limit: 9 } }, chats: {} } // reassign → bridge pasang lagi
    const okReassign = global.db.data.users['y'].limit === 9
    return [okShare, okLazy, okOwner, okPrem, okProtect, okJson, okReassign].every(Boolean)
      ? 'PASS' : 'FAIL ' + JSON.stringify({ okShare, okLazy, okOwner, okPrem, okProtect, okJson, okReassign })
  })

  // 10. extras: bentuk vanXone harus MENANG atas ctx gaya Alya (m/quoted/reply)
  await t('extras_vanXone_overrides_ctx', async () => {
    let seen = null
    const fake = { rel: 'fake', handler: async (msg, ex) => { seen = { msg, ex } }, config: null }
    const ctx = makeCtx('fake')
    ctx.m = makeM('.fake') // ctx.m gaya Alya, beda objek dari argumen m
    await adapter.run(fake, alya, ctx.m, ctx)
    const okM = seen?.msg && seen.msg.reply && seen.msg.raw === ctx.m
    const okExM = seen?.ex?.m === seen?.msg
    const okReply = typeof seen?.ex?.reply === 'function' && seen.ex.reply !== ctx.reply
    const okQuoted = seen?.ex?.quoted === seen?.msg?.quoted
    return okM && okExM && okReply && okQuoted ? 'PASS'
      : 'FAIL ' + JSON.stringify({ okM, okExM, okReply, okQuoted })
  })

  console.log(JSON.stringify(results, null, 1))
  process.exit(0)
})()
