// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/aurora/plugins/tools/ssweb-3hasil.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["screenshot3","screenshotweb3","ss3","ssweb-3hasil","ssweb3"],
  run: (alya, m, ctx) => runFile("engine/aurora/plugins/tools/ssweb-3hasil.js", alya, m, ctx),
}
