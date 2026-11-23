import { games } from '../lib/engine.js'

games.register('tebakgambar', {
  alias: ['tg', 'guessimage'],
  emoji: '🖼️',
  title: 'TEBAK GAMBAR',
  description: 'Tebak kata dari gambar',
  timeout: 90000,
  hasImage: true,
  questionField: null,
  hintCount: 3,
})

const { config, handler, answerHandler } = games.createPlugin('tebakgambar')

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