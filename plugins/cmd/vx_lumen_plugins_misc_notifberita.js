// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/misc/notifberita.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["intervalberita","notifberita","setberita"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/misc/notifberita.js", alya, m, ctx),
}
