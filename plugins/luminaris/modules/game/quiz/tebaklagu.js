import { games } from '../lib/engine.js'

games.register('tebaklagu', {
  alias: ['tl', 'guesssong'],
  emoji: '🎵',
  title: 'TEBAK LAGU',
  description: 'Tebak judul lagu',
})

const { config, handler, answerHandler } = games.createPlugin('tebaklagu')

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