import { biomes, UPGRADES } from '../lib/data.js'
import {
  formatMoney,
  getRandomOre,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  getStreakBonus,
} from '../lib/engine.js'
import { MC, rc, loadMC, saveMC, reply } from '../lib/shared.js'

export async function mine(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (mc.miningPending && mc.miningPending.length > 0)
    return reply(ctx, '_📦 Masih ada hasil tambang!_ `.mct collect` _dulu._')
  const now = Date.now()
  if (mc.lastMineTime && now - mc.lastMineTime < MC * 1000)
    return reply(ctx, `_⏳ Tunggu *${Math.ceil((MC * 1000 - (now - mc.lastMineTime)) / 1000)}* detik_`)
  const pk = mc.usedPickaxe || 'woodpick'
  const pick = mc.pickaxes[pk]
  if (!pick) return reply(ctx, '_🪓 Pickaxe aktif tidak ada!_ `.mct picks`')
  const bk = mc.currentBiome || 'plains'
  const st = getUpgradedStats(mc, pick)
  const ePick = { ...pick, luck: st.luck, speed: st.speed, fortuneBonus: st.fortune, sellMultiplier: st.sellMultiplier }
  const ores = []
  let tv = 0
  for (let i = 0; i < (pick.comboOre || 1); i++) {
    const ore = getRandomOre(ePick, bk)
    if (ore) {
      ore.price = Math.round(ore.price * getStreakBonus(mc.streak || 0).mult)
      ores.push(ore)
      tv += ore.price
    }
  }
  mc.miningPending = ores
  mc.lastMineTime = now
  mc.streak = (mc.streak || 0) + 1
  await saveMC(moduleData, sender, mc)

  await reply(ctx, `*_⛏️ Menambang di ${biomes[bk]?.name || bk}..._*\n_🪓 Pick: ${pick.name} | 🍀 Luck: ${(st.luck * 100).toFixed(1)}%_`)
  await new Promise((r) => setTimeout(r, Math.min(Math.max(2000, 5000 - (pick.speed || 0) * 3000), 4000)))

  let txt = '*⛏️ HASIL MENAMBANG!*\n\n'
  for (const o of ores) {
    txt += `${rc(o.rarity)} *${o.name}*\n   _💰 ${formatMoney(o.price)} | 📦 x${o.stack}_\n`
  }
  txt += `\n*💰 Total: ${formatMoney(tv)}*`
  if (mc.streak >= 3) txt += `\n_🔥 Streak: ${mc.streak}x_`
  txt += '\n\n`.mct collect` untuk 📦 mengambil!'
  return reply(ctx, txt)
}

export async function collect(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!mc.miningPending || mc.miningPending.length === 0)
    return reply(ctx, '_📭 Tidak ada hasil._ `.mct mine` _dulu!_')
  const ores = mc.miningPending
  let tv = 0
  let te = 0
  const nf = []
  for (const ore of ores) {
    tv += ore.price
    te += Math.max(10, Math.floor(ore.price / 50))
    const cn = ore.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
    if (!mc.oreFound.includes(cn)) {
      mc.oreFound.push(cn)
      nf.push(cn)
    }
  }
  mc.money = (mc.money || 0) + tv
  mc.blocksMined = (mc.blocksMined || 0) + ores.reduce((a, o) => a + (o.stack || 1), 0)
  mc.totalEarned = (mc.totalEarned || 0) + tv
  mc.inventory = [...(mc.inventory || []), ...ores]
  const rlu = addPickExp(mc, mc.usedPickaxe || 'woodpick', te)
  const plu = addPlayerExp(mc, te)
  mc.miningPending = []
  await saveMC(moduleData, sender, mc)

  let txt = `*📦 HASIL DIAMBIL!*\n\n💰 +${formatMoney(tv)}\n⭐ +${te} EXP\n🧱 +${ores.length} ore\n`
  if (nf.length > 0) txt += `\n*🆕 Ore Baru:* ${nf.join(', ')}`
  if (rlu) txt += `\n\n${rlu}`
  if (plu) txt += `\n*⬆️ LEVEL UP! Level ${mc.level}*`
  return reply(ctx, txt)
}

export async function sell(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!mc.inventory || mc.inventory.length === 0)
    return reply(ctx, '_🎒 Inventory kosong!_ `.mct mine` _dulu._')
  let tv = 0
  for (const item of mc.inventory) tv += item.price || 0
  const sb = UPGRADES.fortune.effect(mc.fortuneUpgrade || 0)
  const pick = mc.pickaxes[mc.usedPickaxe || 'woodpick']
  const rsm = pick ? pick.sellMultiplier || 0 : 0
  const fv = Math.round(tv * (1 + sb + rsm))
  const fc2 = mc.inventory.length
  mc.money = (mc.money || 0) + fv
  mc.totalEarned = (mc.totalEarned || 0) + fv
  mc.inventory = []
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*💸 ORE TERJUAL!*\n\n📦 Jumlah: ${fc2}\n💰 Total: ${formatMoney(fv)}\n🏦 Saldo: ${formatMoney(mc.money)}`)
}
