// [vx] Wrapper porting vanXone — dibuat otomatis oleh scripts/vx-wire.js.
// Kode sumber vanXone utuh di vx/engine/zenith/plugins/ephoto/ephoto.js; loader universal + adapter di lib/vx/.
// Jangan ubah manual: jalankan ulang scripts/vx-wire.js setelah perubahan.
'use strict'
const { runFile } = require('../../lib/vx/dispatch')
module.exports = {
  command: ["1917style","advancedglow","amongustext","blackpinklogo","blackpinkstyle","cartoonstyle","deletingtext","effectclouds","ephoto","flag3dtext","flagtext","freecreate","galaxystyle","galaxywallpaper","glitchtext","glowingtext","gradienttext","lighteffects","logomaker","luxurygold","makingneon","multicoloredneon","neonglitch","papercutstyle","pixelglitch","rainytext","royaltext","sandsummer","summerbeach","typographytext","underwatertext","watercolortext","writetext"],
  run: (alya, m, ctx) => runFile("engine/zenith/plugins/ephoto/ephoto.js", alya, m, ctx),
}
