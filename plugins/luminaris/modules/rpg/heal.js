import { CHAT } from '../../_runtime/core-shim.js'
import { initStats, statBar } from './lib/helpers.js'

const HEAL_AMOUNT = 30
const STAMINA_RECOVER = 50

export default {
  name: 'heal',
  command: ['heal', 'rest'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Rest to recover HP and stamina (free, slow)',

  async handle(ctx) {
    const { sock, msg, chat, sender, moduleData } = ctx

    const raw = await moduleData.user.get(sender, 'stats')
    const stats = initStats(raw)

    if (stats.health >= stats.maxHealth && stats.stamina >= stats.maxStamina) {
      return sock.sendMessage(chat, {
        text: `You're already fully rested and ready to go! 💪`
      }, { quoted: msg })
    }

    const oldHp = stats.health
    const oldSp = stats.stamina

    stats.health = Math.min(stats.health + HEAL_AMOUNT, stats.maxHealth)
    stats.stamina = Math.min(stats.stamina + STAMINA_RECOVER, stats.maxStamina)

    try {
      await moduleData.user.set(sender, 'stats', stats)
    } catch (e) {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return
    }

    const hpBar = statBar(stats.health, stats.maxHealth)
    const spBar = statBar(stats.stamina, stats.maxStamina)

    await sock.sendMessage(chat, {
      text: [
        `🛌 *Rest Complete!*`,
        ``,
        `You take a short rest and feel refreshed.`,
        ``,
        `❤️ HP:  ${oldHp} → *${stats.health}* [${hpBar}]`,
        `⚡ SP:  ${oldSp} → *${stats.stamina}* [${spBar}]`,
        ``,
        `For instant recovery, use \`use potion\` from your inventory.`,
      ].join('\n')
    }, { quoted: msg })
  }
}
