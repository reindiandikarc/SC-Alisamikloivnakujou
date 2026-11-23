// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/islamic/bacaansholat.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["bacaansholat","bacaansolat"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/islamic/bacaansholat.js", alya, m, ctx),
}
