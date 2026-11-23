// scripts/vx-hooks.js — hasilkan daftar plugin vanXone yang punya hook pasif
// (handler.all / handler.before). Dipanggil sekali saat build; dispatch.js
// memuatnya malas per pesan, bukan memuat 800+ plugin.
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const VX = path.join(ROOT, 'vx')
const OUT = path.join(ROOT, 'lib', 'vx', 'hooks.json')

const HOOK_RE = /handler\s*\.\s*(all|before)\s*=|export\s+(?:async\s+)?(?:function|const|let)\s+(all|before)\b/g

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, acc)
    else if (ent.name.endsWith('.js')) acc.push(p)
  }
  return acc
}

const hooks = []
for (const file of walk(VX)) {
  const src = fs.readFileSync(file, 'utf8')
  const m = src.match(HOOK_RE)
  if (!m) continue
  hooks.push({
    rel: path.relative(VX, file).split(path.sep).join('/'),
    kinds: [...new Set([...src.matchAll(HOOK_RE)].map(x => x[1] || x[2]))],
  })
}

hooks.sort((a, b) => a.rel.localeCompare(b.rel))
fs.writeFileSync(OUT, JSON.stringify(hooks, null, 2) + '\n')
console.log('HOOKS=' + hooks.length)
for (const h of hooks) console.log('  ' + h.rel + ' [' + h.kinds.join(',') + ']')
