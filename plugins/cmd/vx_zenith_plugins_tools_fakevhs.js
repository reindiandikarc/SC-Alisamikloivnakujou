// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/tools/fakevhs.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakevhs","handycam","retrovhs","vhscam"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/tools/fakevhs.js", alya, m, ctx),
}
