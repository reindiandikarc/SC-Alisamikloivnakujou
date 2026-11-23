import { pickaxes, pickEnchants, GACHA_COST_COINS, GACHA_PITY_LIMIT } from '../lib/data.js'
import { formatMoney, doGachaPull } from '../lib/engine.js'
import { loadMC, saveMC, reply } from '../lib/shared.js'

export async function gacha(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const useT = subArgs[0] && subArgs[0].toLowerCase() === 'ticket'
  if (useT) {
    if ((mc.gachaTickets || 0) < 1) return reply(ctx, `_🎟️ Tiket habis! Punya ${mc.gachaTickets || 0}_`)
    mc.gachaTickets -= 1
  } else {
    if ((mc.money || 0) < GACHA_COST_COINS) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(GACHA_COST_COINS)}_`)
    mc.money -= GACHA_COST_COINS
  }
  const result = doGachaPull(mc)
  const item = result.item
  let txt = '*🎰 GACHA RESULT!*\n\n'
  switch (item.type) {
    case 'pickaxe':
      if (pickaxes[item.value] && !mc.pickaxes[item.value]) {
        mc.pickaxes[item.value] = { ...pickaxes[item.value] }
        txt += `🪓 DAPAT PICKAXE: *${item.label}*\n`
      } else if (mc.pickaxes[item.value]) {
        const ref = Math.floor((pickaxes[item.value] ? pickaxes[item.value].price : 0) * 0.3 || 120000)
        mc.money = (mc.money || 0) + ref
        txt += `♻️ Duplikat: *${item.label}* _💰 +${formatMoney(ref)}_\n`
      }
      break
    case 'tickets':
      mc.gachaTickets = (mc.gachaTickets || 0) + item.value
      txt += `🎟️ +${item.value} Tiket\n`
      break
    case 'tokens':
      mc.prestigeTokens = (mc.prestigeTokens || 0) + item.value
      txt += `🪙 +${item.value} Tokens\n`
      break
    case 'coins':
      mc.money = (mc.money || 0) + item.value
      txt += `💰 +${formatMoney(item.value)}\n`
      break
    case 'enchant_scroll': {
      const avail = Object.entries(pickEnchants).filter(([, v]) => v.rarity === item.value)
      if (avail.length > 0) {
        const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)]
        const pk2 = mc.usedPickaxe || 'woodpick'
        if (mc.pickaxes[pk2]) {
          mc.pickaxes[pk2].enchant = ek2
          txt += `✨ Enchant: *${ed.name}* _(${item.value})_ ke pickaxe!\n`
        }
      }
      break
    }
    case 'xp_boost':
      mc.exp = (mc.exp || 0) + Math.floor(mc.expToNextLevel * 0.5)
      txt += `⭐ XP Boost x${item.value}!\n`
      break
    default:
      txt += `${item.label}\n`
  }
  if (result.isSSR) txt += '\n*🌈 SSR PULL!*'
  if (result.pity) txt += '\n*🔥 Pity Activated!*'
  txt += `\n\n_🔥 Pity: ${mc.gachaPity}/${GACHA_PITY_LIMIT}_\n_🏦 Saldo: ${formatMoney(mc.money)} | 🎟️ Tiket: ${mc.gachaTickets}_`
  await saveMC(moduleData, sender, mc)
  return reply(ctx, txt)
}
