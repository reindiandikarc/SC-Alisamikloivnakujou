// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/canvas/fakeijazah.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakediploma","fakeijazah","ijazahfake"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/canvas/fakeijazah.js", alya, m, ctx),
}
