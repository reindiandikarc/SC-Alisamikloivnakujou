// lib/vx/bootstrap.js — lapisan modul universal untuk kode hasil porting vanXone.
//
// Masalah: kode vanXone campur ESM (`export { config, handler }`, `export default handler`)
// dan CJS (`module.exports = { config, handler }`), semuanya ber-ekstensi .js, sedangkan
// repo Alya bertipe commonjs. Node menentukan jenis modul dari package.json terdekat,
// jadi tanpa bantuan ini file ESM vanXone gagal di-require.
//
// Solusi: `module.registerHooks` (Node >= 22.15, sinkron, berlaku untuk require DAN import)
// dengan hook `load` yang memutuskan format dari ISI file, bukan ekstensi. Kode sumber
// vanXone tidak diubah sama sekali. Hook `resolve` memetakan nama paket fork baileys
// (baileys, @itsliaaa/baileys) ke @whiskeysockets/baileys (reinkabaileys, dual ESM+CJS).
//
// Dipanggil sekali di index.js sebelum plugin apa pun dimuat. Idempoten.
'use strict'

const Module = require('node:module')
const fs = require('fs')
const path = require('path')
const { fileURLToPath, pathToFileURL } = require('node:url')

const REPO = path.join(__dirname, '..', '..')
const VX_ROOT = path.join(REPO, 'vx')

// Paket fork baileys yang tidak ada di npm → diarahkan ke fork yang terpasang.
const ALIASES = {
  'baileys': '@whiskeysockets/baileys',
  '@itsliaaa/baileys': '@whiskeysockets/baileys',
  '@whiskeysockets/baileys': '@whiskeysockets/baileys',
}

// Paket yang tidak tersedia di npm: diarahkan ke stub lokal supaya import tidak
// meledak saat load. Stub melempar error jelas hanya ketika fiturnya benar-benar dipakai.
const STUBS = {}

// Shim berscope: HANYA berlaku bila importer berada di dalam pohon vx/.
// Kode Alya asli tetap memakai paket versi aslinya (mis. file-type@16 CJS).
// Shim tinggal di lib/vx/shims (di luar vx/) supaya import paket asli dari dalam
// shim tidak kena alias lagi (tidak rekursif).
const VX_SHIMS = {
  // he@2 ESM-only tanpa default; plugin: `import he from 'he'`
  'he': path.join(__dirname, 'shims', 'he.mjs'),
  // gradient-string@3 ESM-only; plugin CJS memanggil gradient([...]) langsung
  'gradient-string': path.join(__dirname, 'shims', 'gradient-string.cjs'),
  // vanXone butuh API modern fileTypeFromBuffer; Alya tetap di file-type@16
  'file-type': path.join(__dirname, 'shims', 'file-type.mjs'),
  // npm cuma punya placeholder keamanan; yang dipakai (AIRich) ada di fork baileys
  'baileys-mbuilder': path.join(__dirname, 'shims', 'baileys-mbuilder.mjs'),
  // vanXone lowdb@7 memakai subpath lowdb/node; Alya lowdb@2 export dari entry utama.
  'lowdb/node': path.join(__dirname, 'shims', 'lowdb-node.mjs'),
  // cheerio@1 rc Alya tidak punya ekspor default; 9 plugin vanXone memakainya.
  'cheerio': path.join(__dirname, 'shims', 'cheerio.mjs'),
}

const ESM_RE = /^[ \t]*(?:import[ \t]+(?:[\w{*'"]|[\w$]+[ \t]*,)|import[ \t]*['"]|export[ \t]+(?:default|const|let|var|function|class|async|\{|\*)|export[ \t]*\{)/m
const CJS_RE = /\bmodule\.exports\b|\brequire[ \t]*\(|\bexports\.[\w$]+[ \t]*=|\b__dirname\b|\b__filename\b/

// Putus jenis modul dari isi file. ESM menang bila ada pernyataan import/export di awal
// baris (require() bisa muncul di ESM lewat createRequire, jadi tidak menentukan).
function sniff(src) {
  if (ESM_RE.test(src)) return 'module'
  if (CJS_RE.test(src)) return 'commonjs'
  return null
}

function inVx(p) {
  return p === VX_ROOT || p.startsWith(VX_ROOT + path.sep)
}

function install() {
  if (global._vxBootstrapDone) return
  global._vxBootstrapDone = true

  // ── Hook ESM (juga dipakai require(esm) di Node 22) ──────────────────────────
  if (typeof Module.registerHooks === 'function') {
    Module.registerHooks({
      resolve(spec, ctx, next) {
        if (ALIASES[spec]) spec = ALIASES[spec]
        else if (STUBS[spec]) return { url: STUBS[spec], shortCircuit: true }
        else if (VX_SHIMS[spec] && ctx.parentURL && ctx.parentURL.startsWith('file://')) {
          try {
            if (inVx(fileURLToPath(ctx.parentURL))) {
              return { url: pathToFileURL(VX_SHIMS[spec]).href, shortCircuit: true }
            }
          } catch { /* jatuh ke resolver bawaan */ }
        }
        return next(spec, ctx)
      },
      load(url, ctx, next) {
        if (url.startsWith('file://')) {
          let p
          try { p = fileURLToPath(url) } catch { p = null }
          if (p && inVx(p) && /\.(js|mjs|cjs)$/.test(p)) {
            try {
              const src = fs.readFileSync(p, 'utf8')
              const format = sniff(src)
              if (format) return { format, source: src, shortCircuit: true }
            } catch { /* jatuh ke resolver bawaan */ }
          }
        }
        return next(url, ctx)
      },
    })
  } else {
    console.error('[vx] Node terlalu tua: module.registerHooks tidak ada. Butuh Node >= 22.15.')
  }

  // ── Alias untuk require() CJS murni ─────────────────────────────────────────
  const origResolve = Module._resolveFilename
  Module._resolveFilename = function (request, parent, ...rest) {
    if (ALIASES[request]) request = ALIASES[request]
    else if (STUBS[request]) return STUBS[request]
    else if (VX_SHIMS[request] && parent?.filename && inVx(parent.filename)) return VX_SHIMS[request]
    return origResolve.call(this, request, parent, ...rest)
  }

  // vanXone memanggil globalThis.__ourinCatch?.(error); sediakan no-op yang aman.
  if (typeof globalThis.__ourinCatch !== 'function') {
    globalThis.__ourinCatch = (e) => { try { console.error('[vx]', e?.message || e) } catch {} }
  }

  installDbBridge()
}

// ── Jembatan bentuk database ─────────────────────────────────────────────────
// vanXone mengakses global.db.data.{users,chats,settings,stats,...}; Alya memakai
// global.db.{users,chats,...} tanpa pembungkus .data. Bridge ini:
//   - koleksi inti Alya dibagi by-reference (tulisan vx ikut tersimpan saveDB),
//   - owner/premium/sewa memantul ke state Alya (global.owner, global.prem),
//   - koleksi khusus vanXone (stats, autoai, characterai, ...) dibuat malas di db
//     Alya supaya ikut persist,
//   - `global.db.data = {}` (reset ala vanXone) diabaikan agar data Alya aman,
//   - dipasang ulang setiap global.db di-assign ulang (alya.js loadDB).
// .data non-enumerable → JSON.stringify(global.db) tidak menggandakan isi db.
function installDbBridge() {
  const ARRAY_KEYS = new Set(['owner', 'premium', 'sewa'])
  const install = (db) => {
    if (!db || typeof db !== 'object' || db.__vxDataBridged) return
    try {
      Object.defineProperty(db, 'data', {
        configurable: true, enumerable: false,
        get() {
          return new Proxy(db, {
            get(t, k) {
              if (typeof k !== 'string') return t[k]
              if (k === 'owner' && Array.isArray(global.owner)) return global.owner
              if (k === 'premium' && Array.isArray(global.prem)) return global.prem
              if (k === 'sewa' && Array.isArray(global.sewa)) return global.sewa
              if (t[k] === undefined) t[k] = ARRAY_KEYS.has(k) ? [] : {}
              return t[k]
            },
            set(t, k, v) { t[k] = v; return true },
            has(t, k) { return k in t },
          })
        },
        set() { /* reset db ala vanXone diabaikan — data Alya dilindungi */ },
      })
      Object.defineProperty(db, '__vxDataBridged', { value: true, enumerable: false, configurable: true })
    } catch { /* db beku/aneh: biarkan apa adanya */ }
  }
  let _db = global.db
  install(_db)
  try {
    Object.defineProperty(globalThis, 'db', {
      configurable: true, enumerable: true,
      get() { return _db },
      set(v) { _db = v; install(v) },
    })
  } catch { /* fallback: bridge hanya untuk db saat ini */ }
}

// Daftarkan stub untuk paket yang gagal dipasang (dipanggil setelah bootstrap).
function addStub(pkg, absPath) {
  STUBS[pkg] = absPath
}

install()

module.exports = { install, sniff, addStub, ALIASES, STUBS, VX_SHIMS, VX_ROOT, REPO }
