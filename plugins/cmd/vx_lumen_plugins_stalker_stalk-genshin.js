// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/stalker/stalk-genshin.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["stalkgi"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/stalker/stalk-genshin.js", alya, m, ctx),
}
