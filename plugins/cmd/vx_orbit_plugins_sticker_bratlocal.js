// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/orbit/plugins/sticker/bratlocal.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["gojo","gojovid","vermeil","vermeilvid"],
  run: (alya, m, ctx) => runFile("engine/orbit/plugins/sticker/bratlocal.js", alya, m, ctx),
}
