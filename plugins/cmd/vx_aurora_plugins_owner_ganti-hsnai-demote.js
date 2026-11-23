// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/aurora/plugins/owner/ganti-hsnai-demote.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["ganti-hsnai-demote.jpg","gantihsnaidemote","sethsnaidemote"],
  run: (alya, m, ctx) => runFile("engine/aurora/plugins/owner/ganti-hsnai-demote.js", alya, m, ctx),
}
