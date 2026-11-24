'use strict'

const photoEdit = require('../../lib/chainbreak2')

const ALIASES = {
  tohitam: 'tohitam',
  hitamkan: 'tohitam',
  jadihitam: 'tohitam',
}

module.exports = {
  command: ['tohitam', 'hitamkan', 'jadihitam'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, isPrem } = ctx || {}
    const canonical = ALIASES[String(command || '').toLowerCase()] || 'tohitam'
    return photoEdit(m, alya, prefix || '.', canonical, Boolean(isPrem))
  },
}
