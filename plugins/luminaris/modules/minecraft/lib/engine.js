import {
  biomes,
  pickaxes,
  pickEnchants,
  mobData,
  UPGRADES,
  GACHA_POOL,
  GACHA_PITY_LIMIT,
  SMELT_RECIPES,
  CRAFT_RECIPES,
  JACKPOT_POOLS,
} from './data.js'

function formatMoney(n) {
  if (n == null || isNaN(n)) return '0'
  const num = Number(n)
  if (num === 0) return '0'
  const s = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']
  let t = Math.floor(Math.log10(Math.abs(num)) / 3)
  if (t >= s.length) t = s.length - 1
  if (t < 0) return num.toFixed(2)
  const scale = Math.pow(10, t * 3)
  return Math.round((num / scale) * 100) / 100 + s[t]
}

function parseAmount(text) {
  const u = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, QA: 1e15, QI: 1e18 }
  const m = String(text)
    .toUpperCase()
    .match(/^([\d.,]+)([A-Z]*)$/)
  if (!m) return NaN
  let n = parseFloat(m[1].replace(/,/g, ''))
  if (u[m[2]]) n *= u[m[2]]
  return Math.floor(n)
}

function createMCUser() {
  return {
    money: 500,
    level: 1,
    exp: 0,
    expToNextLevel: 120,
    usedPickaxe: 'woodpick',
    pickaxes: { woodpick: { ...pickaxes.woodpick } },
    currentBiome: 'plains',
    inventory: [],
    oreFound: [],
    mobKills: 0,
    totalEarned: 0,
    gachaTickets: 0,
    gachaPity: 0,
    prestigeTokens: 0,
    prestige: 0,
    luckUpgrade: 0,
    speedUpgrade: 0,
    fortuneUpgrade: 0,
    combatUpgrade: 0,
    lastDaily: null,
    dailyStreak: 0,
    miningPending: [],
    travelFound: ['plains'],
    streak: 0,
    lastMineTime: 0,
    hp: 20,
    maxHp: 20,
    atk: 4,
    def: 0,
    combatWins: 0,
    combatLosses: 0,
    blocksMined: 0,
    achievements: [],
    smeltQueue: [],
  }
}

function getRandomOre(pickaxe, biomeKey = 'plains') {
  const biomeData = biomes[biomeKey]
  if (!biomeData) return null
  const oreList = biomeData.listOre
  const enchant = pickaxe?.enchant ? pickEnchants[pickaxe.enchant] : null
  let luckBonus = pickaxe?.luck || 0
  if (enchant?.effect?.luck) luckBonus *= enchant.effect.luck

  const rarityChance = {
    common: 1000,
    uncommon: 400 + luckBonus * 200,
    rare: 100 + luckBonus * 80,
    epic: 20 + luckBonus * 30,
    legendary: 5 + luckBonus * 15,
    mythic: 1 + luckBonus * 8,
    godly: 0.5 + luckBonus * 5,
    exotic: 0.3 + luckBonus * 4,
    secret: 1 + luckBonus * 10,
    extinct: 0.1 + luckBonus * 2,
    special: 0.05 + luckBonus * 1,
  }

  const adjustedOreList = oreList.map((o) => ({
    ...o,
    adjChance: rarityChance[o.rarity] || 1,
  }))

  const totalChance = adjustedOreList.reduce((a, b) => a + b.adjChance, 0)
  const roll = Math.random() * totalChance
  let acc = 0
  let chosen = adjustedOreList[0]
  for (const ore of adjustedOreList) {
    acc += ore.adjChance
    if (roll <= acc) {
      chosen = ore
      break
    }
  }

  let stack = chosen.minStack + Math.floor(Math.random() * (chosen.maxStack - chosen.minStack + 1))
  if (enchant?.effect?.fortune) stack = Math.ceil(stack * enchant.effect.fortune)
  if (pickaxe?.fortuneBonus) stack = Math.ceil(stack * (1 + pickaxe.fortuneBonus))

  let totalPrice = Math.round(chosen.avgValue * stack)
  if (pickaxe?.sellMultiplier) totalPrice = Math.round(totalPrice * (1 + pickaxe.sellMultiplier))
  if (enchant?.effect?.sellMultiplier) totalPrice = Math.round(totalPrice * enchant.effect.sellMultiplier)

  return {
    name: chosen.name,
    rarity: chosen.rarity,
    type: 'ore',
    stack,
    pricePerUnit: chosen.avgValue,
    price: totalPrice,
  }
}

function addPickExp(mcUser, pickKey, amount) {
  const pick = mcUser.pickaxes[pickKey]
  if (!pick || pick.level >= pick.maxLevel) return null
  pick.exp = (pick.exp || 0) + amount
  let levelUp = false
  const statsIncreased = []
  while (pick.exp >= pick.expToNextLevel && pick.level < pick.maxLevel) {
    pick.exp -= pick.expToNextLevel
    pick.level += 1
    pick.luck = parseFloat((pick.luck + 0.01).toFixed(3))
    pick.speed = parseFloat((pick.speed + 0.01).toFixed(3))
    pick.fortuneBonus = parseFloat((pick.fortuneBonus + 0.005).toFixed(4))
    pick.expToNextLevel = Math.floor(pick.expToNextLevel * 1.5)
    levelUp = true
    statsIncreased.push('Luck +1%, Speed +1%, Fortune +0.5%')
  }
  if (levelUp)
    return `⛏️ Pickaxe *${pick.name}* naik ke level ${pick.level}!\n✨ ${statsIncreased.join(', ')}`
  return null
}

function addPlayerExp(mcUser, amount) {
  mcUser.exp = (mcUser.exp || 0) + amount
  let levelUp = false
  while (mcUser.exp >= mcUser.expToNextLevel && mcUser.level < 9999) {
    mcUser.exp -= mcUser.expToNextLevel
    mcUser.level += 1
    mcUser.expToNextLevel = Math.floor(mcUser.expToNextLevel * 1.3)
    mcUser.maxHp = 20 + Math.floor(mcUser.level * 2)
    mcUser.hp = mcUser.maxHp
    mcUser.atk = 4 + Math.floor(mcUser.level * 0.5)
    levelUp = true
  }
  return levelUp
}

function getUpgradedStats(mcUser, pick) {
  const luckBonus = UPGRADES.luck.effect(mcUser.luckUpgrade || 0)
  const speedBonus = UPGRADES.speed.effect(mcUser.speedUpgrade || 0)
  const fortuneBonus = UPGRADES.fortune.effect(mcUser.fortuneUpgrade || 0)
  const combatBonus = UPGRADES.combat.effect(mcUser.combatUpgrade || 0)
  const prestigeBonus = (mcUser.prestige || 0) * 0.05
  return {
    luck: (pick.luck || 0) + luckBonus + prestigeBonus,
    speed: Math.min((pick.speed || 0) + speedBonus, 0.98),
    fortune: (pick.fortuneBonus || 0) + fortuneBonus,
    sellMultiplier: pick.sellMultiplier || 0,
    combat: (mcUser.atk || 4) * (1 + combatBonus),
  }
}

function getStreakBonus(streak) {
  if (streak >= 100) return { mult: 3.5, luckAdd: 0.15 }
  if (streak >= 50) return { mult: 2.5, luckAdd: 0.05 }
  if (streak >= 20) return { mult: 1.6 }
  if (streak >= 10) return { mult: 1.4, luckAdd: 0.05 }
  if (streak >= 5) return { mult: 1.25 }
  if (streak >= 3) return { mult: 1.1 }
  return { mult: 1.0 }
}

function doGachaPull(mcUser) {
  const isPity = (mcUser.gachaPity || 0) >= GACHA_PITY_LIMIT
  const pool = isPity ? GACHA_POOL.filter((x) => x.rarity === 'ssr') : GACHA_POOL
  const totalW = pool.reduce((a, b) => a + b.weight, 0)
  let roll = Math.random() * totalW
  let acc = 0
  let item = pool[0]
  for (const p of pool) {
    acc += p.weight
    if (roll <= acc) {
      item = p
      break
    }
  }
  const isSSR = item.rarity === 'ssr'
  mcUser.gachaPity = isSSR ? 0 : (mcUser.gachaPity || 0) + 1
  return { item, isSSR, pity: isPity }
}

function doCombat(mcUser, mobKey) {
  const mobDef = mobData[mobKey]
  if (!mobDef) return null
  if ((mcUser.level || 1) < mobDef.minLevel)
    return { error: `⬆️ Level kurang! Butuh Lv.${mobDef.minLevel}` }
  if ((mcUser.hp || 20) <= 0) mcUser.hp = mcUser.maxHp || 20

  const playerAtk = mcUser.atk + (mcUser.combatUpgrade || 0) * 3
  const mobHp = mobDef.hp
  const mobAtk = mobDef.atk
  let pHp = mcUser.hp
  let mHp = mobHp
  const log = []

  while (pHp > 0 && mHp > 0) {
    const pDmg = Math.max(1, playerAtk - Math.floor(Math.random() * 2))
    mHp -= pDmg
    log.push(`⚔️ Kamu: -${pDmg} HP ke ${mobDef.name}`)
    if (mHp <= 0) break
    const mDmg = Math.max(1, mobAtk - (mcUser.def || 0) - Math.floor(Math.random() * 2))
    pHp -= mDmg
    log.push(`💥 ${mobDef.name}: -${mDmg} HP ke kamu`)
  }

  const won = mHp <= 0
  mcUser.hp = Math.max(1, pHp)

  if (won) {
    mcUser.combatWins = (mcUser.combatWins || 0) + 1
    mcUser.mobKills = (mcUser.mobKills || 0) + 1
    const drops = []
    for (const drop of mobDef.drops) {
      if (Math.random() * 100 < drop.chance) {
        const val = Math.round(drop.value * (1 + (mcUser.fortuneUpgrade || 0) * 0.1))
        drops.push({ name: drop.name, value: val })
        mcUser.inventory = [...(mcUser.inventory || []), { name: drop.name, price: val, type: 'drop' }]
      }
    }
    const expGain = mobDef.expReward
    addPlayerExp(mcUser, expGain)
    return {
      won,
      drops,
      expGain,
      log: log.slice(-4),
      mobName: mobDef.name,
      rarity: mobDef.rarity,
    }
  } else {
    mcUser.combatLosses = (mcUser.combatLosses || 0) + 1
    return {
      won,
      drops: [],
      expGain: 0,
      log: log.slice(-4),
      mobName: mobDef.name,
      rarity: mobDef.rarity,
    }
  }
}

function doSmelt(mcUser) {
  if (!mcUser.inventory || mcUser.inventory.length === 0)
    return { smelted: [], totalValue: 0, count: 0 }
  const smelted = []
  const remaining = []
  let totalValue = 0
  for (const item of mcUser.inventory) {
    const recipe = SMELT_RECIPES[item.name]
    if (recipe) {
      const newVal = Math.round(item.price * recipe.valueMult)
      smelted.push({ from: item.name, to: recipe.result, value: newVal })
      totalValue += newVal
    } else {
      remaining.push(item)
    }
  }
  mcUser.inventory = remaining
  return { smelted, totalValue, count: smelted.length }
}

function doCraft(mcUser, recipeKey) {
  const recipe = CRAFT_RECIPES[recipeKey]
  if (!recipe) return { error: '🛠️ Resep tidak ada!' }
  if ((mcUser.level || 1) < recipe.requiredLevel)
    return { error: `⬆️ Level kurang! Butuh Lv.${recipe.requiredLevel}` }

  const invNames = (mcUser.inventory || []).map((i) => i.name)
  const tempInv = [...invNames]
  for (const [ingName, count] of Object.entries(recipe.ingredients)) {
    let found = 0
    for (let i = 0; i < tempInv.length; i++) {
      if (tempInv[i] === ingName) {
        found++
        tempInv[i] = null
        if (found >= count) break
      }
    }
    if (found < count)
      return { error: `🧪 Bahan kurang! ${ingName} butuh ${count}, punya ${found}` }
  }

  mcUser.inventory = (mcUser.inventory || []).filter((_, idx) => tempInv[idx] !== null)
  mcUser.inventory.push({ name: recipe.name, price: recipe.value, type: 'crafted' })
  return { success: true, item: recipe.name, value: recipe.value }
}

function doJackpotPull(mcUser, poolId) {
  const pool = JACKPOT_POOLS.find((p) => p.id === poolId)
  if (!pool) return null
  const totalW = pool.rewards.reduce((a, b) => a + b.weight, 0)
  let roll = Math.random() * totalW
  let acc = 0
  let chosen = pool.rewards[0]
  for (const r of pool.rewards) {
    acc += r.weight
    if (roll <= acc) {
      chosen = r
      break
    }
  }
  const value = Math.round(chosen.min + Math.random() * (chosen.max - chosen.min))
  return { pool, reward: chosen, value }
}

function getAvailableMobs(mcUser) {
  const level = mcUser.level || 1
  const available = []
  for (const [key, mob] of Object.entries(mobData)) {
    if (level >= mob.minLevel) available.push({ key, ...mob })
  }
  return available
}

function healPlayer(mcUser) {
  const cost = Math.floor((mcUser.maxHp - mcUser.hp) * 500)
  if (mcUser.hp >= mcUser.maxHp) return { error: '❤️ HP sudah penuh!' }
  if ((mcUser.money || 0) < cost)
    return { error: `💸 Uang kurang! Butuh ${formatMoney(cost)}` }
  mcUser.money -= cost
  mcUser.hp = mcUser.maxHp
  return { success: true, cost, hp: mcUser.hp }
}

export {
  formatMoney,
  parseAmount,
  createMCUser,
  getRandomOre,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  getStreakBonus,
  doGachaPull,
  doCombat,
  doSmelt,
  doCraft,
  doJackpotPull,
  getAvailableMobs,
  healPlayer,
  JACKPOT_POOLS,
}