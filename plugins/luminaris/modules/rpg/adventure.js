import { CHAT } from '../../_runtime/core-shim.js'
import { ADVENTURE_LOCATIONS } from './lib/data.js'
import { initStats, grantExp, pickRandom } from './lib/helpers.js'

const HEALTH_COST_MIN = 10
const HEALTH_COST_MAX = 30
const WIN_CHANCE = 0.6

export default {
  name: 'adventure',
  command: ['adv', 'adventure'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Adventure into dangerous lands for exp and coins',

  async handle(ctx) {
    const { sock, msg, chat, sender, moduleData } = ctx

    const [rawStats, coins] = await Promise.all([
      moduleData.user.get(sender, 'stats'),
      moduleData.user.get(sender, 'coins'),
    ])
    const stats = initStats(rawStats)
    let playerCoins = typeof coins === 'number' ? coins : 0

    if (stats.health < 30) {
      return sock.sendMessage(chat, {
        text: `You're too injured to adventure! Need at least *30 HP*, you have *${stats.health}*.\nHeal up first!`
      }, { quoted: msg })
    }

    const location = pickRandom(ADVENTURE_LOCATIONS)

    await sock.sendMessage(chat, { react: { text: '🗺️', key: msg.key } })
    await sock.sendMessage(chat, { text: `🗺️ Packing supplies and lighting a torch...\nEntering *${location}*...` })

    const isWin = Math.random() < WIN_CHANCE

    let expGain = 0
    let coinGain = 0
    let levelUps = 0
    let damage = 0

    if (isWin) {
      expGain = Math.floor(Math.random() * 2000) + 500
      coinGain = Math.floor(Math.random() * 10000) + 2000
      playerCoins += coinGain
      levelUps = grantExp(stats, expGain)
    } else {
      damage = Math.floor(Math.random() * (HEALTH_COST_MAX - HEALTH_COST_MIN + 1)) + HEALTH_COST_MIN
      stats.health = Math.max(0, stats.health - damage)

      if (stats.health <= 0) {
        stats.health = 0
        stats.exp = Math.floor(stats.exp * 0.5)
      }
    }

    try {
      await Promise.all([
        moduleData.user.set(sender, 'stats', stats),
        moduleData.user.set(sender, 'coins', playerCoins),
      ])
    } catch (e) {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return
    }

    if (isWin) {
      const lines = [
        `⚔️ *Adventure Successful!*`,
        ``,
        `📍 Location: *${location}*`,
        ``,
        `You defeated the guardian monster and found a treasure chest!`,
        ``,
        `💰 Coins: *+Rp ${coinGain.toLocaleString('id-ID')}*`,
        `✨ EXP: *+${expGain.toLocaleString()}*`,
      ]

      if (levelUps > 0) {
        lines.push(``, `🎉 *LEVEL UP!* You are now Level ${stats.level}!`)
      }

      await sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
    } else if (stats.health <= 0) {
      await sock.sendMessage(chat, {
        text: [
          `☠️ *Ambushed by monsters!*`,
          ``,
          `📍 Location: *${location}*`,
          ``,
          `You were overwhelmed and died...`,
          `❤️ HP: 0/${stats.maxHealth}`,
          `📉 Lost 50% of your EXP.`,
          `Use \`heal\` to recover.`,
        ].join('\n')
      }, { quoted: msg })
    } else {
      await sock.sendMessage(chat, {
        text: [
          `☠️ *Ambushed by monsters!*`,
          ``,
          `📍 Location: *${location}*`,
          ``,
          `You were attacked but managed to escape!`,
          `❤️ HP: *-${damage}* (${stats.health}/${stats.maxHealth})`,
          `Rest up before heading out again!`,
        ].join('\n')
      }, { quoted: msg })
    }
  }
}
