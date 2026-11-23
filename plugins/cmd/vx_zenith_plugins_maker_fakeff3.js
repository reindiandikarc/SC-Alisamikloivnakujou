// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/maker/fakeff3.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakecardff3","fakeff3","fffake3","profileff3"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/maker/fakeff3.js", alya, m, ctx),
}
