// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/info/info-runtime.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["alive","botinfo","infobot","runtime","statusbot"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/info/info-runtime.js", alya, m, ctx),
}
