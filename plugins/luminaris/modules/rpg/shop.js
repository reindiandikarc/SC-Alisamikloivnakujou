import { CHAT } from '../../_runtime/core-shim.js'
import { SHOP_ITEMS, ITEMS } from './lib/data.js'
import { formatCoins } from './lib/helpers.js'

export default {
  name: 'shop',
  command: ['shop', 'buy', 'sell'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Buy and sell items',

  async handle(ctx) {
    const { sock, msg, chat, sender, args, moduleData, trigger } = ctx

    const action = trigger === 'buy' ? 'buy' : trigger === 'sell' ? 'sell' : (args[0]?.toLowerCase())

    if (!action || (action !== 'buy' && action !== 'sell')) {
      const buyLines = []
      const sellLines = []

      for (const [key, entry] of Object.entries(SHOP_ITEMS)) {
        const def = ITEMS[key] || { emoji: '❓', name: key }
        const line = `  ${def.emoji} ${def.name}: ${formatCoins(entry.price)}`
        if (entry.type === 'buy') buyLines.push(line)
        else sellLines.push(line)
      }

      const txt = [
        `🏪 *RPG Shop*`,
        ``,
        `*To buy:*  \`${ctx.prefix}shop buy <item> <qty>\``,
        `*To sell:* \`${ctx.prefix}shop sell <item> <qty>\``,
        ``,
        `*🛒 Buy Menu*`,
        ...buyLines,
        ``,
        `*💰 Sell Menu*`,
        ...sellLines,
      ].join('\n')

      return sock.sendMessage(chat, { text: txt }, { quoted: msg })
    }

    const itemKey = (args[0] || args[1] || '').toLowerCase()
    const amount = parseInt(args[1] || args[2]) || 1

    if (!itemKey || !ITEMS[itemKey]) {
      return sock.sendMessage(chat, {
        text: `Item \`${itemKey || '?'}\` not found. Use \`${ctx.prefix}shop\` to see available items.`
      }, { quoted: msg })
    }

    const shopEntry = SHOP_ITEMS[itemKey]
    if (!shopEntry) {
      return sock.sendMessage(chat, {
        text: `${ITEMS[itemKey]?.name || itemKey} is not available in the shop.`
      }, { quoted: msg })
    }

    const [coins, inv] = await Promise.all([
      moduleData.user.get(sender, 'coins'),
      moduleData.user.get(sender, 'inventory'),
    ])
    let playerCoins = typeof coins === 'number' ? coins : 0
    const inventory = inv || {}

    if (action === 'buy') {
      if (shopEntry.type !== 'buy') {
        return sock.sendMessage(chat, {
          text: `${ITEMS[itemKey].name} can't be bought — it's only sold by players.`
        }, { quoted: msg })
      }

      const totalCost = shopEntry.price * amount
      if (playerCoins < totalCost) {
        return sock.sendMessage(chat, {
          text: `Not enough coins! Need ${formatCoins(totalCost)}, you have ${formatCoins(playerCoins)}.`
        }, { quoted: msg })
      }

      playerCoins -= totalCost
      inventory[itemKey] = (inventory[itemKey] || 0) + amount

      try {
        await Promise.all([
          moduleData.user.set(sender, 'coins', playerCoins),
          moduleData.user.set(sender, 'inventory', inventory),
        ])
      } catch (e) {
        ctx.helpers.ui.react(sock, chat, msg.key, '❌')
        return
      }

      return sock.sendMessage(chat, {
        text: [
          `🛒 *Purchase Complete!*`,
          ``,
          `Bought: ${ITEMS[itemKey].emoji} ${ITEMS[itemKey].name} x${amount}`,
          `Cost: ${formatCoins(totalCost)}`,
          `Balance: ${formatCoins(playerCoins)}`,
        ].join('\n')
      }, { quoted: msg })
    }

    if (action === 'sell') {
      if (shopEntry.type !== 'sell') {
        return sock.sendMessage(chat, {
          text: `The shop doesn't buy ${ITEMS[itemKey].name}.`
        }, { quoted: msg })
      }

      const stock = inventory[itemKey] || 0
      if (stock < amount) {
        return sock.sendMessage(chat, {
          text: `You only have ${stock}x ${ITEMS[itemKey].name}. Can't sell ${amount}.`
        }, { quoted: msg })
      }

      const totalProfit = shopEntry.price * amount
      inventory[itemKey] = stock - amount
      if (inventory[itemKey] <= 0) delete inventory[itemKey]
      playerCoins += totalProfit

      try {
        await Promise.all([
          moduleData.user.set(sender, 'coins', playerCoins),
          moduleData.user.set(sender, 'inventory', inventory),
        ])
      } catch (e) {
        ctx.helpers.ui.react(sock, chat, msg.key, '❌')
        return
      }

      return sock.sendMessage(chat, {
        text: [
          `💰 *Sale Complete!*`,
          ``,
          `Sold: ${ITEMS[itemKey].emoji} ${ITEMS[itemKey].name} x${amount}`,
          `Earned: ${formatCoins(totalProfit)}`,
          `Balance: ${formatCoins(playerCoins)}`,
        ].join('\n')
      }, { quoted: msg })
    }
  }
}
