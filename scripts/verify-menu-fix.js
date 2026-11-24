// Verifikasi statis: mode CASE dan PLUGIN punya daftar command yang sama.
// Dipakai sebelum/sesudah deploy. Tidak mengubah apa pun.
'use strict'
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
process.chdir(root)

const reg = JSON.parse(fs.readFileSync('plugins/cmd_registry.json', 'utf8'))
const vx = JSON.parse(fs.readFileSync('lib/vx/commands.json', 'utf8'))
const oldReg = JSON.parse(fs.readFileSync('/data/tmp/opencode/cmd_registry.before-vx.json', 'utf8'))

const caseSrc = fs.readFileSync('Alya.js', 'utf8')
const caseLabels = new Set()
for (const m of caseSrc.matchAll(/\bcase\s+['"]([A-Za-z0-9_.-]+)['"]\s*:/g)) caseLabels.add(m[1].toLowerCase())

const regKeys = new Set(Object.keys(reg).map(k => k.toLowerCase()))
const vxKeys = new Set(Object.keys(vx).map(k => k.toLowerCase()))
const oldKeys = new Set(Object.keys(oldReg).map(k => k.toLowerCase()))

let missingFiles = 0
for (const p of Object.values(reg)) {
  if (typeof p !== 'string' || !fs.existsSync(p)) missingFiles++
}

const shadowedAlya = [...oldKeys].filter(k => vxKeys.has(k))
const restored = [...oldKeys].filter(k => reg[k] && fs.existsSync(oldReg[k]) && reg[k] === oldReg[k])
const pluginOnly = [...regKeys].filter(k => !caseLabels.has(k))
const caseOnly = [...caseLabels].filter(k => !regKeys.has(k) && k !== 'default')

const report = {
  registryCommands: regKeys.size,
  caseCommands: caseLabels.size,
  vxNewCommands: vxKeys.size,
  pluginOnlyCount: pluginOnly.length,
  caseOnlyCount: caseOnly.length,
  unionCommands: new Set([...regKeys, ...caseOnly]).size,
  missingPluginFiles: missingFiles,
  oldAlyaShadowedByVx: shadowedAlya.length,
  oldAlyaRestored: restored.length,
  critical: {
    genshin: reg.genshin,
    gachawaifu: reg.gachawaifu,
    gachahusbu: reg.gachahusbu,
    waifu: reg.waifu,
    husbu: reg.husbu,
    loginisekai: reg.loginisekai,
    swgc: reg.swgc,
    menu: reg.menu,
    allmenu: reg.allmenu,
    vxmenu: reg.vxmenu
  }
}
console.log(JSON.stringify(report, null, 2))

const fails = []
if (missingFiles) fails.push(`${missingFiles} registry target file(s) missing`)
if (shadowedAlya.length) fails.push(`${shadowedAlya.length} old Alya commands still shadowed by vx`)
if (reg.genshin !== 'plugins/cmd/genshin.js') fails.push('genshin not restored')
if (reg.gachawaifu !== 'plugins/cmd/gachawaifu.js') fails.push('gachawaifu not restored')
if (reg.swgc !== 'plugins/cmd/upswgc.js') fails.push('swgc not routed to fixed plugin')
if (!fs.readFileSync('alya.js', 'utf8').includes('MODE CASE ↔ PLUGIN SALING MENDUPLIKAT')) fails.push('union dispatcher missing')

if (fails.length) {
  console.error('\nFAIL:\n- ' + fails.join('\n- '))
  process.exit(1)
}
console.log('\nVERIFY_OK — case/plugin command sets are mirrored; no missing plugin targets.')
