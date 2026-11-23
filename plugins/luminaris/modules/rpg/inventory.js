import { CHAT } from '../../_runtime/core-shim.js'
import { ITEMS } from './lib/data.js'
import { initStats, formatCoins } from './lib/helpers.js'

const CATEGORIES = {
  '🪨 Materials':   ['rock', 'coal', 'iron', 'gold', 'diamond', 'emerald', 'wood', 'herb', 'leather', 'meat', 'bone'],
  '🐟 Fish':        ['trash', 'fish', 'prawn', 'octopus', 'shark', 'whale'],
  '🧪 Consumables': ['potion', 'mpotion', 'stamina_potion', 'bread', 'fish_meal'],
  '📦 Crates':      ['common_crate', 'uncommon_crate', 'mythic_crate', 'legendary_crate'],
  '⚔️ Gear':        ['sword', 'armor', 'pickaxe', 'rod'],
}

export default {
  name: 'inventory',
  command: ['inv', 'inventory', 'bag'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'View your inventory',

  async handle(ctx) {
    const { sock, msg, chat, sender, moduleData } = ctx

    const inv = (await moduleData.user.get(sender, 'inventory')) || {}
    const stats = initStats(await moduleData.user.get(sender, 'stats'))
    const coins = await moduleData.user.get(sender, 'coins') || 0

    const lines = [
      `🎒 *Inventory*`,
      ``,
      `❤️ HP: ${stats.health}/${stats.maxHealth}`,
      `💰 Coins: ${formatCoins(coins)}`,
      ``,
    ]

    let hasItem = false

    for (const [catName, keys] of Object.entries(CATEGORIES)) {
      const items = []
      for (const key of keys) {
        const count = inv[key] || 0
        if (count > 0) {
          const def = ITEMS[key] || { emoji: '❓', name: key }
          items.push(`${def.emoji} ${def.name}: *${count}x*`)
          hasItem = true
        }
      }
      if (items.length > 0) {
        lines.push(`*${catName}*`)
        lines.push(...items)
        lines.push('')
      }
    }

    if (!hasItem) {
      lines.push('Your bag is empty! Try `mine`, `fish`, or `hunt` to get items.')
    }

    await sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
  }
}
