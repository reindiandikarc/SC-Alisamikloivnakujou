import { games } from '../lib/engine.js'

games.register('tebakkalimat', {
  alias: ['tkl', 'peribahasa'],
  emoji: '📖',
  title: 'TEBAK KALIMAT',
  description: 'Tebak kalimat atau peribahasa',
})

const { config, handler, answerHandler } = games.createPlugin('tebakkalimat')

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