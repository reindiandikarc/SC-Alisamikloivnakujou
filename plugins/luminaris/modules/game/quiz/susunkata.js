import { games } from '../lib/engine.js'

games.register('susunkata', {
  alias: ['susun', 'scramble'],
  emoji: '🔠',
  title: 'SUSUN KATA',
  description: 'Susun kata dari huruf',
})

const { config, handler, answerHandler } = games.createPlugin('susunkata')

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