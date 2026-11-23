// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/sticker/bratextra.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["bratbahlil","bratchika","bratextra","brathd","bratkobato","bratmenhera","bratnezuko","bratpatrick","bratqiqi","bratruromiya","bratsquidward","bratumaru","bratwhite"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/sticker/bratextra.js", alya, m, ctx),
}
