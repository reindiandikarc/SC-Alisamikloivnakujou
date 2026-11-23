// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/quotes/quotesgombal.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["gombal","quotesgombal"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/quotes/quotesgombal.js", alya, m, ctx),
}
