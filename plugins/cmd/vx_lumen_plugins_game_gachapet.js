// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/game/gachapet.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["gachapet","mypet","pet","petgacha","petstatus","reroll"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/game/gachapet.js", alya, m, ctx),
}
