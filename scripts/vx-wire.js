// scripts/vx-wire.js — hasilkan artefak wiring porting vanXone:
//   1. lib/vx/commands.json   : peta command → { rel, engine, tags } (dipakai dispatch)
//   2. plugins/cmd/vx_*.js    : wrapper mode plugin (satu per file plugin vanXone)
//   3. plugins/cmd_registry.json : digabung — entry lama ditimpa, command baru ditambah
//   4. plugins/cmd/vx_vxmenu.js  : menu command hasil porting (per tag, berhalaman)
//
// Denylist infrastruktur: welcome/goodbye/sholat/setmenu TIDAK ditimpa karena
// event handler & scheduler Alya membaca store Alya sendiri (database/welcome.json,
// db.groups, autosholat Alya) — versi vanXone menulis ke store berbeda sehingga
// pengaturannya tidak akan pernah terbaca. Implementasi Alya dipertahankan.
'use strict'
const fs = require('fs'), path = require('path')
const REPO = path.join(__dirname, '..')
const map = JSON.parse(fs.readFileSync('/data/tmp/opencode/vx-map.json', 'utf8'))
const smoke = JSON.parse(fs.readFileSync('/data/tmp/opencode/vx-smoke.json', 'utf8'))

const DENY = new Set(['welcome', 'goodbye', 'sholat', 'setmenu'])
const tagsByRel = new Map(smoke.map(r => [r.rel, r.tags || []]))

// File plugin yang ditolak seluruhnya (bukan cuma command-nya)
const deniedRels = new Set(map.overwrite.filter(r => DENY.has(r.cmd)).map(r => r.rel))
const deniedCmds = []
const kept = new Map() // cmd → { rel, engine, tags }
for (const r of [...map.overwrite, ...map.add]) {
  if (deniedRels.has(r.rel)) { deniedCmds.push(r.cmd); continue }
  kept.set(r.cmd, { rel: r.rel, engine: r.engine, tags: tagsByRel.get(r.rel) || [] })
}

// ── 1. commands.json ──────────────────────────────────────────────────────────
const commands = {}
for (const [cmd, v] of [...kept].sort((a, b) => a[0].localeCompare(b[0]))) {
  commands[cmd] = { rel: v.rel, engine: v.engine, tags: v.tags.length ? v.tags : ['lainnya'] }
}
fs.writeFileSync(path.join(REPO, 'lib/vx/commands.json'), JSON.stringify(commands, null, 1) + '\n')

// ── 2. wrapper per file ───────────────────────────────────────────────────────
const byFile = new Map() // rel → [cmd]
for (const [cmd, v] of kept) {
  if (!byFile.has(v.rel)) byFile.set(v.rel, [])
  byFile.get(v.rel).push(cmd)
}
const wrapperDir = path.join(REPO, 'plugins/cmd')
const wrappers = []
for (const [rel, cmds] of byFile) {
  const name = 'vx_' + rel.replace(/^engine\//, '').replace(/\.js$/, '').replace(/\//g, '_') + '.js'
  const body = `// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/${rel}; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ${JSON.stringify(cmds.sort())},
  run: (alya, m, ctx) => runFile(${JSON.stringify(rel)}, alya, m, ctx),
}
`
  fs.writeFileSync(path.join(wrapperDir, name), body)
  wrappers.push({ rel, name: 'plugins/cmd/' + name, cmds })
}

// ── 3. gabung cmd_registry.json ───────────────────────────────────────────────
const regPath = path.join(REPO, 'plugins/cmd_registry.json')
const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'))
const backupPath = '/data/tmp/opencode/cmd_registry.before-vx.json'
if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, JSON.stringify(registry, null, 2))
let replaced = 0, added = 0
const fileToWrapper = new Map(wrappers.map(w => [w.rel, w.name]))
for (const [cmd, v] of kept) {
  const wrapper = fileToWrapper.get(v.rel)
  const orig = map.overwrite.find(r => r.cmd === cmd)
  if (orig?.regKey) {
    registry[orig.regKey] = wrapper
    if (orig.regKey !== cmd) registry[cmd] = wrapper
    replaced++
  } else if (registry[cmd]) {
    registry[cmd] = wrapper
    replaced++
  } else {
    registry[cmd] = wrapper
    added++
  }
}

// ── 4. vxmenu: menu command porting per tag (file statis plugins/cmd/vx_vxmenu.js) ──
if (!fs.existsSync(path.join(wrapperDir, 'vx_vxmenu.js'))) throw new Error('vx_vxmenu.js hilang')
registry['vxmenu'] = 'plugins/cmd/vx_vxmenu.js'
registry['menuvx'] = 'plugins/cmd/vx_vxmenu.js'
added += 2
// Daftarkan juga di commands.json supaya mode CASE menanganinya lewat guard vx.
// Rel berawalan 'plugins/' diselesaikan terhadap root repo oleh dispatch.getPlugin.
commands['vxmenu'] = { rel: 'plugins/cmd/vx_vxmenu.js', engine: 'alya', tags: ['main'] }
commands['menuvx'] = { rel: 'plugins/cmd/vx_vxmenu.js', engine: 'alya', tags: ['main'] }
fs.writeFileSync(path.join(REPO, 'lib/vx/commands.json'), JSON.stringify(commands, null, 1) + '\n')

fs.writeFileSync(regPath, JSON.stringify(registry, null, 2) + '\n')

const log = {
  commands: Object.keys(commands).length,
  wrappers: wrappers.length,
  registryReplaced: replaced,
  registryAdded: added,
  registryTotal: Object.keys(registry).length,
  deniedCmds, deniedRels: [...deniedRels],
}
fs.writeFileSync('/data/tmp/opencode/vx-wire-log.json', JSON.stringify(log, null, 2))
console.log(JSON.stringify(log, null, 1))
