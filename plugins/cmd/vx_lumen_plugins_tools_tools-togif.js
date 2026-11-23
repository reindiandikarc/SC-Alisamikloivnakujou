// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/lumen/plugins/tools/tools-togif.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["sticker2mp4","stickertomp4","togif","tomp4","webp2mp4"],
  run: (alya, m, ctx) => runFile("engine/lumen/plugins/tools/tools-togif.js", alya, m, ctx),
}
