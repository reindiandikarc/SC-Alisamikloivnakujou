import { CHAT } from '../../_runtime/core-shim.js'
import { MINING_DROPS, ITEMS } from './lib/data.js'
import { initStats, rollDrops, grantExp, pickRandom } from './lib/helpers.js'

const STAMINA_COST = 20
const EXP_GAIN_MIN = 100
const EXP_GAIN_MAX = 500

const QUOTES = [
  'Swing the pickaxe into the rock face...',
  'Sparks fly as metal hits stone...',
  'Deeper into the mine shaft you go...',
  'The walls glitter with hidden veins of ore...',
  'Your arms ache but you push on...',
]

export default {
  name: 'mining',
  command: ['mine', 'mining'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Mine ores and gems (costs stamina)',

  async handle(ctx) {
    const { sock, msg, chat, sender, moduleData } = ctx

    const [rawStats, inv] = await Promise.all([
      moduleData.user.get(sender, 'stats'),
      moduleData.user.get(sender, 'inventory'),
    ])
    const stats = initStats(rawStats)
    const inventory = inv || {}

    if (stats.stamina < STAMINA_COST) {
      return sock.sendMessage(chat, {
        text: `You're too tired to mine! Need *${STAMINA_COST}* stamina, you have *${stats.stamina}*.\nUse \`heal\` or \`use stamina_potion\` to recover.`
      }, { quoted: msg })
    }

    stats.stamina -= STAMINA_COST

    await sock.sendMessage(chat, { react: { text: '⛏️', key: msg.key } })
    await sock.sendMessage(chat, { text: `⛏️ ${pickRandom(QUOTES)}` })

    const drops = rollDrops(MINING_DROPS)
    for (const d of drops) {
      inventory[d.item] = (inventory[d.item] || 0) + d.qty
    }

    const expGain = Math.floor(Math.random() * (EXP_GAIN_MAX - EXP_GAIN_MIN + 1)) + EXP_GAIN_MIN
    const levelUps = grantExp(stats, expGain)

    try {
      await Promise.all([
        moduleData.user.set(sender, 'stats', stats),
        moduleData.user.set(sender, 'inventory', inventory),
      ])
    } catch (e) {
      ctx.helpers.ui.react(sock, chat, msg.key, '❌')
      return
    }

    const lines = [
      `⛏️ *Mining Complete!*`,
      ``,
      `You mined:`,
      ...drops.map(d => {
        const def = ITEMS[d.item] || { emoji: '❓', name: d.item }
        return `  ${def.emoji} ${def.name}: *+${d.qty}*`
      }),
      ``,
      `✨ EXP: *+${expGain.toLocaleString()}*`,
      `⚡ Stamina: *-${STAMINA_COST}* (${stats.stamina}/${stats.maxStamina})`,
    ]

    if (levelUps > 0) {
      lines.push(``, `🎉 *LEVEL UP!* You are now Level ${stats.level}!`)
    }

    await sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
  }
}
