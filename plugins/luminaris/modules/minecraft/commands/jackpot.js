import { JACKPOT_POOLS } from '../lib/engine.js'
import { formatMoney, doJackpotPull } from '../lib/engine.js'
import { loadMC, saveMC, reply, jackpotLabel, applyJackpotReward } from '../lib/shared.js'

export async function jackpot(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!subArgs[0]) {
    let txt = `*🎰 JACKPOT SYSTEM*\n\n_💎 Sistem jackpot dengan hadiah super besar!_\n_🎁 Hadiah energi/limit/premium dikonversi ke koin!_\n\n`
    for (const pool of JACKPOT_POOLS) {
      txt += `*${pool.name}*\n  _💰 Biaya: ${formatMoney(pool.cost)}_\n  _🎯 Rate: ${pool.weight}%_\n  _🎁 Rewards:_\n`
      for (const rw of pool.rewards) {
        txt += `    _${jackpotLabel(rw.type)}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`
      }
      txt += '\n'
    }
    return reply(ctx, txt + '`.mct jackpot <iron/gold/diamond/netherite/dragon>`')
  }
  const poolId = subArgs[0].toLowerCase()
  const pool = JACKPOT_POOLS.find((p) => p.id === poolId)
  if (!pool) return reply(ctx, '_🎰 Tier tidak ada!_ `.mct jackpot`')
  if ((mc.money || 0) < pool.cost) return reply(ctx, `_💸 Uang kurang! Butuh ${formatMoney(pool.cost)}_`)
  mc.money -= pool.cost
  const result = doJackpotPull(mc, poolId)
  if (!result) return reply(ctx, '_❌ Gagal! Coba lagi._')
  const applied = await applyJackpotReward(mc, result)
  await saveMC(moduleData, sender, mc)
  const isBig = ['premium_7d', 'premium_30d', 'partner_7d', 'partner_30d', 'unlimited_energi', 'unlimited_limit', 'owner_reward'].includes(result.reward.type)
  let txt = `*🎰 ${pool.name.toUpperCase()}!*\n\n`
  if (isBig) txt += '*💥 JACKPOT BESAR!*\n\n'
  txt += `${applied.desc}\n\n_💰 Biaya: ${formatMoney(pool.cost)}_\n_🏦 Saldo: ${formatMoney(mc.money)}_`
  return reply(ctx, txt)
}
