import { games } from '../lib/engine.js'

games.register('kataacak', {
  alias: ['ka', 'acakkata'],
  emoji: '🔤',
  title: 'KATA ACAK',
  description: 'Susun huruf acak',
})

const { config, handler, answerHandler } = games.createPlugin('kataacak')

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