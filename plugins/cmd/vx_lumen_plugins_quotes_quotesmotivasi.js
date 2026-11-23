// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/quotes/quotesmotivasi.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["motivasi","quotesmotivasi"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/quotes/quotesmotivasi.js", alya, m, ctx),
}
