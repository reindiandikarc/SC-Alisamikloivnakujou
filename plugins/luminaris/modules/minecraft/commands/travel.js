import { biomes, travelRequirements } from '../lib/data.js'
import { formatMoney } from '../lib/engine.js'
import { loadMC, saveMC, reply } from '../lib/shared.js'

export async function travel(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!subArgs[0]) {
    let txt = '*🗺️ DAFTAR BIOME*\n\n'
    for (const [k, b] of Object.entries(biomes)) {
      const req = travelRequirements[k]
      const ok = (mc.travelFound || []).includes(k)
      txt += `${ok ? '✅' : '🔒'} *${b.name}*${mc.currentBiome === k ? ' _< Now_' : ''}\n`
      txt += req ? `   _💰 ${formatMoney(req.money)} | 🧱 ${req.blocks} blocks_\n` : `   _🆓 Free_\n`
    }
    return reply(ctx, txt + '\n`.mct travel <biome>`')
  }
  const tk = subArgs[0].toLowerCase()
  if (!biomes[tk]) return reply(ctx, '_🗺️ Biome tidak ada!_ `.mct travel`')
  if (mc.currentBiome === tk) return reply(ctx, `_📍 Sudah di ${biomes[tk].name}!_`)
  const req = travelRequirements[tk]
  if (req) {
    if ((mc.money || 0) < req.money) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(req.money)}_`)
    if ((mc.blocksMined || 0) < req.blocks) return reply(ctx, `_🧱 Blocks kurang! Butuh ${req.blocks}_`)
    mc.money -= req.money
  }
  if (!(mc.travelFound || []).includes(tk)) mc.travelFound = [...(mc.travelFound || []), tk]
  mc.currentBiome = tk
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*🚪 PINDAH BIOME!*\n\n📍 Sekarang di *${biomes[tk].name}*\n🧱 ${biomes[tk].listOre.length} jenis ore tersedia`)
}
