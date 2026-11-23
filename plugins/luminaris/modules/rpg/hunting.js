import { CHAT } from '../../_runtime/core-shim.js'
import { HUNTING_DROPS, ITEMS, MONSTERS } from './lib/data.js'
import { initStats, rollDrops, grantExp, pickRandom } from './lib/helpers.js'

const STAMINA_COST = 25
const EXP_GAIN_MIN = 150
const EXP_GAIN_MAX = 600

const QUOTES = [
  'You creep through the undergrowth, weapon ready...',
  'Tracks in the mud — something was here recently...',
  'A rustle in the bushes ahead...',
  'You spot movement between the trees...',
  'The hunt begins...',
]

export default {
  name: 'hunting',
  command: ['hunt', 'hunting'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Hunt monsters for loot and exp (costs stamina)',

  async handle(ctx) {
    const { sock, msg, chat, sender, moduleData } = ctx

    const [rawStats, inv, coins] = await Promise.all([
      moduleData.user.get(sender, 'stats'),
      moduleData.user.get(sender, 'inventory'),
      moduleData.user.get(sender, 'coins'),
    ])
    const stats = initStats(rawStats)
    const inventory = inv || {}
    let playerCoins = typeof coins === 'number' ? coins : 0

    if (stats.stamina < STAMINA_COST) {
      return sock.sendMessage(chat, {
        text: `You're too tired to hunt! Need *${STAMINA_COST}* stamina, you have *${stats.stamina}*.\nUse \`heal\` or \`use stamina_potion\` to recover.`
      }, { quoted: msg })
    }

    const eligible = MONSTERS.filter(m => stats.level >= m.minLevel)
    if (!eligible.length) {
      return sock.sendMessage(chat, {
        text: `No monsters found at your level. Keep training!`
      }, { quoted: msg })
    }
    const monster = pickRandom(eligible)

    stats.stamina -= STAMINA_COST

    await sock.sendMessage(chat, { react: { text: '🗡️', key: msg.key } })
    await sock.sendMessage(chat, { text: `🗡️ ${pickRandom(QUOTES)}\n*A wild ${monster.name} appears!*` })

    const playerPower = stats.attack + Math.floor(Math.random() * 30)
    const monsterPower = monster.atk + Math.floor(Math.random() * 20)
    const isWin = playerPower >= monsterPower

    let drops = []
    let expGain = 0
    let levelUps = 0

    if (isWin) {
      drops = rollDrops(HUNTING_DROPS)
      for (const d of drops) {
        inventory[d.item] = (inventory[d.item] || 0) + d.qty
      }
      playerCoins += monster.coins
      expGain = monster.exp + Math.floor(Math.random() * (EXP_GAIN_MAX - EXP_GAIN_MIN + 1))
      levelUps = grantExp(stats, expGain)
    } else {
      const damage = Math.max(10, monster.atk - stats.defense + Math.floor(Math.random() * 15))
      stats.health = Math.max(0, stats.health - damage)

      if (stats.health <= 0) {
        stats.health = 0
        stats.exp = Math.floor(stats.exp * 0.75)
      }
    }

    try {
      await Promise.all([
        moduleData.user.set(sender, 'stats', stats),
        moduleData.user.set(sender, 'inventory', inventory),
        moduleData.user.set(sender, 'coins', playerCoins),
      ])
    } catch (e) {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return
    }

    if (isWin) {
      const lines = [
        `⚔️ *Victory!* You defeated the ${monster.name}!`,
        ``,
        `Loot:`,
        ...drops.map(d => {
          const def = ITEMS[d.item] || { emoji: '❓', name: d.item }
          return `  ${def.emoji} ${def.name}: *+${d.qty}*`
        }),
        `  💰 Coins: *+Rp ${monster.coins.toLocaleString('id-ID')}*`,
        ``,
        `✨ EXP: *+${expGain.toLocaleString()}*`,
        `⚡ Stamina: *-${STAMINA_COST}* (${stats.stamina}/${stats.maxStamina})`,
      ]

      if (levelUps > 0) {
        lines.push(``, `🎉 *LEVEL UP!* You are now Level ${stats.level}!`)
      }

      await sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
    } else if (stats.health <= 0) {
      await sock.sendMessage(chat, {
        text: [
          `💀 *Defeated!* The ${monster.name} overpowered you!`,
          ``,
          `You lost consciousness and woke up at camp...`,
          `❤️ HP: 0/${stats.maxHealth}`,
          `📉 Lost 25% of your EXP.`,
          `Try \`heal\` to recover before fighting again.`,
        ].join('\n')
      }, { quoted: msg })
    } else {
      const damage = Math.max(10, monster.atk - stats.defense + Math.floor(Math.random() * 15))
      await sock.sendMessage(chat, {
        text: [
          `😵 *Defeated!* The ${monster.name} was too strong!`,
          ``,
          `❤️ HP: *-${damage}* (${stats.health}/${stats.maxHealth})`,
          `You retreated to safety. Heal up before trying again!`,
        ].join('\n')
      }, { quoted: msg })
    }
  }
}
