// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/sticker/linesticker.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["line","linepack","linesticker"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/sticker/linesticker.js", alya, m, ctx),
}
