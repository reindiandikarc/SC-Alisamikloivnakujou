// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/anime/animetrailer.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["animepromo","animepv","animetrailer","traileranime"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/anime/animetrailer.js", alya, m, ctx),
}
