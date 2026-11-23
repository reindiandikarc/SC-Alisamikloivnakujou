import { games } from '../lib/engine.js'

games.register('siapakahaku', {
  alias: ['siapa', 'whoami'],
  emoji: '🎭',
  title: 'SIAPAKAH AKU',
  description: 'Tebak dari deskripsi',
})

const { config, handler, answerHandler } = games.createPlugin('siapakahaku')

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