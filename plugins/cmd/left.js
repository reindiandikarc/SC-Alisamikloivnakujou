// Plugin: left
// Commands: left, goodbye

const fs = require('fs')

module.exports = {
  command: ["left", "goodbye"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      isAdmins, Ryuu,
      reply, replytolak
    } = ctx

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!isAdmins && !Ryuu) return reply('Fitur Khusus admin!')

    const leftPath = './database/left.json'
    let _left = []
    try { _left = JSON.parse(fs.readFileSync(leftPath)) } catch (_) { _left = [] }

    const isLeft = _left.includes(m.chat)

    if (args[0] === 'on') {
      if (isLeft) return reply('Left/Goodbye sudah *ON* di grup ini')
      _left.push(m.chat)
      fs.writeFileSync(leftPath, JSON.stringify(_left, null, 2))
      reply('✅ Berhasil *mengaktifkan* goodbye di grup ini\n\nSekarang bot akan mengirim pesan perpisahan saat member keluar!')
    } else if (args[0] === 'off') {
      if (!isLeft) return reply('Left/Goodbye sudah *OFF* di grup ini')
      _left.splice(_left.indexOf(m.chat), 1)
      fs.writeFileSync(leftPath, JSON.stringify(_left, null, 2))
      reply('✅ Berhasil *menonaktifkan* goodbye di grup ini')
    } else {
      reply(
        `╭─「 *LEFT / GOODBYE* 」\n` +
        `│\n` +
        `│ Status: ${isLeft ? '*ON* ✅' : '*OFF* ❌'}\n` +
        `│\n` +
        `│ ${prefix+command} on  → Aktifkan\n` +
        `│ ${prefix+command} off → Nonaktifkan\n` +
        `│\n` +
        `│ Tip: Gunakan .setleft untuk\n` +
        `│ kustomisasi pesan perpisahan\n` +
        `╰─────────────────`
      )
    }
  }
}
