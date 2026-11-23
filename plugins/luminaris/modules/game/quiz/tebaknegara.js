import { games } from '../lib/engine.js'

games.register('tebaknegara', {
  alias: ['tn', 'guesscountry'],
  emoji: '🌍',
  title: 'TEBAK NEGARA',
  description: 'Tebak nama negara',
})

const { config, handler, answerHandler } = games.createPlugin('tebaknegara')

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