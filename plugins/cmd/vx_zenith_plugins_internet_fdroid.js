// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/internet/fdroid.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fdroid","fdroidapp","fdroiddl","fdroidsearch"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/internet/fdroid.js", alya, m, ctx),
}
