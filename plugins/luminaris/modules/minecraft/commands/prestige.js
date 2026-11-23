import { pickaxes, UPGRADES, TOKEN_SHOP } from '../lib/data.js'
import { formatMoney } from '../lib/engine.js'
import { loadMC, saveMC, reply } from '../lib/shared.js'

export async function upgrade(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const type = subArgs[0] ? subArgs[0].toLowerCase() : ''
  if (!type || !UPGRADES[type]) {
    let txt = '*📈 UPGRADE SHOP*\n\n'
    for (const [k, u] of Object.entries(UPGRADES)) {
      const lv = mc[k + 'Upgrade'] || 0
      txt += `*${u.name}* _(Lv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? '_✅ MAXED_' : `_💰 Next: ${formatMoney(u.getCost(lv))}_`}\n\n`
    }
    return reply(ctx, txt + '\n`.mct upgrade <luck/speed/fortune/combat>`')
  }
  const upg = UPGRADES[type]
  const lv = mc[type + 'Upgrade'] || 0
  if (lv >= upg.maxLevel) return reply(ctx, '_✅ Sudah max!_')
  const cost = upg.getCost(lv)
  if ((mc.money || 0) < cost) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(cost)}_`)
  mc.money -= cost
  mc[type + 'Upgrade'] = lv + 1
  if (type === 'combat') mc.atk = 4 + Math.floor(mc.level * 0.5) + (lv + 1) * 3
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*⬆️ ${upg.name} LEVEL UP!*\n\n_⬆️ Level ${lv + 1}_\n_💰 Biaya: ${formatMoney(cost)}_\n_${upg.desc}_`)
}

export async function prestige(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const cp = mc.prestige || 0
  if (subArgs[0] && subArgs[0].toLowerCase() === 'confirm') {
    const reqs = [
      { blocks: 500, money: 2e10 },
      { blocks: 1500, money: 2e12 },
      { blocks: 4000, money: 2e14 },
      { blocks: 10000, money: 2e19 },
      { blocks: 25000, money: 2e22 },
    ]
    const req = reqs[cp]
    if (!req) return reply(ctx, '_👑 Sudah max prestige!_')
    if ((mc.blocksMined || 0) < req.blocks) return reply(ctx, `_🧱 Blocks kurang! Butuh ${req.blocks}_`)
    if ((mc.money || 0) < req.money) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(req.money)}_`)
    mc.prestige = cp + 1
    mc.money = Math.floor(mc.money * 0.1)
    mc.blocksMined = 0
    mc.streak = 0
    mc.prestigeTokens = (mc.prestigeTokens || 0) + [60, 180, 600, 1200, 6000][cp]
    const titles = ['Penambang Baru', 'Veteran', 'Master Miner', 'Legend', 'Transcendent', 'God of Mining']
    if (cp === 0 && !mc.pickaxes.prestigepick) mc.pickaxes.prestigepick = { ...pickaxes.prestigepick }
    if (cp === 2 && !mc.pickaxes.cosmicpick) mc.pickaxes.cosmicpick = { ...pickaxes.cosmicpick }
    await saveMC(moduleData, sender, mc)
    return reply(ctx, `*👑 PRESTIGE UP!*\n\n*🏷️ Title:* ${titles[mc.prestige]}\n*🪙 Tokens:* ${mc.prestigeTokens}\n\n_💸 Uang -90%, 🧱 blocks count reset_`)
  }
  let txt = `*👑 PRESTIGE SYSTEM*\n\n*👑 Prestige:* ${cp}\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n\n`
  const allReqs = [
    { lv: 1, blocks: 500, money: 2e10, rw: 'Prestige Pickaxe + 60 tokens' },
    { lv: 2, blocks: 1500, money: 2e12, rw: 'Luck +20% + 180 tokens' },
    { lv: 3, blocks: 4000, money: 2e14, rw: 'Cosmic Pickaxe + 600 tokens' },
    { lv: 4, blocks: 10000, money: 2e19, rw: '2x EXP + 1200 tokens' },
    { lv: 5, blocks: 25000, money: 2e22, rw: 'Omega Pickaxe + 6000 tokens' },
  ]
  for (const r of allReqs)
    txt += `${cp >= r.lv ? '✅' : '🔒'} *P${r.lv}*: _🧱 ${r.blocks} blocks | 💰 ${formatMoney(r.money)}_\n  _${r.rw}_\n\n`
  return reply(ctx, txt + '\n`.mct prestige confirm` _(hati-hati!)_')
}

export async function tokens(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!subArgs[0]) {
    let txt = `*🪙 TOKEN STORE*\n\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n\n`
    for (const item of TOKEN_SHOP)
      txt += `*${item.name}* _🪙 ${item.cost} tokens_\n`
    return reply(ctx, txt + '\n`.mct tokens <id>`')
  }
  const iid = subArgs[0].toLowerCase()
  const item = TOKEN_SHOP.find((i) => i.id === iid)
  if (!item) return reply(ctx, '_🛒 Item tidak ada!_ `.mct tokens`')
  if ((mc.prestigeTokens || 0) < item.cost) return reply(ctx, `_🪙 Tokens kurang! Butuh ${item.cost}_`)
  mc.prestigeTokens -= item.cost
  switch (item.type) {
    case 'pickaxe':
      if (pickaxes[item.value] && !mc.pickaxes[item.value]) {
        mc.pickaxes[item.value] = { ...pickaxes[item.value] }
      } else {
        mc.prestigeTokens += item.cost
        return reply(ctx, '_✅ Sudah punya pickaxe ini!_')
      }
      break
    case 'tickets':
      mc.gachaTickets = (mc.gachaTickets || 0) + item.value
      break
    case 'coins':
      mc.money = (mc.money || 0) + item.value
      break
  }
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*🛍️ ITEM DIBELI!*\n\n*${item.name}* _seharga 🪙 ${item.cost} tokens_`)
}
