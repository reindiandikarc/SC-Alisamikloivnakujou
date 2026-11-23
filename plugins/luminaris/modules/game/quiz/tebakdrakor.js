import { games } from '../lib/engine.js'

games.register('tebakdrakor', {
  alias: ['drakor', 'kdrama'],
  emoji: '🇰🇷',
  title: 'TEBAK DRAKOR',
  description: 'Tebak judul drama Korea',
  hasImage: true,
})

const { config, handler, answerHandler } = games.createPlugin('tebakdrakor')

export default {
  name: config.name,
  command: config.command,
  allow: 'both',
  role: 10,
  category: config.category,
  description: config.description,
  handle: handler,
  answerHandler,
}