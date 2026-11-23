// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/aurora/plugins/tools/pdf2img.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["pdf2image","pdf2img","pdftoimg"],
  run: (alya, m, ctx) => runFile("engine/aurora/plugins/tools/pdf2img.js", alya, m, ctx),
}
