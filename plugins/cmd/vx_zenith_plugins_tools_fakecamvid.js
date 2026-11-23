// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/tools/fakecamvid.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["fakecamvid","paplivevid","vcam"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/tools/fakecamvid.js", alya, m, ctx),
}
