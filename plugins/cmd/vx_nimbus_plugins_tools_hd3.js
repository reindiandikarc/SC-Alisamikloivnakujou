// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/tools/hd3.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["enhance3","hd3","unblur","upscale3"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/tools/hd3.js", alya, m, ctx),
}
