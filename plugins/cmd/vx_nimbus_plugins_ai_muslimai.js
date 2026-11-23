// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/ai/muslimai.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["islamai","muslimai","quranai"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/ai/muslimai.js", alya, m, ctx),
}
