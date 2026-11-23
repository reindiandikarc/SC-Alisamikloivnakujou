import { pickaxes, pickEnchants } from '../lib/data.js'
import { formatMoney } from '../lib/engine.js'
import { loadMC, saveMC, reply } from '../lib/shared.js'

export async function shop(ctx) {
  let txt = '*🛒 TOKO PICKAXE*\n\n'
  for (const [k, pick] of Object.entries(pickaxes)) {
    if (pick.price > 0)
      txt += `*${pick.name}*\n   _💰 ${formatMoney(pick.price)}_\n   _🍀 Luck +${(pick.luck * 100).toFixed(0)}% | ⚡ Speed +${(pick.speed * 100).toFixed(0)}% | 📦 Combo: ${pick.comboOre}_\n   _${pick.description}_\n\n`
  }
  return reply(ctx, txt + '`.mct buy <pick>`')
}

export async function buy(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pk = subArgs[0] ? subArgs[0].toLowerCase() : ''
  if (!pk) return reply(ctx, '_🪓 Tentukan pickaxe!_ `.mct shop`')
  if (!pickaxes[pk]) return reply(ctx, '_🪓 Pickaxe tidak ada!_ `.mct shop`')
  if (mc.pickaxes[pk]) return reply(ctx, `_✅ Sudah punya ${pickaxes[pk].name}!_`)
  if (pickaxes[pk].price === 0) return reply(ctx, '_🪙 Pickaxe ini dari Token/Prestige!_')
  if ((mc.money || 0) < pickaxes[pk].price) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(pickaxes[pk].price)}_`)
  mc.money -= pickaxes[pk].price
  mc.pickaxes[pk] = { ...pickaxes[pk] }
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*🛍️ PICKAXE DIBELI!*\n\n*${pickaxes[pk].name}*\n_🪓 Ketik_ \`.mct equip ${pk}\` _untuk memasang_`)
}

export async function equip(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pk = subArgs[0] ? subArgs[0].toLowerCase() : ''
  if (!pk) return reply(ctx, '_🪓 Tentukan pickaxe!_ `.mct picks`')
  if (!mc.pickaxes[pk]) return reply(ctx, '_📭 Tidak punya pickaxe ini!_ `.mct picks`')
  mc.usedPickaxe = pk
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*🪓 PICKAXE DIPASANG!*\n\n*${mc.pickaxes[pk].name}* _✅ sekarang aktif_`)
}

export async function picks(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pks = mc.pickaxes || {}
  if (Object.keys(pks).length === 0) return reply(ctx, '_📭 Tidak punya pickaxe!_')
  let txt = '*🎒 KOLEKSI PICKAXE*\n\n'
  for (const [k, pick] of Object.entries(pks)) {
    txt += `*${pick.name}*${mc.usedPickaxe === k ? ' _✅ AKTIF_' : ''}\n  _⬆️ Lv.${pick.level || 1}/${pick.maxLevel} | 🍀 Luck ${(pick.luck * 100).toFixed(0)}% | ⚡ Speed ${(pick.speed * 100).toFixed(0)}%_\n`
    if (pick.enchant)
      txt += `  _✨ Enchant: ${pickEnchants[pick.enchant] ? pickEnchants[pick.enchant].name : pick.enchant}_\n`
  }
  return reply(ctx, txt + '\n`.mct equip <pick>`')
}
