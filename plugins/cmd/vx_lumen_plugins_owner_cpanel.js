// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/owner/cpanel.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["10gb","1gb","2gb","3gb","4gb","5gb","6gb","7gb","8gb","9gb","createadmin","deladmin","delpanel","listadmin","listpanel","pannel","unli","unlimited"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/owner/cpanel.js", alya, m, ctx),
}
