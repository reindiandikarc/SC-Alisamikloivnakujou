import { pickEnchants } from '../lib/data.js'
import { formatMoney, addPickExp } from '../lib/engine.js'
import { rc, encCost, loadMC, saveMC, reply } from '../lib/shared.js'

export async function enchant(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pk = mc.usedPickaxe || 'woodpick'
  const pick = mc.pickaxes[pk]
  if (!pick) return reply(ctx, '_🪓 Pickaxe aktif tidak ada!_')
  const ek = subArgs[0] ? subArgs[0].toLowerCase() : ''
  if (!ek) {
    if (pick.enchant) {
      const e = pickEnchants[pick.enchant]
      return reply(ctx, `_✨ Enchant saat ini: *${e ? e.name : pick.enchant}* (${e ? e.rarity : '?'})_\n\`.mct enchant <key>\` untuk ganti`)
    }
    return reply(ctx, '_✨ Tentukan enchant!_ `.mct enchants`')
  }
  if (!pickEnchants[ek]) return reply(ctx, '_✨ Enchant tidak ada!_ `.mct enchants`')
  const ench = pickEnchants[ek]
  const cost = encCost(ench.rarity)
  if ((mc.money || 0) < cost) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(cost)}_`)
  mc.money -= cost
  pick.enchant = ek
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*✨ ENCHANT DIPASANG!*\n\n*${ench.name}* _(${ench.rarity})_ ke *${pick.name}*\n_${ench.desc}_\n_💰 Biaya: ${formatMoney(cost)}_`)
}

export async function enchants(ctx) {
  const byR = {}
  for (const [k, e] of Object.entries(pickEnchants)) {
    if (!byR[e.rarity]) byR[e.rarity] = []
    byR[e.rarity].push({ key: k, name: e.name, desc: e.desc })
  }
  let txt = '*📜 DAFTAR ENCHANTMENT*\n\n'
  for (const r of ['common', 'rare', 'epic', 'legendary', 'mythic', 'godly', 'secret']) {
    const list = byR[r]
    if (!list) continue
    txt += `${rc(r)} *${r.toUpperCase()}* _${formatMoney(encCost(r))}_\n`
    for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`
    txt += '\n'
  }
  return reply(ctx, txt.trim() + '\n`.mct enchant <key>`')
}

export async function pickup(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pk = mc.usedPickaxe || 'woodpick'
  const pick = mc.pickaxes[pk]
  if (!pick) return reply(ctx, '_🪓 Pickaxe aktif tidak ada!_')
  if (pick.level >= pick.maxLevel) return reply(ctx, '_⬆️ Pickaxe sudah max level!_')
  const cost = Math.floor(pick.price * 0.1 * pick.level) || 12000 * pick.level
  if ((mc.money || 0) < cost) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(cost)}_`)
  mc.money -= cost
  const res = addPickExp(mc, pk, Math.floor(pick.expToNextLevel * 0.5))
  await saveMC(moduleData, sender, mc)
  return reply(ctx, res
    ? `*⬆️ PICKAXE UPGRADED!*\n\n${res}\n_💰 Biaya: ${formatMoney(cost)}_`
    : `*⭐ PICKAXE EXP UP!*\n\n⭐ +${Math.floor(pick.expToNextLevel * 0.5)} EXP\n_💰 Biaya: ${formatMoney(cost)}_`)
}
