import { games } from '../lib/engine.js'

games.register('tebaktebakan', {
  alias: ['tbt', 'tebak2an', 'receh'],
  emoji: '😄',
  title: 'TEBAK-TEBAKAN',
  description: 'Tebak-tebakan receh',
})

const { config, handler, answerHandler } = games.createPlugin('tebaktebakan')

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