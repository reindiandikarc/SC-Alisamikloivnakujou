// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/orbit/plugins/canvas/iqcmerah.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["iqc-red","iqcmerah","rediqc"],
  run: (alya, m, ctx) => runFile("engine/orbit/plugins/canvas/iqcmerah.js", alya, m, ctx),
}
