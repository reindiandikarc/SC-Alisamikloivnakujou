// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/fun/lifefact.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["funfacthidup","lifefact","livefunfact"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/fun/lifefact.js", alya, m, ctx),
}
