// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/ai/kimi-vision.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["kimi-v","kimi-vision","kimivision"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/ai/kimi-vision.js", alya, m, ctx),
}
