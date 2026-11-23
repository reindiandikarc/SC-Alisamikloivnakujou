// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/pushkontak/pushkontak.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["autovcf_off","autovcf_on","kelolapush","kodeunik_off","kodeunik_on","push","pushkontak","pushkontak_start","puskontak","setjedapush","skipadmin_off","skipadmin_on","stoppush","vcftarget_group","vcftarget_private"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/pushkontak/pushkontak.js", alya, m, ctx),
}
