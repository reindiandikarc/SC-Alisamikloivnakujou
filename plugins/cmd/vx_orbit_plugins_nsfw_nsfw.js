// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/orbit/plugins/nsfw/nsfw.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["ass","bdsm","blowjob","cum","gangbang","hentai","manstrubation","nsfw","nsfwmenu","nsfwoff","nsfwon","opaianime","oppai","oppaianimee","trap","waifunsfw"],
  run: (alya, m, ctx) => runFile("engine/orbit/plugins/nsfw/nsfw.js", alya, m, ctx),
}
