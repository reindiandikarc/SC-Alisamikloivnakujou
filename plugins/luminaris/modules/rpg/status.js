import { CHAT } from '../../_runtime/core-shim.js'
import { initStats, statBar, formatCoins, getExpNeeded } from './lib/helpers.js'

export default {
  name: 'rpg',
  command: ['rpg', 'status', 'stats'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'View your RPG character stats',

  async handle(ctx) {
    const { sock, msg, chat, sender, moduleData } = ctx

    const raw = await moduleData.user.get(sender, 'stats')
    const stats = initStats(raw)
    const coins = await moduleData.user.get(sender, 'coins') || 0

    const hpBar = statBar(stats.health, stats.maxHealth)
    const mpBar = statBar(stats.mana, stats.maxMana)
    const spBar = statBar(stats.stamina, stats.maxStamina)
    const expNeeded = getExpNeeded(stats.level)

    const txt = [
      `⚔️ *RPG Character Sheet*`,
      ``,
      `📊 *Level ${stats.level}*`,
      `✨ EXP: ${stats.exp.toLocaleString()} / ${expNeeded.toLocaleString()}`,
      ``,
      `❤️ HP: [${hpBar}] ${stats.health}/${stats.maxHealth}`,
      `💧 MP: [${mpBar}] ${stats.mana}/${stats.maxMana}`,
      `⚡ SP: [${spBar}] ${stats.stamina}/${stats.maxStamina}`,
      ``,
      `⚔️ Attack:  *${stats.attack}*`,
      `🛡️ Defense: *${stats.defense}*`,
      `⛏️ Mining:  *${stats.mining}*`,
      `🎣 Fishing: *${stats.fishing}*`,
      ``,
      `💰 Coins: ${formatCoins(coins)}`,
    ].join('\n')

    await sock.sendMessage(chat, { text: txt }, { quoted: msg })
  }
}
