// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/sticker/sticker-stikwiki.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["stikwiki"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/sticker/sticker-stikwiki.js", alya, m, ctx),
}
