// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/cewerandom/justinaxie.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["justina","justinaxie"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/cewerandom/justinaxie.js", alya, m, ctx),
}
