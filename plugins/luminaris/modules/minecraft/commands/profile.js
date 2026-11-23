import { biomes, pickEnchants, UPGRADES } from '../lib/data.js'
import { formatMoney, getUpgradedStats } from '../lib/engine.js'
import { rc, loadMC, reply } from '../lib/shared.js'

export async function me(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pick = mc.pickaxes[mc.usedPickaxe || 'woodpick']
  return reply(ctx, [
    '*👤 PROFIL PENAMBANG*',
    '',
    `*⬆️ Level:* ${mc.level} _(${mc.exp}/${mc.expToNextLevel} EXP)_`,
    `*💰 Uang:* ${formatMoney(mc.money)}`,
    `*❤️ HP:* ${mc.hp}/${mc.maxHp}`,
    `*⚔️ ATK:* ${mc.atk}`,
    `*🧱 Blocks:* ${mc.blocksMined}`,
    `*🪓 Pick:* ${pick ? pick.name : '🪵 Wooden Pickaxe'} _(Lv.${pick ? pick.level : 1})_`,
    `*🗺️ Biome:* ${biomes[mc.currentBiome] ? biomes[mc.currentBiome].name : mc.currentBiome}`,
    `*🔥 Streak:* ${mc.streak || 0}`,
    `*⚔️ Combat:* ${mc.combatWins || 0}W/${mc.combatLosses || 0}L`,
    `*👑 Prestige:* ${mc.prestige || 0}`,
    `*🪙 Tokens:* ${mc.prestigeTokens || 0}`,
    `*🎟️ Tickets:* ${mc.gachaTickets || 0}`,
    `*📚 OreBook:* ${mc.oreFound ? mc.oreFound.length : 0}`,
    `*📈 Upgrades:*`,
    `  _🍀 Luck: Lv.${mc.luckUpgrade || 0}_`,
    `  _⚡ Speed: Lv.${mc.speedUpgrade || 0}_`,
    `  _💎 Fortune: Lv.${mc.fortuneUpgrade || 0}_`,
    `  _⚔️ Combat: Lv.${mc.combatUpgrade || 0}_`,
  ].join('\n'))
}

export async function stats(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const pick = mc.pickaxes[mc.usedPickaxe || 'woodpick']
  const st = getUpgradedStats(mc, pick)
  let txt = `*📊 STATS DETAIL*\n\n*🪓 Pick: ${pick ? pick.name : 'Tidak Ada'}*\n  _⬆️ Lv.${pick ? pick.level : 1}/${pick ? pick.maxLevel : 5} | ⭐ EXP ${pick ? pick.exp : 0}/${pick ? pick.expToNextLevel : 100}_\n  _🍀 Luck: ${(st.luck * 100).toFixed(1)}% | ⚡ Speed: ${(st.speed * 100).toFixed(1)}%_\n  _💎 Fortune: +${(st.fortune * 100).toFixed(1)}% | 💰 Sell: +${(st.sellMultiplier * 100).toFixed(1)}%_\n`
  if (pick && pick.enchant) {
    const e = pickEnchants[pick.enchant]
    txt += `  _✨ Enchant: ${e ? e.name : pick.enchant} (${e ? e.rarity : '?'})_\n`
  }
  txt += `\n*⚔️ Combat*\n  _⚔️ ATK: ${mc.atk} | ❤️ HP: ${mc.hp}/${mc.maxHp}_\n  _🔥 Combat Bonus: +${(UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%_\n  _🏆 Wins: ${mc.combatWins || 0} | 💀 Losses: ${mc.combatLosses || 0}_\n`
  txt += `\n*📈 Upgrades*\n  _🍀 Luck: Lv.${mc.luckUpgrade || 0} (+${(UPGRADES.luck.effect(mc.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚡ Speed: Lv.${mc.speedUpgrade || 0} (+${(UPGRADES.speed.effect(mc.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _💎 Fortune: Lv.${mc.fortuneUpgrade || 0} (+${(UPGRADES.fortune.effect(mc.fortuneUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚔️ Combat: Lv.${mc.combatUpgrade || 0} (+${(UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%)_`
  return reply(ctx, txt)
}

export async function orebook(ctx) {
  const { sender, senderName, moduleData } = ctx
  const mc = await loadMC(moduleData, sender, senderName)
  const found = mc.oreFound || []
  if (found.length === 0) return reply(ctx, '_📚 Ore Book kosong!_ `.mct mine` _dulu_')
  let txt = `*📚 ORE BOOK* _(${found.length} ore)_\n\n`
  for (const [k, b] of Object.entries(biomes)) {
    const fl = b.listOre.filter((o) => found.includes(o.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()))
    if (fl.length > 0) {
      txt += `*${b.name}*\n`
      for (const o of fl) txt += `  ${rc(o.rarity)} ${o.name}\n`
      txt += '\n'
    }
  }
  return reply(ctx, txt.trim())
}

export async function top(ctx) {
  const { moduleData } = ctx
  const rows = await moduleData.getAllByKey('user', 'mc')
  const rankings = []
  for (const row of rows) {
    const ud = row.value || {}
    if (ud && (ud.blocksMined || ud.money)) {
      rankings.push({ jid: row.entityId, name: ud.name, blocksMined: ud.blocksMined || 0, money: ud.money || 0, level: ud.level || 1, prestige: ud.prestige || 0 })
    }
  }
  if (rankings.length === 0) return reply(ctx, '_👤 Belum ada pemain!_')
  rankings.sort((a, b) => {
    if (b.prestige !== a.prestige) return b.prestige - a.prestige
    if (b.blocksMined !== a.blocksMined) return b.blocksMined - a.blocksMined
    return b.money - a.money
  })
  let txt = '*🏆 LEADERBOARD MINECRAFT*\n\n'
  const topList = rankings.slice(0, 10)
  for (let i = 0; i < topList.length; i++) {
    const p = topList[i]
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
    // Nama sudah tersimpan di record user. Record lama (yang dibuat sebelum
    // pushName ikut disimpan) jatuh ke nomor HP.
    txt += `${medal} @${p.name || p.jid.split('@')[0]}\n  _👑 P${p.prestige} | 🧱 ${p.blocksMined} blocks | 💰 ${formatMoney(p.money)}_\n`
  }
  return reply(ctx, txt.trim())
}
