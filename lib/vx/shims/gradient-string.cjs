// Shim 'gradient-string' untuk kode vanXone CJS: gradient-string@3 ESM-only,
// require(esm) menghasilkan namespace { default: fn, ... }, bukan fungsi.
// Kode vanXone (aurora/src/lib/colors.js) memanggil gradient([...]) langsung.
'use strict'
const ns = require('gradient-string')
const g = ns.default || ns
for (const k of Object.keys(ns)) {
  if (k !== 'default' && !(k in g)) { try { g[k] = ns[k] } catch {} }
}
module.exports = g
