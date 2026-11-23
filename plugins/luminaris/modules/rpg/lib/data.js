// Item catalog: { emoji, name }
export const ITEMS = {
  // Crafting materials
  rock:        { emoji: '🪨', name: 'Rock' },
  coal:        { emoji: '⚫', name: 'Coal' },
  iron:        { emoji: '⛓️', name: 'Iron Ore' },
  gold:        { emoji: '🥇', name: 'Gold Ore' },
  diamond:     { emoji: '💠', name: 'Diamond' },
  emerald:     { emoji: '💚', name: 'Emerald' },
  wood:        { emoji: '🪵', name: 'Wood' },
  herb:        { emoji: '🌿', name: 'Herb' },
  leather:     { emoji: '👜', name: 'Leather' },

  // Fish
  trash:       { emoji: '🗑️', name: 'Junk' },
  fish:        { emoji: '🐟', name: 'Fish' },
  prawn:       { emoji: '🦐', name: 'Prawn' },
  octopus:     { emoji: '🐙', name: 'Octopus' },
  shark:       { emoji: '🦈', name: 'Shark' },
  whale:       { emoji: '🐳', name: 'Whale' },

  // Consumables
  potion:      { emoji: '🧪', name: 'Health Potion' },
  mpotion:     { emoji: '💧', name: 'Mana Potion' },
  stamina_potion: { emoji: '⚡', name: 'Stamina Potion' },
  bread:       { emoji: '🍞', name: 'Bread' },
  fish_meal:   { emoji: '🍣', name: 'Fish Meal' },

  // Crates
  common_crate:    { emoji: '📦', name: 'Common Crate' },
  uncommon_crate:  { emoji: '🎁', name: 'Uncommon Crate' },
  mythic_crate:    { emoji: '🧧', name: 'Mythic Crate' },
  legendary_crate: { emoji: '💎', name: 'Legendary Crate' },

  // Crafted gear
  sword:       { emoji: '⚔️', name: 'Iron Sword' },
  armor:       { emoji: '🛡️', name: 'Iron Armor' },
  pickaxe:     { emoji: '⛏️', name: 'Diamond Pickaxe' },
  rod:         { emoji: '🎣', name: 'Golden Rod' },
}

// ─── DROP TABLES ────────────────────────────────────────────────
export const MINING_DROPS = [
  { item: 'rock',    chance: 80, min: 2, max: 5 },
  { item: 'coal',    chance: 50, min: 1, max: 3 },
  { item: 'iron',    chance: 30, min: 1, max: 2 },
  { item: 'gold',    chance: 15, min: 1, max: 1 },
  { item: 'diamond', chance: 5,  min: 1, max: 1 },
  { item: 'emerald', chance: 2,  min: 1, max: 1 },
]

export const FISHING_DROPS = [
  { item: 'trash',   chance: 40, min: 1, max: 2 },
  { item: 'fish',    chance: 60, min: 1, max: 3 },
  { item: 'prawn',   chance: 25, min: 1, max: 2 },
  { item: 'octopus', chance: 10, min: 1, max: 1 },
  { item: 'shark',   chance: 5,  min: 1, max: 1 },
  { item: 'whale',   chance: 2,  min: 1, max: 1 },
]

export const HUNTING_DROPS = [
  { item: 'leather', chance: 50, min: 1, max: 3 },
  { item: 'meat',    chance: 40, min: 1, max: 2 },
  { item: 'herb',    chance: 30, min: 1, max: 2 },
  { item: 'bone',    chance: 20, min: 1, max: 2 },
]

// ─── ADVENTURE EVENTS ───────────────────────────────────────────
export const ADVENTURE_LOCATIONS = [
  '🌲 Dark Forest',
  '🏔️ Frozen Peaks',
  '🏜️ Desert of Death',
  '🌋 Volcano',
  '🏰 Haunted Castle',
  '🌊 Mysterious Shore',
  '🌑 Shadow Cavern',
  '🌿 Ancient Ruins',
]

// ─── SHOP CATALOG ───────────────────────────────────────────────
export const SHOP_ITEMS = {
  // Buyable
  potion:        { price: 500,    type: 'buy' },
  mpotion:       { price: 500,    type: 'buy' },
  stamina_potion:{ price: 1000,   type: 'buy' },
  bread:         { price: 200,    type: 'buy' },
  common_crate:  { price: 2000,   type: 'buy' },
  uncommon_crate:{ price: 10000,  type: 'buy' },
  mythic_crate:  { price: 50000,  type: 'buy' },
  legendary_crate:{ price: 200000, type: 'buy' },

  // Sellable
  rock:        { price: 20,    type: 'sell' },
  coal:        { price: 50,    type: 'sell' },
  iron:        { price: 200,   type: 'sell' },
  gold:        { price: 1000,  type: 'sell' },
  diamond:     { price: 5000,  type: 'sell' },
  emerald:     { price: 10000, type: 'sell' },
  wood:        { price: 15,    type: 'sell' },
  herb:        { price: 150,   type: 'sell' },
  leather:     { price: 50,    type: 'sell' },
  trash:       { price: 10,    type: 'sell' },
  fish:        { price: 100,   type: 'sell' },
  prawn:       { price: 200,   type: 'sell' },
  octopus:     { price: 500,   type: 'sell' },
  shark:       { price: 2000,  type: 'sell' },
  whale:       { price: 10000, type: 'sell' },
  meat:        { price: 300,   type: 'sell' },
  bone:        { price: 100,   type: 'sell' },
}

// ─── CRAFTING RECIPES ───────────────────────────────────────────
export const RECIPES = {
  sword: {
    name: '⚔️ Iron Sword',
    materials: { iron: 5, coal: 3 },
    qty: 1,
    bonus: { attack: 10 },
  },
  armor: {
    name: '🛡️ Iron Armor',
    materials: { iron: 10, coal: 5 },
    qty: 1,
    bonus: { defense: 15 },
  },
  pickaxe: {
    name: '⛏️ Diamond Pickaxe',
    materials: { diamond: 3, iron: 2 },
    qty: 1,
    bonus: { mining: 20 },
  },
  rod: {
    name: '🎣 Golden Rod',
    materials: { gold: 5, iron: 2 },
    qty: 1,
    bonus: { fishing: 20 },
  },
  potion: {
    name: '🧪 Health Potion',
    materials: { herb: 3, fish: 1 },
    qty: 2,
  },
  mpotion: {
    name: '💧 Mana Potion',
    materials: { herb: 2, emerald: 1 },
    qty: 1,
  },
  stamina_potion: {
    name: '⚡ Stamina Potion',
    materials: { coal: 5, herb: 2 },
    qty: 1,
  },
  bread: {
    name: '🍞 Bread',
    materials: { wheat: 3 },
    qty: 3,
  },
}

// ─── CONSUMABLE EFFECTS ─────────────────────────────────────────
export const CONSUMABLES = {
  potion:        { stat: 'health',  amount: 50,  maxStat: 'maxHealth' },
  mpotion:       { stat: 'mana',    amount: 50,  maxStat: 'maxMana' },
  stamina_potion:{ stat: 'stamina', amount: 50,  maxStat: 'maxStamina' },
  bread:         { stat: 'health',  amount: 20,  maxStat: 'maxHealth' },
  fish_meal:     { stat: 'stamina', amount: 30,  maxStat: 'maxStamina' },
}

// ─── HUNTING MONSTERS ───────────────────────────────────────────
export const MONSTERS = [
  { name: '🐀 Rat',          minLevel: 1,  hp: 20,  atk: 5,  def: 2,  exp: 50,  coins: 100 },
  { name: '🦇 Bat',          minLevel: 1,  hp: 30,  atk: 8,  def: 3,  exp: 80,  coins: 150 },
  { name: '🐺 Wolf',         minLevel: 3,  hp: 60,  atk: 15, def: 5,  exp: 150, coins: 300 },
  { name: '🐍 Giant Snake',  minLevel: 5,  hp: 80,  atk: 20, def: 8,  exp: 250, coins: 500 },
  { name: '🐗 Boar',         minLevel: 5,  hp: 100, atk: 25, def: 12, exp: 300, coins: 600 },
  { name: '🕷️ Giant Spider', minLevel: 8,  hp: 120, atk: 30, def: 15, exp: 400, coins: 800 },
  { name: '🐻 Bear',         minLevel: 10, hp: 180, atk: 40, def: 20, exp: 600, coins: 1200 },
  { name: '🧟 Zombie',       minLevel: 12, hp: 200, atk: 35, def: 10, exp: 500, coins: 1000 },
  { name: '🦴 Skeleton',     minLevel: 12, hp: 150, atk: 45, def: 25, exp: 700, coins: 1500 },
  { name: '🐉 Young Dragon', minLevel: 15, hp: 300, atk: 60, def: 30, exp: 1000, coins: 3000 },
]
