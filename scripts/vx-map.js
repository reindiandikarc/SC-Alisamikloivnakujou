// scripts/vx-map.js — peta command hasil porting: dedup lintas-engine, split
// overwrite (sudah ada di Alya) vs add (baru), deteksi konflik & command sensitif.
'use strict'
const fs = require('fs'), path = require('path')
const REPO = path.join(__dirname, '..')

const PRIORITY = ['zenith', 'nimbus', 'aurora', 'lumen', 'pulse', 'orbit', 'vortex']
const smoke = JSON.parse(fs.readFileSync('/data/tmp/opencode/vx-smoke.json', 'utf8'))

// Command yang sudah ada di Alya: case Alya.js + registry plugin.
// Indentasi case di Alya.js tidak konsisten (0/1/2/3+ tab, nested switch pakai
// spasi), jadi parse AST dengan acorn dan ambil case dari switch(command) saja.
const acorn = require('acorn')
const alyaSrc = fs.readFileSync(path.join(REPO, 'Alya.js'), 'utf8')
const ast = acorn.parse(alyaSrc, { ecmaVersion: 'latest', sourceType: 'script' })
const caseCmds = new Set()
;(function walk(node) {
  if (!node || typeof node.type !== 'string') return
  if (node.type === 'SwitchStatement' && node.discriminant?.type === 'Identifier' && node.discriminant.name === 'command') {
    for (const c of node.cases) {
      if (c.test?.type === 'Literal' && typeof c.test.value === 'string') caseCmds.add(c.test.value.toLowerCase())
    }
  }
  for (const k of Object.keys(node)) {
    const v = node[k]
    if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v.type === 'string') walk(v)
  }
})(ast)
const registry = JSON.parse(fs.readFileSync(path.join(REPO, 'plugins/cmd_registry.json'), 'utf8'))
const regCmds = new Map() // normalized → original key
for (const k of Object.keys(registry)) {
  const n = k.replace(/^\./, '').toLowerCase()
  if (!regCmds.has(n)) regCmds.set(n, k)
}

// Kumpulkan klaim command per file (hanya file yang load OK + punya handler + command)
const claims = []
for (const r of smoke) {
  if (!r.ok || !r.hasHandler || !r.commands.length) continue
  for (const c of r.commands) claims.push({ cmd: c, engine: r.engine, rel: r.rel })
}

// Dedup: prioritas engine; dalam engine sama, file pertama (urut path) menang
const rank = e => { const i = PRIORITY.indexOf(e); return i < 0 ? 99 : i }
claims.sort((a, b) => rank(a.engine) - rank(b.engine) || a.rel.localeCompare(b.rel))
const winner = new Map() // cmd → claim
const conflicts = []
for (const c of claims) {
  if (winner.has(c.cmd)) {
    const w = winner.get(c.cmd)
    if (w.rel !== c.rel) conflicts.push({ cmd: c.cmd, kept: w.engine + '/' + w.rel, dropped: c.engine + '/' + c.rel })
    continue
  }
  winner.set(c.cmd, c)
}

const overwrite = [], add = []
for (const [cmd, c] of winner) {
  const inCase = caseCmds.has(cmd)
  const inReg = regCmds.has(cmd)
  const row = { cmd, engine: c.engine, rel: c.rel, inCase, inReg, regKey: regCmds.get(cmd) || null }
  if (inCase || inReg) overwrite.push(row); else add.push(row)
}

// Command infrastruktur Alya yang TIDAK boleh ditimpa (owner/premium/sesi/mode
// dikelola Alya via database/owner.json + db; versi vanXone pakai store sendiri).
const SENSITIVE = /^(addowner|delowner|owner|listowner|addprem|delprem|listprem|premium|addsewa|delsewa|listsewa|sewa|switchcase|switchplugin|restart|shutdown|reboot|join|leave|getsession|session|pairing|setppbot|setpp|setbio|setname|autobio|addmsg|delmsg|listmsg|save|backup|restore|updatemsg|setmenu|setwm|setprefix|autoread|autotyping|autorecord|anticall|antispam|autoblock|block|unblock|ban|unban|addbadword|delbadword|badword|setexif|setcmd|delcmd|listcmd|lockcmd|unlockcmd)$/
const sensitiveHits = overwrite.filter(r => SENSITIVE.test(r.cmd))

const out = {
  totalFiles: smoke.length,
  loadOk: smoke.filter(r => r.ok).length,
  pluginFiles: new Set([...winner.values()].map(c => c.rel)).size,
  uniqueCmds: winner.size,
  overwrite, add, conflicts,
  sensitiveHits,
  helpersExcluded: smoke.filter(r => r.ok && (!r.hasHandler || !r.commands.length)).map(r => r.rel),
}
fs.writeFileSync('/data/tmp/opencode/vx-map.json', JSON.stringify(out, null, 2))
console.log('ALYA_CASE_CMDS=' + caseCmds.size)
console.log('UNIQUE_CMDS=' + out.uniqueCmds)
console.log('PLUGIN_FILES=' + out.pluginFiles)
console.log('OVERWRITE=' + overwrite.length + ' (inCase=' + overwrite.filter(r => r.inCase).length + ', inRegOnly=' + overwrite.filter(r => !r.inCase && r.inReg).length + ')')
console.log('ADD=' + add.length)
console.log('CONFLICTS=' + conflicts.length)
console.log('SENSITIVE_HITS=' + sensitiveHits.length + ': ' + sensitiveHits.map(r => r.cmd).join(','))
console.log('HELPERS_EXCLUDED=' + out.helpersExcluded.join(', '))
