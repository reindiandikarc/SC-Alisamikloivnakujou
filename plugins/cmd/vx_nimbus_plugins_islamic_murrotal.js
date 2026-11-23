// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/nimbus/plugins/islamic/murrotal.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["audioquran","murottal","murrotal","quraudio"],
  run: (alya, m, ctx) => runFile("engine/nimbus/plugins/islamic/murrotal.js", alya, m, ctx),
}
