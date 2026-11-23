// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/ai/ai-edithair.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["edithair","hairstyle"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/ai/ai-edithair.js", alya, m, ctx),
}
