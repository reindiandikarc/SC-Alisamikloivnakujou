import { CHAT } from '../../_runtime/core-shim.js'
import { CONSUMABLES, ITEMS } from './lib/data.js'
import { initStats } from './lib/helpers.js'

export default {
  name: 'use',
  command: ['use'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Use a consumable item',

  async handle(ctx) {
    const { sock, msg, chat, sender, args, moduleData } = ctx

    const itemKey = (args[0] || '').toLowerCase()

    if (!itemKey) {
      const usable = Object.keys(CONSUMABLES)
      const lines = [`📦 *Usable Items*`, ``]

      for (const key of usable) {
        const def = ITEMS[key] || { emoji: '❓', name: key }
        const effect = CONSUMABLES[key]
        const statName = effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1)
        lines.push(`${def.emoji} ${def.name} — ${statName} +${effect.amount}`)
        lines.push(`  \`${ctx.prefix}use ${key}\``)
      }

      return sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
    }

    const effect = CONSUMABLES[itemKey]
    if (!effect) {
      return sock.sendMessage(chat, {
        text: `\`${itemKey}\` is not a consumable item. Use \`${ctx.prefix}use\` to see available items.`
      }, { quoted: msg })
    }

    const [inv, rawStats] = await Promise.all([
      moduleData.user.get(sender, 'inventory'),
      moduleData.user.get(sender, 'stats'),
    ])
    const inventory = inv || {}

    if ((inventory[itemKey] || 0) < 1) {
      return sock.sendMessage(chat, {
        text: `You don't have any ${ITEMS[itemKey]?.name || itemKey}! Buy some at the \`shop\`.`
      }, { quoted: msg })
    }

    inventory[itemKey]--
    if (inventory[itemKey] <= 0) delete inventory[itemKey]

    const stats = initStats(rawStats)
    const oldVal = stats[effect.stat]
    stats[effect.stat] = Math.min(stats[effect.stat] + effect.amount, stats[effect.maxStat])
    const healed = stats[effect.stat] - oldVal

    try {
      await Promise.all([
        moduleData.user.set(sender, 'inventory', inventory),
        moduleData.user.set(sender, 'stats', stats),
      ])
    } catch (e) {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return
    }

    const def = ITEMS[itemKey] || { emoji: '✨', name: itemKey }
    const statName = effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1)

    await sock.sendMessage(chat, {
      text: [
        `${def.emoji} *Used ${def.name}*`,
        ``,
        `${statName}: ${oldVal} → *${stats[effect.stat]}* (+${healed})`,
        `Remaining in bag: ${inventory[itemKey] || 0}`,
      ].join('\n')
    }, { quoted: msg })
  }
}
