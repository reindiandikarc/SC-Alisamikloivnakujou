// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/tools/tools-upgh.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["ghupload","tourlgh","uploadgh"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/tools/tools-upgh.js", alya, m, ctx),
}
