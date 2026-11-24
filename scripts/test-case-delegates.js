// Memastikan versi CASE mendelegasikan ke plugin yang sama (satu logika),
// bukan mengimplementasikan ulang owner-check/cooldown/queue.
// Blok case dievaluasi terisolasi: require Alya.js penuh punya efek samping.
'use strict'
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const src = fs.readFileSync(path.join(ROOT, 'Alya.js'), 'utf8')
const start = src.indexOf("case '🐦':")
const end = src.indexOf("case 'join':", start)
assert.ok(start >= 0 && end > start, 'blok case delegate tidak ditemukan')
const block = src.slice(start, end)

const calls = []
const fakeRequire = (p) => {
  const name = String(p).includes('antigravity') ? 'agy'
    : String(p).includes('uimode') ? 'uimode'
    : String(p).includes('readviewonce') ? 'rvo'
    : null
  assert.ok(name, 'case mem-require modul tak terduga: ' + p)
  return { run: async (alya, m, ctx) => { calls.push({ name, command: ctx.command }); return 'OK-' + name } }
}

const runCase = new Function(
  'require', 'alya', 'm', 'ctx', 'replyalya', 'console', 'command',
  `return (async () => { switch (command) { ${block} default: return 'NO_MATCH'; } })()`
)

;(async () => {
  for (const [cmd, name] of [['agy', 'agy'], ['antigravity', 'agy'], ['uimode', 'uimode'], ['rvome', 'rvo']]) {
    const replies = []
    const out = await runCase(
      fakeRequire, {}, {}, { command: cmd, text: 'halo' },
      (s) => replies.push(s), { error: () => {} }, cmd,
    )
    assert.strictEqual(out, 'OK-' + name, `${cmd}: harus mengembalikan hasil plugin`)
    assert.strictEqual(replies.length, 0, `${cmd}: tidak boleh balas sendiri saat plugin sukses`)
  }
  assert.deepStrictEqual(calls.map(c => c.command), ['agy', 'antigravity', 'uimode', 'rvome'])
  console.log('CASE_DELEGATES_OK')
})().catch(e => { console.error('CASE_DELEGATES_FAIL', e); process.exitCode = 1 })
