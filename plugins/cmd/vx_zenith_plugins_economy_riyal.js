// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/economy/riyal.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["arab","konversiriyal","kursriyal","riyal","sar","saudi"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/economy/riyal.js", alya, m, ctx),
}
