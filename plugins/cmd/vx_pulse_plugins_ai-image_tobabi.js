// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/pulse/plugins/ai-image/tobabi.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["tobabi"],
  run: (alya, m, ctx) => runFile("engine/pulse/plugins/ai-image/tobabi.js", alya, m, ctx),
}
