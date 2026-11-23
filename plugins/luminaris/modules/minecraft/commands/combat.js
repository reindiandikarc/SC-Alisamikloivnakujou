import { mobData } from '../lib/data.js'
import { formatMoney, getAvailableMobs, doCombat, healPlayer } from '../lib/engine.js'
import { rc, loadMC, saveMC, reply } from '../lib/shared.js'

export async function fight(ctx, subArgs) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  if (!subArgs[0]) {
    const mobs = getAvailableMobs(mc)
    if (mobs.length === 0) return reply(ctx, '_👹 Tidak ada mob tersedia! Naikkan level dulu._')
    let txt = `*👹 DAFTAR MOB*\n\n_❤️ HP: ${mc.hp}/${mc.maxHp} | ⚔️ ATK: ${mc.atk}_\n\n`
    for (const mob of mobs) {
      txt += `${rc(mob.rarity)} *${mob.name}*\n  _❤️ HP: ${mob.hp} | ⚔️ ATK: ${mob.atk} | ⬆️ Lv.${mob.minLevel}+_  \n`
    }
    txt += '\n`.mct fight <mob>` untuk ⚔️ menyerang!'
    return reply(ctx, txt)
  }
  const mk = subArgs[0].toLowerCase()
  if (!mobData[mk]) return reply(ctx, '_👹 Mob tidak ada!_ `.mct fight`')
  const result = doCombat(mc, mk)
  if (result.error) return reply(ctx, `_${result.error}_`)
  await saveMC(moduleData, sender, mc)
  if (result.won) {
    let txt = `*🏆 KAMU MENANG!*\n\n⚔️ Melawan *${result.mobName}*\n\n`
    for (const line of result.log) txt += `${line}\n`
    txt += `\n*⭐ EXP:* +${result.expGain}`
    if (result.drops.length > 0) {
      txt += '\n*🎁 Drops:*'
      for (const d of result.drops)
        txt += `\n  ${d.name} _💰 ${formatMoney(d.value)}_`
    }
    return reply(ctx, txt)
  } else {
    let txt = `*💀 KAMU KALAH!*\n\n⚔️ Melawan *${result.mobName}*\n\n`
    for (const line of result.log) txt += `${line}\n`
    txt += `\n_❤️ HP tersisa: ${mc.hp}/${mc.maxHp}_\n\`.mct heal\` untuk ❤️ sembuh`
    return reply(ctx, txt)
  }
}

export async function heal(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const result = healPlayer(mc)
  if (result.error) return reply(ctx, `_${result.error}_`)
  await saveMC(moduleData, sender, mc)
  return reply(ctx, `*❤️ HEAL!*\n\n❤️ HP: ${result.hp}/${mc.maxHp}\n_💰 Biaya: ${formatMoney(result.cost)}_`)
}
