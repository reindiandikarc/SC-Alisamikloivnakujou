import { games } from '../lib/engine.js'

games.register('tebakjkt48', {
  alias: ['jkt48', 'jkt'],
  emoji: '🎀',
  title: 'TEBAK JKT48',
  description: 'Tebak member JKT48',
  hasImage: true,
})

const { config, handler, answerHandler } = games.createPlugin('tebakjkt48')

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