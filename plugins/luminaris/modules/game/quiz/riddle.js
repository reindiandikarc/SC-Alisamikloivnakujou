import { games } from '../lib/engine.js'

games.register('riddle', {
  alias: ['rd', 'tebaktebak', 'riddles'],
  emoji: '❓',
  title: 'RIDDLE',
  description: 'Riddle/tebak-tebakan',
})

const { config, handler, answerHandler } = games.createPlugin('riddle')

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