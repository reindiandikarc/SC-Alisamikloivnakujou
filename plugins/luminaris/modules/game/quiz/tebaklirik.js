import { games } from '../lib/engine.js'

games.register('tebaklirik', {
  alias: [],
  emoji: '🎤',
  title: 'TEBAK LIRIK',
  description: 'Tebak lirik lagu',
})

const { config, handler, answerHandler } = games.createPlugin('tebaklirik')

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