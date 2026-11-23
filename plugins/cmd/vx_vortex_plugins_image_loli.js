// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/vortex/plugins/image/loli.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["imageloli","loli2"],
  run: (alya, m, ctx) => runFile("engine/vortex/plugins/image/loli.js", alya, m, ctx),
}
