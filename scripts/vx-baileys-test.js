// scripts/vx-baileys-test.js — uji fokus interoperabilitas modul untuk porting.
// User requirement: "pastikan model ESM -> CJS dari baileys berfungsi,
// jadi support kode apa aja". Sengaja diuji lewat loader yang sama dengan produksi.
'use strict'
const path = require('path')
const REPO = path.join(__dirname, '..')

// Inisialisasi db minimal diperlukan sebagian plugin saat load.
global.db = { users: {}, chats: {}, groups: {}, settings: {}, others: {} }
global.mess = { only: {} }
global.botname = 'Alya'

const { loadPlugin } = require(path.join(REPO, 'lib/vx/loader'))
require(path.join(REPO, 'lib/vx/dispatch')) // pasang settings + globals seperti produksi

const results = {}
const check = (name, fn) => {
  try { results[name] = fn() } catch (e) { results[name] = 'THREW: ' + (e?.message || e) }
}

;(async () => {
  // 1. CJS plugin require('baileys') → harus dapat fork, bukan paket npm asli.
  await (async () => {
    try {
      const p = await loadPlugin('engine/aurora/plugins/game/quoridormp.js')
      check('cjs_require_baileys_plugin', () => p.handler ? 'PASS handler=' + p.handler.name : 'FAIL no handler')
    } catch (e) { results.cjs_require_baileys_plugin = 'THREW: ' + e.message }
  })()

  // 2. ESM plugin import '@itsliaaa/baileys' → alias ke fork yang sama.
  await (async () => {
    try {
      const p = await loadPlugin('engine/lumen/plugins/tools/tth.js')
      check('esm_alias_itsliaaa_baileys', () => p.handler ? 'PASS handler=' + p.handler.name : 'FAIL no handler')
    } catch (e) { results.esm_alias_itsliaaa_baileys = 'THREW: ' + e.message }
  })()

  // 3. Vortex CJS wrapper: __naren_imp('baileys-mbuilder') → shim AIRich dari fork.
  await (async () => {
    try {
      const p = await loadPlugin('engine/vortex/plugins/search/pin2.js')
      check('vortex_baileys_mbuilder_shim', () => p.handler ? 'PASS handler=' + p.handler.name : 'FAIL no handler')
    } catch (e) { results.vortex_baileys_mbuilder_shim = 'THREW: ' + e.message }
  })()

  // 4. Fork teresolusi benar & mengekspor AIRich + fungsi koneksi.
  check('fork_identity_and_exports', () => {
    const b = require('@whiskeysockets/baileys')
    // Fork mengekspor AIRich di level atas (CJS namespace); ESM namespace di shim
    // memuatnya lewat `import * as B` → B.AIRich. Keduanya harus tersedia.
    const ok = !!b && 'AIRich' in b
    const conns = ['makeWASocket', 'useMultiFileAuthState', 'fetchLatestBaileysVersion', 'downloadMediaMessage']
      .filter(k => k in b)
    return ok && conns.length >= 3 ? 'PASS AIRich + ' + conns.join(',') : 'FAIL ' + JSON.stringify({ ok, conns })
  })

  // 5. require('baileys') dari dalam pohon vx = objek yang sama dengan fork.
  check('alias_resolves_to_fork', () => {
    const req = require('node:module').createRequire(path.join(REPO, 'vx/engine/aurora/plugins/game/quoridormp.js'))
    const a = req('baileys'), b = require('@whiskeysockets/baileys')
    return a === b ? 'PASS identik' : 'FAIL berbeda'
  })

  // 6. Shim berscope: Alya tetap file-type@16 CJS (fromBuffer), vx dapat API modern.
  check('scoped_file_type_shim', () => {
    const alyaFT = require('file-type')
    const vxReq = require('node:module').createRequire(path.join(REPO, 'vx/engine/aurora/plugins/owner/github.js'))
    const vxFT = vxReq('file-type')
    return typeof alyaFT.fromBuffer === 'function' && typeof vxFT.fileTypeFromBuffer === 'function'
      ? 'PASS Alya.fromBuffer + vx.fileTypeFromBuffer'
      : 'FAIL ' + JSON.stringify({ alya: Object.keys(alyaFT).slice(0, 5), vx: Object.keys(vxFT).slice(0, 5) })
  })

  // 7. he / gradient-string shim (ESM-only → CJS caller) tetap callable.
  check('other_esm_only_shims', () => {
    const vxReq = require('node:module').createRequire(path.join(REPO, 'vx/engine/aurora/plugins/game/quoridormp.js'))
    const he = vxReq('he'), grad = vxReq('gradient-string')
    const okHe = !!he && (he.decode || he.default?.decode)
    const okGrad = typeof grad === 'function' || typeof grad.default === 'function' || typeof grad.rainbow === 'function'
    return okHe && okGrad ? 'PASS he.decode + gradient callable' : 'FAIL he=' + typeof he + ' grad=' + typeof grad
  })

  // 8. cheerio: 9 plugin vanXone memakai `import cheerio from 'cheerio'`,
  //    sedangkan cheerio@1 Alya hanya mengekspor named. Shim harus menyediakan default.
  await (async () => {
    try {
      const p = await loadPlugin('engine/lumen/plugins/game/akinator.js')
      check('cheerio_default_shim', () => p.handler ? 'PASS handler=' + p.handler.name : 'FAIL no handler')
    } catch (e) { results.cheerio_default_shim = 'THREW: ' + e.message }
  })()

  console.log(JSON.stringify(results, null, 1))
  const bad = Object.values(results).filter(v => typeof v === 'string' && !v.startsWith('PASS'))
  process.exit(bad.length ? 1 : 0)
})()
