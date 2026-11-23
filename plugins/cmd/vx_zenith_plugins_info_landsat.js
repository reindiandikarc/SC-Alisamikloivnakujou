// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/info/landsat.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["bumiku","landsat","namabumi","namasatelit","nasabanner","nasaname","satelit"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/info/landsat.js", alya, m, ctx),
}
