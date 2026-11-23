import { games } from '../lib/engine.js'

games.register('tebakkata', {
  alias: ['tk', 'guessword'],
  emoji: '📝',
  title: 'TEBAK KATA',
  description: 'Tebak kata dari petunjuk',
})

const { config, handler, answerHandler } = games.createPlugin('tebakkata')

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