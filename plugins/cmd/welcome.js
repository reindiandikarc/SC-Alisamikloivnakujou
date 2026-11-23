// Plugin: welcome
// Commands: welcome

const fs = require('fs')

module.exports = {
  command: ["welcome"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      isAdmins, Ryuu,
      reply, replytolak
    } = ctx

    if (!m.isGroup) return replytolak('Fitur Khusus Group!!!')
    if (!isAdmins && !Ryuu) return reply('Fitur Khusus admin!')

    const welcomePath = './database/welcome.json'
    let _welcome = []
    try { _welcome = JSON.parse(fs.readFileSync(welcomePath)) } catch (_) { _welcome = [] }

    const isWelcome = _welcome.includes(m.chat)

    if (args[0] === 'on') {
      if (isWelcome) return reply('Welcome sudah *ON* di grup ini')
      _welcome.push(m.chat)
      fs.writeFileSync(welcomePath, JSON.stringify(_welcome, null, 2))
      reply('✅ Berhasil *mengaktifkan* welcome di grup ini\n\nSekarang bot akan menyambut member baru yang bergabung!')
    } else if (args[0] === 'off') {
      if (!isWelcome) return reply('Welcome sudah *OFF* di grup ini')
      _welcome.splice(_welcome.indexOf(m.chat), 1)
      fs.writeFileSync(welcomePath, JSON.stringify(_welcome, null, 2))
      reply('✅ Berhasil *menonaktifkan* welcome di grup ini')
    } else {
      reply(
        `╭─「 *WELCOME* 」\n` +
        `│\n` +
        `│ Status: ${isWelcome ? '*ON* ✅' : '*OFF* ❌'}\n` +
        `│\n` +
        `│ ${prefix+command} on  → Aktifkan\n` +
        `│ ${prefix+command} off → Nonaktifkan\n` +
        `│\n` +
        `│ Tip: Gunakan .setwelcome untuk\n` +
        `│ kustomisasi pesan welcome\n` +
        `╰─────────────────`
      )
    }
  }
}
