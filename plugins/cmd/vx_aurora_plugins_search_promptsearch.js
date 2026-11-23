// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/aurora/plugins/search/promptsearch.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["cariprompt","promptcari","prompthero","promptsearch","searchprompt"],
  run: (alya, m, ctx) => runFile("engine/aurora/plugins/search/promptsearch.js", alya, m, ctx),
}
