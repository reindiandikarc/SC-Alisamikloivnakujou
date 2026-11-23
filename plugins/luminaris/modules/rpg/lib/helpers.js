const DEFAULT_STATS = {
  health: 100,
  maxHealth: 100,
  mana: 100,
  maxMana: 100,
  stamina: 100,
  maxStamina: 100,
  attack: 10,
  defense: 5,
  mining: 0,
  fishing: 0,
  level: 1,
  exp: 0,
}

// ─── STAT HELPERS ───────────────────────────────────────────────

export function initStats(existing) {
  if (!existing) return { ...DEFAULT_STATS }
  const s = { ...DEFAULT_STATS }
  for (const k of Object.keys(DEFAULT_STATS)) {
    if (existing[k] != null) s[k] = existing[k]
  }
  return s
}

export function getExpNeeded(level) {
  return level * 10000
}

export function grantExp(stats, amount) {
  stats.exp += amount
  let levelUps = 0
  while (stats.exp >= getExpNeeded(stats.level)) {
    stats.exp -= getExpNeeded(stats.level)
    stats.level++
    levelUps++
    // Scale max stats on level up
    stats.maxHealth += 10
    stats.maxMana += 5
    stats.maxStamina += 5
    stats.attack += 2
    stats.defense += 1
  }
  // Full heal on level up
  if (levelUps > 0) {
    stats.health = stats.maxHealth
    stats.mana = stats.maxMana
    stats.stamina = stats.maxStamina
  }
  return levelUps
}

// ─── UI HELPERS ─────────────────────────────────────────────────

export function statBar(current, max, length = 10) {
  const filled = Math.round((current / max) * length)
  const empty = length - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

export function formatCoins(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── DROP ROLLER ────────────────────────────────────────────────

export function rollDrops(drops) {
  const results = []
  for (const drop of drops) {
    if (Math.random() * 100 <= drop.chance) {
      const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
      results.push({ item: drop.item, qty })
    }
  }
  // Guarantee at least one common drop
  if (results.length === 0) {
    const first = drops[0]
    results.push({ item: first.item, qty: 1 })
  }
  return results
}
