// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/religi/ramadhan2027.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["hitungramadhan2027","ramadan2027","ramadhan2027"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/religi/ramadhan2027.js", alya, m, ctx),
}
