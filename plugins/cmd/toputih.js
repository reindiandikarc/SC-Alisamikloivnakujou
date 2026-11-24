'use strict'

const photoEdit = require('../../lib/chainbreak2')

const ALIASES = {
  toputih: 'toputih',
  putihkan: 'toputih',
  jadiputih: 'toputih',
}

module.exports = {
  command: ['toputih', 'putihkan', 'jadiputih'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, isPrem } = ctx || {}
    const canonical = ALIASES[String(command || '').toLowerCase()] || 'toputih'
    return photoEdit(m, alya, prefix || '.', canonical, Boolean(isPrem))
  },
}
