// scripts/vx-copy.js — salin closure plugin vanXone ke sandbox vx/ tanpa mengubah kode,
// kecuali file root yang berbahaya (integrity/settings/config) yang dinetralkan.
//
// Struktur vx/ mencerminkan root vanXone PERSIS, supaya semua import relatif
// (../../src/scraper/..., ../../../../lib/baileys-compat) resolve tanpa ditulis ulang.
'use strict'
const fs = require('fs'), path = require('path')

const VX_SRC = '/data/workspace/vanXone-V4/vanXone V4'
const ENGINE = path.join(VX_SRC, 'engine')
const REPO = '/data/workspace/SC-Alisamikloivnakujou'
const DEST = path.join(REPO, 'vx')
const closure = JSON.parse(fs.readFileSync('/data/tmp/opencode/vx-closure.json', 'utf8'))

const log = { copied: 0, neutralized: [], skipped: [], donors: [] }

function ensureDir(p) { fs.mkdirSync(path.dirname(p), { recursive: true }) }
function write(p, s) { ensureDir(p); fs.writeFileSync(p, s) }

// ── 1. Salin semua file closure (engine + root) apa adanya ────────────────────
// PENTING: rel di closure relatif terhadap ENGINE, sedangkan DEST mencerminkan ROOT
// vanXone. File root ber-rel '../lib/x.js' → harus mendarat di vx/lib/x.js, BUKAN
// di repo Alya. Jadi setiap path diselesaikan dulu ke absolut, lalu di-relatifkan
// ke root vanXone sebelum dipetakan ke DEST.
function destFor(abs) {
  const relToRoot = path.relative(VX_SRC, abs)
  if (relToRoot.startsWith('..')) throw new Error('path di luar root vanXone: ' + abs)
  return path.join(DEST, relToRoot)
}
for (const rel of closure.closure) {
  const src = path.resolve(ENGINE, rel)
  if (!src.startsWith(VX_SRC + path.sep)) { log.skipped.push(rel + ' (di luar root vanXone)'); continue }
  const dst = destFor(src)
  if (!fs.existsSync(src)) { log.skipped.push(rel + ' (sumber tidak ada)'); continue }
  if (rel.includes('autojoin')) { log.skipped.push(rel + ' (auto join vanXone tidak disalin)'); continue }
  ensureDir(dst)
  fs.copyFileSync(src, dst)
  log.copied++
}

// ── 2. Donor lintas-engine untuk import yang tidak resolve ────────────────────
for (const u of closure.unresolved) {
  const base = path.dirname(path.join(ENGINE, u.from))
  const target = path.resolve(base, u.spec)
  const name = path.basename(target)
  // cari donor di engine lain
  let donor = null
  for (const e of fs.readdirSync(ENGINE)) {
    for (const sub of ['src/lib', 'lib', 'src']) {
      const c = path.join(ENGINE, e, sub, name + '.js')
      if (fs.existsSync(c)) { donor = c; break }
    }
    if (donor) break
  }
  if (donor) {
    const absTarget = target.endsWith('.js') ? target : target + '.js'
    const dst = destFor(absTarget)
    ensureDir(dst)
    fs.copyFileSync(donor, dst)
    log.donors.push(`${u.from} -> ${u.spec} (donor: ${path.relative(ENGINE, donor)})`)
    log.copied++
  } else {
    log.skipped.push(`DONOR_NOT_FOUND ${u.from} -> ${u.spec}`)
  }
}

// ── 2b. Dynamic import: closure statis tidak menangkap `await import('...')` ──
// Scan semua file tersalin, salin target relatif yang belum ada, ulang sampai
// stabil (fixpoint). Spec .mjs yang sumbernya .js dibuatkan bridge ESM re-export
// default (pola zenith/plugins/owner/add.js → lib/baileys-compat.mjs).
const DYN_RE = /(?:\bimport\s*\(\s*|__naren_imp\s*\(\s*)['"]([^'"]+)['"]\s*\)/g
function listJs(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) listJs(p, out)
    else if (/\.(js|mjs|cjs)$/.test(e.name)) out.push(p)
  }
  return out
}
let dynAdded = 0, passes = 0
do {
  dynAdded = 0
  for (const p of listJs(DEST)) {
    const s = fs.readFileSync(p, 'utf8')
    for (const mm of s.matchAll(DYN_RE)) {
      const spec = mm[1]
      if (!spec.startsWith('.')) continue
      const target = path.resolve(path.dirname(p), spec)
      const relToRoot = path.relative(DEST, target)
      if (relToRoot.startsWith('..')) continue
      let srcTarget = path.join(VX_SRC, relToRoot)
      if (srcTarget.endsWith('.mjs') && !fs.existsSync(srcTarget)) {
        const jsSrc = srcTarget.slice(0, -4) + '.js'
        if (fs.existsSync(jsSrc) && !fs.existsSync(target)) {
          write(target, `// Bridge .mjs buatan vx-copy: sumber vanXone berupa .js (CJS).\nimport mod from './${path.basename(jsSrc)}'\nexport default mod\n`)
          log.donors.push('dynamic .mjs bridge: ' + relToRoot)
          dynAdded++
        }
        continue
      }
      if (!path.extname(srcTarget)) srcTarget += '.js'
      const dst = path.extname(target) ? target : target + '.js'
      if (fs.existsSync(dst)) continue
      if (fs.existsSync(srcTarget) && srcTarget.startsWith(VX_SRC + path.sep)) {
        if (srcTarget.includes('autojoin')) continue
        ensureDir(dst)
        fs.copyFileSync(srcTarget, dst)
        log.donors.push('dynamic: ' + relToRoot)
        dynAdded++
      }
    }
  }
  passes++
} while (dynAdded > 0 && passes < 10)
log.copied += dynAdded

// ── 3. Netralkan lib/integrity.js (process.exit(1) bisa mematikan bot) ─────────
const integrityPath = path.join(DEST, 'lib/integrity.js')
if (fs.existsSync(integrityPath)) {
  write(integrityPath, `// lib/integrity.js — DINONAKTIFKAN untuk porting ke Alya.
// Versi vanXone memanggil process.exit(1) bila hash lib/autojoin.js tidak cocok.
// lib/autojoin.js sengaja tidak disalin (auto join saluran/grup vanXone tidak diinginkan),
// jadi penjaga ini dibuat no-op agar bot Alya tetap hidup.
'use strict'
function check() { return true }
module.exports = { check }
`)
  log.neutralized.push('lib/integrity.js → check() no-op')
}

// ── 4. Netralkan settings.js: jangan timpa global milik Alya ──────────────────
const alyaSettings = fs.readFileSync(path.join(REPO, 'settings.js'), 'utf8')
const alyaGlobals = new Set([...alyaSettings.matchAll(/^global\.([A-Za-z_][\w]*)\s*=/gm)].map(m => m[1]))
const ALWAYS_PROTECT = ['owner', 'ownernumber', 'ownername', 'ownerNumber', 'ownernomer', 'botname',
  'prefix', 'sessionName', 'pairingNumber', 'mess', 'wm', 'packname', 'author', 'footer',
  'channel', 'channeln', 'saluran', 'wagc', 'ig', 'tele', 'music', 'botnumber', 'creator']
const PROTECTED = new Set([...alyaGlobals, ...ALWAYS_PROTECT])

const vxSettingsPath = path.join(DEST, 'settings.js')
if (fs.existsSync(vxSettingsPath)) {
  let s = fs.readFileSync(vxSettingsPath, 'utf8')
  const kept = [], blocked = []
  s = s.replace(/^global\.([A-Za-z_][\w]*)\s*=\s*/gm, (full, name) => {
    if (PROTECTED.has(name)) { blocked.push(name); return `global.__vxBlocked.${name} = ` }
    kept.push(name)
    return `if (global.${name} === undefined) global.${name} = `
  })
  const header = `// settings.js vanXone — DINETRALKAN untuk Alya.
// Semua assignment global dijaga: hanya diisi bila belum ada, dan nama yang dipakai
// Alya (identitas bot, owner, sesi, mess, wm) dialihkan ke global.__vxBlocked supaya
// tidak menimpa identitas Alya. Bentuk statement tetap utuh (aman untuk objek multiline).
// Apikey resmi vanXone (global.APIs, global.apiKeys, global.ghTokens, global.tgToken,
// global.downloader, global.weather, global.ai) tetap masuk karena Alya tidak memakainya.
// Diblokir: ${blocked.join(', ')}
global.__vxBlocked = global.__vxBlocked || {}
`
  write(vxSettingsPath, header + s)
  log.neutralized.push(`settings.js → ${kept.length} global dijaga, ${blocked.length} diblokir (${blocked.join(',')})`)
}

// ── 5. Netralkan config.js: hapus integrity check + pembekuan global.owner ────
const cfgPath = path.join(DEST, 'config.js')
if (fs.existsSync(cfgPath)) {
  let s = fs.readFileSync(cfgPath, 'utf8')
  const before = s
  s = s.replace(/^.*require\(['"]\.\/lib\/integrity['"]\)\.check\(\).*$/gm,
    '// [vx] integrity.check() dinonaktifkan — bisa process.exit(1) dan mematikan bot Alya.')
  s = s.replace(/^.*Object\.defineProperty\(\s*g\s*,\s*['"]owner['"].*$/gm,
    '// [vx] pembekuan global.owner dilepas — owner Alya dikelola database/owner.json + .addowner.')
  if (s !== before) {
    write(cfgPath, '// config.js vanXone — DINETRALKAN (lihat komentar [vx] di bawah).\n' + s)
    log.neutralized.push('config.js → integrity check + owner freeze dilepas')
  }
}

// ── 5b. Lepas handler SIGINT/SIGTERM vanXone ──────────────────────────────────
// Handler ini memanggil process.exit(0) saat sinyal, jadi bisa mendahului shutdown
// milik Alya (watchdog/systemd) dan membuat data Alya belum ter-flush. Flush pada
// event 'exit'/'beforeExit' dibiarkan karena tidak berbahaya.
const SIGNAL_FILES = [
  'lib/store.js',
  'engine/aurora/src/lib/database.js',
  'engine/nimbus/src/lib/ourin-lid.js',
  'engine/orbit/src/lib/vemzo-lid.js',
  'engine/zenith/src/lib/rimuru-lid.js',
]
for (const rel of SIGNAL_FILES) {
  const p = path.join(DEST, rel)
  if (!fs.existsSync(p)) continue
  let s = fs.readFileSync(p, 'utf8')
  const before = s
  s = s.replace(/for\s*\(const\s+sig\s+of\s*\[[^\]]*SIGINT[^\]]*\]\)\s*\{[\s\S]*?\n\}/g,
    '// [vx] handler SIGINT/SIGTERM dilepas — shutdown dikelola Alya.')
  s = s.replace(/process\.(on|once)\(\s*["']SIG(?:INT|TERM)["']\s*,\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*\)\s*;?/g,
    '/* [vx] handler SIGINT/SIGTERM dilepas — shutdown dikelola Alya. */')
  if (s !== before) {
    fs.writeFileSync(p, s)
    log.neutralized.push(rel + ' → handler SIGINT/SIGTERM dilepas')
  }
}

// ── 5c. Lepas handler uncaughtException vanXone ────────────────────────────────
// Ketiga lib LID memasang process.on('uncaughtException', saveCache) yang
// menelan SEMUA exception host — crash Alya tidak akan pernah terlihat.
// Flush cache tetap bisa lewat event 'exit' yang dipasang di atasnya.
const EXCEPTION_FILES = [
  'engine/nimbus/src/lib/ourin-lid.js',
  'engine/orbit/src/lib/vemzo-lid.js',
  'engine/zenith/src/lib/rimuru-lid.js',
]
for (const rel of EXCEPTION_FILES) {
  const p = path.join(DEST, rel)
  if (!fs.existsSync(p)) continue
  let s = fs.readFileSync(p, 'utf8')
  const before = s
  s = s.replace(/process\.(on|once)\(\s*["']uncaughtException["']\s*,\s*\([\s\S]*?\n\}\);?/g,
    '/* [vx] handler uncaughtException dilepas — jangan menelan crash host Alya. */')
  if (s !== before) {
    fs.writeFileSync(p, s)
    log.neutralized.push(rel + ' → handler uncaughtException dilepas')
  }
}

// ── 5d. Curam tulisan plugin ke root repo Alya ────────────────────────────────
// Beberapa plugin zenith menulis ke <cwd>/database|<cwd>/temp|<cwd>/plugins.
// Dialihkan ke vx/.data & vx/.writable supaya tidak menyentuh data Alya.
const CONFINED_WRITES = [
  {
    rel: 'engine/zenith/plugins/owner/gantiapi.js',
    from: "    const pluginPath = path.join(process.cwd(), 'plugins', `${pluginName}.js`)",
    to: "    // [vx] Dikunci ke direktori vx/.writable: tidak boleh menyentuh plugins/ Alya.\n" +
        "    if (!pluginName || !/^[\\w.-]+$/.test(pluginName) || pluginName.includes('..')) {\n" +
        "        return m.reply('Nama plugin tidak valid.')\n" +
        "    }\n" +
        "    const pluginPath = new URL(`../../../../.writable/plugins/${pluginName}.js`, import.meta.url).pathname",
  },
  {
    rel: 'engine/zenith/plugins/owner/addgacha.js',
    from: "const DARLING_JSON_PATH = path.join(process.cwd(), 'database', 'darling.json');",
    to: "const DARLING_JSON_PATH = new URL('../../../../.data/darling.json', import.meta.url).pathname;",
  },
  {
    rel: 'engine/zenith/plugins/owner/addgacha.js',
    from: "    const dbDir = path.join(process.cwd(), 'database');",
    to: "    const dbDir = new URL('../../../../.data', import.meta.url).pathname;",
  },
  {
    rel: 'engine/zenith/plugins/info/landsat.js',
    from: 'const OUTPUT_DIR = path.join(process.cwd(), "temp", "landsat")',
    to: "const OUTPUT_DIR = new URL('../../../../.data/temp/landsat', import.meta.url).pathname",
  },
]
for (const { rel, from, to } of CONFINED_WRITES) {
  const p = path.join(DEST, rel)
  if (!fs.existsSync(p)) continue
  const s = fs.readFileSync(p, 'utf8')
  if (s.includes(from)) {
    fs.writeFileSync(p, s.replace(from, to))
    log.neutralized.push(rel + ' → tulisan dialihkan ke vx/.data')
  }
}

// ── 6. package.json sandbox (hook load yang memutuskan ESM/CJS per isi file) ──
write(path.join(DEST, 'package.json'), JSON.stringify({
  name: 'vx-sandbox', private: true, type: 'commonjs',
  description: 'Kode vanXone hasil porting. Jenis modul ditentukan lib/vx/bootstrap.js dari isi file.',
}, null, 2) + '\n')

// ── 7. Audit side-effect berbahaya yang tersisa ───────────────────────────────
const hazards = []
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.js')) {
      const s = fs.readFileSync(p, 'utf8')
      // buang komentar supaya teks di dalam komentar tidak dihitung sebagai bahaya
      const code = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
      const rel = path.relative(DEST, p)
      if (/process\.exit\s*\(/.test(code)) hazards.push('process.exit: ' + rel)
      if (/Object\.defineProperty\(\s*(global|g)\s*,\s*['"]owner['"]/.test(code)) hazards.push('owner freeze: ' + rel)
      if (/require\([^)]*autojoin/.test(code)) hazards.push('autojoin require: ' + rel)
      if (/process\.(on|once)\(\s*['"]SIG(INT|TERM)['"]/.test(code)) hazards.push('signal handler: ' + rel)
      if (/process\.(on|once)\(\s*['"]uncaughtException['"]/.test(code)) hazards.push('uncaughtException handler: ' + rel)
    }
  }
}
walk(DEST)

console.log('COPIED=' + log.copied)
console.log('NEUTRALIZED:\n  ' + log.neutralized.join('\n  '))
console.log('DONORS:\n  ' + (log.donors.join('\n  ') || '(tidak ada)'))
console.log('SKIPPED:\n  ' + (log.skipped.join('\n  ') || '(tidak ada)'))
console.log('HAZARDS_REMAINING=' + hazards.length)
console.log(hazards.slice(0, 30).join('\n'))
fs.writeFileSync('/data/tmp/opencode/vx-copy-log.json', JSON.stringify({ log, hazards }, null, 2))
