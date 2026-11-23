// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/ai/ai-models.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["claude-45","deepseek-pro","glm47","gpt-oss2b","meta-ai","webpilot"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/ai/ai-models.js", alya, m, ctx),
}
