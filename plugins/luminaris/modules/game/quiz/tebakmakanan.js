import { games } from '../lib/engine.js'

games.register('tebakmakanan', {
  alias: ['makanan', 'food'],
  emoji: '🍲',
  title: 'TEBAK MAKANAN',
  description: 'Tebak nama makanan',
  hasImage: true,
})

const { config, handler, answerHandler } = games.createPlugin('tebakmakanan')

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