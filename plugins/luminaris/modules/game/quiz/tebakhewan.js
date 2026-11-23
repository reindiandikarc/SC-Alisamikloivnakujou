import { games } from '../lib/engine.js'

games.register('tebakhewan', {
  alias: ['th', 'guessanimal'],
  emoji: '🐾',
  title: 'TEBAK HEWAN',
  description: 'Tebak nama hewan',
})

const { config, handler, answerHandler } = games.createPlugin('tebakhewan')

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