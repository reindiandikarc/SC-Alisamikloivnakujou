// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/aurora/plugins/premium/netflixprem.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["netflixprem","netflixpremium","nfprem"],
  run: (alya, m, ctx) => runFile("engine/aurora/plugins/premium/netflixprem.js", alya, m, ctx),
}
