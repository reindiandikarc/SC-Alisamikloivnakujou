import { CRAFT_RECIPES } from '../lib/data.js'
import { formatMoney, doSmelt, doCraft } from '../lib/engine.js'
import { loadMC, saveMC, reply } from '../lib/shared.js'

export async function smelt(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const result = doSmelt(mc)
  if (result.count === 0) return reply(ctx, '_🔥 Tidak ada ore yang bisa di-smelt!_')
  mc.money = (mc.money || 0) + result.totalValue
  mc.totalEarned = (mc.totalEarned || 0) + result.totalValue
  let txt = '*🔥 SMELTING SELESAI!*\n\n'
  for (const s of result.smelted)
    txt += `${s.from} → ${s.to} _💰 ${formatMoney(s.value)}_\n`
  txt += `\n*💰 Total: ${formatMoney(result.totalValue)}*\n*🏦 Saldo: ${formatMoney(mc.money)}*`
  await saveMC(moduleData, sender, mc)
  return reply(ctx, txt)
}

export async function craft(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!subArgs[0]) {
    let txt = '*🛠️ DAFTAR CRAFTING*\n\n'
    for (const [k, r] of Object.entries(CRAFT_RECIPES)) {
      const canCraft = (mc.level || 1) >= r.requiredLevel
      txt += `${canCraft ? '✅' : '🔒'} *${r.name}* _\`${k}\`_\n  _💰 Value: ${formatMoney(r.value)} | ⬆️ Lv.${r.requiredLevel}+_\n  _🧪 Bahan:_\n`
      for (const [ing, cnt] of Object.entries(r.ingredients))
        txt += `    _${ing} x${cnt}_\n`
      txt += '\n'
    }
    return reply(ctx, txt + '`.mct craft <id>`')
  }
  const result = doCraft(mc, subArgs[0].toLowerCase())
  if (result.error) return reply(ctx, `_${result.error}_`)
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*🛠️ CRAFTING BERHASIL!*\n\n*${result.item}*\n_💰 Value: ${formatMoney(result.value)}_`)
}

export async function inv(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!mc.inventory || mc.inventory.length === 0) return reply(ctx, '_🎒 Inventory kosong!_')
  const grouped = {}
  for (const item of mc.inventory) {
    const key = item.name
    if (!grouped[key]) grouped[key] = { name: item.name, count: 0, value: 0 }
    grouped[key].count++
    grouped[key].value += item.price || 0
  }
  let txt = '*🎒 INVENTORY*\n\n'
  let totalV = 0
  for (const g of Object.values(grouped)) {
    txt += `${g.name} _📦 x${g.count} | 💰 ${formatMoney(g.value)}_\n`
    totalV += g.value
  }
  txt += `\n*💰 Total Value: ${formatMoney(totalV)}*`
  return reply(ctx, txt)
}
