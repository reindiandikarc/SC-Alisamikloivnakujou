// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/canvas/fakeml.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakeml","mlbbfake","mlcard","mlfake"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/canvas/fakeml.js", alya, m, ctx),
}
