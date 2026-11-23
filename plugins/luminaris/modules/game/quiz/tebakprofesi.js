import { games } from '../lib/engine.js'

games.register('tebakprofesi', {
  alias: ['tp', 'guessjob'],
  emoji: '👨‍💼',
  title: 'TEBAK PROFESI',
  description: 'Tebak nama profesi',
})

const { config, handler, answerHandler } = games.createPlugin('tebakprofesi')

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