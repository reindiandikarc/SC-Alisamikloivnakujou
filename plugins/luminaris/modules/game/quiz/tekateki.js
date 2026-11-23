import { games } from '../lib/engine.js'

games.register('tekateki', {
  alias: ['teka'],
  emoji: '🧩',
  title: 'TEKA-TEKI',
  description: 'Game teka-teki tradisional',
})

const { config, handler, answerHandler } = games.createPlugin('tekateki')

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