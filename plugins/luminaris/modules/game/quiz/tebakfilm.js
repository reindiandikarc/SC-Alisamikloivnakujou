import { games } from '../lib/engine.js'

games.register('tebakfilm', {
  alias: ['tf', 'guessmovie'],
  emoji: '🎬',
  title: 'TEBAK FILM',
  description: 'Tebak judul film',
})

const { config, handler, answerHandler } = games.createPlugin('tebakfilm')

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