// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/canvas/fakengl.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakengl","fngl","nglfake"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/canvas/fakengl.js", alya, m, ctx),
}
