// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/aurora/plugins/owner/ganti-hsnai2.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["ganti-hsnai2.jpg","gantihsnai2","sethsnai2"],
  run: (alya, m, ctx) => runFile("engine/aurora/plugins/owner/ganti-hsnai2.js", alya, m, ctx),
}
