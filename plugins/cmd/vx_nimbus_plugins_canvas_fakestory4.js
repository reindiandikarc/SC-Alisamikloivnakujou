// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/canvas/fakestory4.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["albumstory","fakestory4","fstory4","igstory4"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/canvas/fakestory4.js", alya, m, ctx),
}
