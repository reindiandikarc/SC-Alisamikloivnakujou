import { CHAT } from '../../_runtime/core-shim.js'
import { FISHING_DROPS, ITEMS } from './lib/data.js'
import { initStats, rollDrops, grantExp, pickRandom } from './lib/helpers.js'

const STAMINA_COST = 15
const EXP_GAIN_MIN = 80
const EXP_GAIN_MAX = 400

const QUOTES = [
  'Cast your line into the shimmering water...',
  'You wait patiently for a bite...',
  'A ripple appears on the surface...',
  'The bobber dips — something is pulling!',
  'The current feels strong today...',
]

export default {
  name: 'fishing',
  command: ['fish', 'fishing'],
  allow: CHAT.BOTH,
  role: 10,
  category: 'rpg',
  description: 'Fish for food and rare catches (costs stamina)',

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
        text: `You're too tired to fish! Need *${STAMINA_COST}* stamina, you have *${stats.stamina}*.\nUse \`heal\` or \`use stamina_potion\` to recover.`
      }, { quoted: msg })
    }

    stats.stamina -= STAMINA_COST

    await sock.sendMessage(chat, { react: { text: '🎣', key: msg.key } })
    await sock.sendMessage(chat, { text: `🎣 ${pickRandom(QUOTES)}` })

    const drops = rollDrops(FISHING_DROPS)
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
      `🎣 *Fishing Complete!*`,
      ``,
      `You caught:`,
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
