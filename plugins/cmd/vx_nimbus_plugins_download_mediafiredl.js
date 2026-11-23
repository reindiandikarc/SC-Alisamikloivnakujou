// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/download/mediafiredl.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["mediafire","mediafiredl","mf","mfdl"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/download/mediafiredl.js", alya, m, ctx),
}
