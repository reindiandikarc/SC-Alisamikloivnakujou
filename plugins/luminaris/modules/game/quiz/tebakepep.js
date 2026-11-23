import { games } from '../lib/engine.js'

games.register('tebakepep', {
  alias: ['tebakff', 'tebakfreefire'],
  emoji: '🔫',
  title: 'TEBAK EPEP',
  description: 'Tebak karakter Free Fire',
  hasImage: true,
})

const { config, handler, answerHandler } = games.createPlugin('tebakepep')

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