import { CHAT } from '../../_runtime/core-shim.js'
import { RECIPES, ITEMS } from './lib/data.js'
import { initStats } from './lib/helpers.js'

export default {
  name: 'craft',
  command: ['craft', 'make'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Craft items from materials',

  async handle(ctx) {
    const { sock, msg, chat, sender, args, moduleData } = ctx

    const [rawStats, inv] = await Promise.all([
      moduleData.user.get(sender, 'stats'),
      moduleData.user.get(sender, 'inventory'),
    ])
    const stats = initStats(rawStats)
    const inventory = inv || {}

    const itemKey = (args[0] || '').toLowerCase()

    if (!itemKey) {
      const lines = [`⚒️ *Crafting Recipes*`, ``]

      for (const [key, recipe] of Object.entries(RECIPES)) {
        lines.push(`*${recipe.name}*`)
        for (const [mat, qty] of Object.entries(recipe.materials)) {
          const has = inventory[mat] || 0
          const mark = has >= qty ? '✅' : '❌'
          const matDef = ITEMS[mat] || { emoji: '❓', name: mat }
          lines.push(`  ${mark} ${matDef.emoji} ${matDef.name}: ${has}/${qty}`)
        }
        if (recipe.bonus) {
          const bonusStr = Object.entries(recipe.bonus).map(([k, v]) => `${k} +${v}`).join(', ')
          lines.push(`  📈 Bonus: ${bonusStr}`)
        }
        lines.push(`  👉 \`${ctx.prefix}craft ${key}\``)
        lines.push(``)
      }

      return sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
    }

    const recipe = RECIPES[itemKey]
    if (!recipe) {
      return sock.sendMessage(chat, {
        text: `Recipe \`${itemKey}\` not found. Use \`${ctx.prefix}craft\` to see all recipes.`
      }, { quoted: msg })
    }

    const missing = []
    for (const [mat, qty] of Object.entries(recipe.materials)) {
      if ((inventory[mat] || 0) < qty) {
        const matDef = ITEMS[mat] || { emoji: '❓', name: mat }
        missing.push(`${matDef.emoji} ${matDef.name}: ${inventory[mat] || 0}/${qty}`)
      }
    }

    if (missing.length > 0) {
      return sock.sendMessage(chat, {
        text: [
          `Not enough materials for ${recipe.name}!`,
          ``,
          `Missing:`,
          ...missing.map(m => `  ❌ ${m}`),
        ].join('\n')
      }, { quoted: msg })
    }

    for (const [mat, qty] of Object.entries(recipe.materials)) {
      inventory[mat] -= qty
      if (inventory[mat] <= 0) delete inventory[mat]
    }

    const resultQty = recipe.qty || 1
    inventory[itemKey] = (inventory[itemKey] || 0) + resultQty

    const bonusLines = []
    if (recipe.bonus) {
      for (const [stat, value] of Object.entries(recipe.bonus)) {
        if (stats[stat] != null) {
          stats[stat] += value
        }
        bonusLines.push(`📈 ${stat.toUpperCase()}: *+${value}*`)
      }
    }

    try {
      await Promise.all([
        moduleData.user.set(sender, 'inventory', inventory),
        ...(bonusLines.length ? [moduleData.user.set(sender, 'stats', stats)] : []),
      ])
    } catch (e) {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return
    }

    const lines = [
      `⚒️ *Crafting Complete!*`,
      ``,
      `Crafted: ${recipe.name} x${resultQty}`,
    ]

    if (bonusLines.length) {
      lines.push(``, `*Permanent Bonuses:*`, ...bonusLines)
    }

    await sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
  }
}
