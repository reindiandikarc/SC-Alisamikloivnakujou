import { games } from '../lib/engine.js'

games.register('asahotak', {
  alias: ['asah', 'quiz'],
  emoji: '🧠',
  title: 'ASAH OTAK',
  description: 'Game asah otak - tebak jawaban',
})

const { config, handler, answerHandler } = games.createPlugin('asahotak')

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