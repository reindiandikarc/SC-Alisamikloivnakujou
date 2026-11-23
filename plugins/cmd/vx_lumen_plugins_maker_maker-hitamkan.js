// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/maker/maker-hitamkan.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["tobotak","tochibi","tofigura","tofigurav2","tofigurav3","tofunk","tohitam","tojepang","tokacamata","tokamboja","tolego","toliquor","tomaid","tomirror","tomonyet","topacar","topeci","topiramida","toputih","toreal","toroblox","toroh","totato","totua","tounderground","toviking","tozombie"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/maker/maker-hitamkan.js", alya, m, ctx),
}
