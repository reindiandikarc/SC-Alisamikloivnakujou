import { games } from '../lib/engine.js'

games.register('tebakbendera', {
  alias: ['tbendera', 'flag'],
  emoji: '🏳️',
  title: 'TEBAK BENDERA',
  description: 'Tebak negara dari bendera',
  dataFile: 'tebakbendera2.json',
  answerField: 'name',
  hasImage: true,
})

const { config, handler, answerHandler } = games.createPlugin('tebakbendera')

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