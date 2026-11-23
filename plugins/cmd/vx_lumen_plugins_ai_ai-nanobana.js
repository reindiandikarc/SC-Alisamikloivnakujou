// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/ai/ai-nanobana.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["editimage","nanobanana"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/ai/ai-nanobana.js", alya, m, ctx),
}
