import { games } from '../lib/engine.js'

games.register('tebakkimia', {
  alias: ['kimia', 'chemistry', 'unsur'],
  emoji: '🧪',
  title: 'TEBAK KIMIA',
  description: 'Tebak unsur kimia',
  questionField: 'unsur',
  answerField: 'lambang',
})

const { config, handler, answerHandler } = games.createPlugin('tebakkimia')

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