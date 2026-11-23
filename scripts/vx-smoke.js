// scripts/vx-smoke.js — muat SEMUA plugin target lewat loader universal, laporkan gagal.
// Jalankan: node scripts/vx-smoke.js [engine]
'use strict'
const path = require('path')
const fs = require('fs')
const REPO = path.join(__dirname, '..')
require(path.join(REPO, 'lib/vx/bootstrap'))

// globals minimum supaya kode vanXone tidak crash saat load
global.db = global.db || { users: {}, groups: {}, settings: {}, others: {}, chats: {} }
global.mess = global.mess || { only: {} }
global.botname = global.botname || 'Alya'
global.wm = global.wm || 'Alya'
global.thumb = global.thumb || ''
global.prefix = global.prefix || '.'

// settings/config vanXone yang sudah dinetralkan + globals pendukung dimuat oleh
// dispatch (jalur yang sama dengan produksi).
const { loadPlugin } = require(path.join(REPO, 'lib/vx/loader'))
require(path.join(REPO, 'lib/vx/dispatch'))
const inv = JSON.parse(fs.readFileSync('/data/tmp/opencode/vx-api-inventory.json', 'utf8'))
const only = process.argv[2] || null

;(async () => {
  const results = []
  for (const r of inv.rows) {
    if (only && r.engine !== only) continue
    const rel = 'engine/' + r.rel
    const t0 = Date.now()
    try {
      const p = await loadPlugin(rel)
      results.push({ engine: r.engine, rel, ok: true, commands: p.commands, tags: p.tags, hasHandler: !!p.handler, ms: Date.now() - t0 })
    } catch (e) {
      results.push({ engine: r.engine, rel, ok: false, code: e?.code || null, error: String(e?.message || e).slice(0, 300), ms: Date.now() - t0 })
    }
  }
  const byEngine = {}
  for (const r of results) {
    byEngine[r.engine] = byEngine[r.engine] || { ok: 0, fail: 0, noCmd: 0, noHandler: 0 }
    if (r.ok) {
      byEngine[r.engine].ok++
      if (!r.commands.length) byEngine[r.engine].noCmd++
      if (!r.hasHandler) byEngine[r.engine].noHandler++
    } else byEngine[r.engine].fail++
  }
  console.log('TOTAL=' + results.length)
  console.log('BY_ENGINE=' + JSON.stringify(byEngine, null, 1))
  const fails = results.filter(r => !r.ok)
  console.log('FAILURES=' + fails.length)
  const codes = {}
  for (const f of fails) { const k = f.code || f.error.split('\n')[0].slice(0, 60); codes[k] = (codes[k] || 0) + 1 }
  console.log('ERROR_KINDS=' + JSON.stringify(codes, null, 1))
  const out = '/data/tmp/opencode/vx-smoke' + (only ? '-' + only : '') + '.json'
  fs.writeFileSync(out, JSON.stringify(results, null, 2))
  console.log('SAVED=' + out)
  process.exit(0)
})()
