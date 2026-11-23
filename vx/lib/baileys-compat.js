// Pengganti paket fork "hsnai" / "rimuru" / "engine" / "@itsliaaa/baileys" (tidak ada di npm).
// Semua fungsi yang dipakai fitur hasil porting ada di Baileys biasa. Kalau @itsliaaa/baileys terpasang
// (opsional), fungsi ekstra miliknya (AIRich, Toolkit, dst.) ikut dipakai sebagai cadangan.
'use strict'
const base = require('@whiskeysockets/baileys')
let fork = {}
try { fork = require('@itsliaaa/baileys') } catch {}
const out = { ...fork, ...base }
if (!out.default) out.default = base.default || base
module.exports = out
