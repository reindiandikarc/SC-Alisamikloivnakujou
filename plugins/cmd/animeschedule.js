// Plugin: animeschedule
// Alias of jadwalanime
// Commands: animeschedule

const path = require('path')

module.exports = {
  command: ["animeschedule"],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    // Load jadwalanime handler
    const jadwalanime = require('./jadwalanime')
    return jadwalanime.run(alya, m, ctx)
  }
}
