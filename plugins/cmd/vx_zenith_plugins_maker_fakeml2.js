// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/maker/fakeml2.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakecardml2","fakeml2","mlfake2","profileml2"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/maker/fakeml2.js", alya, m, ctx),
}
