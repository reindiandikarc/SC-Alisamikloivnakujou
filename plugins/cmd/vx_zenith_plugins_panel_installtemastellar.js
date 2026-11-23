// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/panel/installtemastellar.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["installtemastellar","installthemastellar","temastellar"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/panel/installtemastellar.js", alya, m, ctx),
}
