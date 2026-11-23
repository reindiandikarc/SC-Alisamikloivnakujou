import { games } from '../lib/engine.js'

games.register('caklontong', {
  alias: ['cak', 'lontong'],
  emoji: '🤔',
  title: 'CAK LONTONG',
  description: 'Game cak lontong - jawaban receh',
})

const { config, handler, answerHandler } = games.createPlugin('caklontong')

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