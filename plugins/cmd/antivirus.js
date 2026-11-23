// Plugin: antivirus
// Ported from Alya V10 → V13 Plugin System (FIXED - removed wrongly merged antilink code)
// Commands: antivirus, antivirtex

const fs = require('fs')

module.exports = {
  command: ["antivirus", "antivirtex"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix, command, from,
      isGroup, isBotAdmins, isAdmins, Ryuu,
      groupMembers,
      replyalya, replytolak, reply,
      mess
    } = ctx

    if (!isGroup) return replytolak(mess?.only?.group || 'Fitur ini hanya bisa dipakai di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntvirtex = JSON.parse(fs.readFileSync('./database/antivirus.json'))
    const antiVirtex = ntvirtex.includes(from)

    if (!args[0]) return replyalya(
      `🛡️ *ANTIVIRUS*\n\n` +
      `Status: *${antiVirtex ? 'AKTIF ✅' : 'NONAKTIF ❌'}*\n\n` +
      `⚙️ *Penggunaan:*\n` +
      `• ${prefix + command} on\n` +
      `• ${prefix + command} off`
    )

    if (args[0] === 'on') {
      if (antiVirtex) return replyalya('Already activated')
      ntvirtex.push(from)
      fs.writeFileSync('./database/antivirus.json', JSON.stringify(ntvirtex))
      replyalya('Success in turning on antivirus in this group')
      const members = Array.isArray(groupMembers) ? groupMembers : []
      const mems = members.map(a => (a.id || a).replace('c.us', 's.whatsapp.net'))
      alya.sendMessage(from, {
        text: '```「 ⚠️Warning⚠️ 」```\n\nNo body is allowed to send virus in this group, member who send will be kicked immediately!',
        contextInfo: { mentionedJid: mems }
      }, { quoted: m })
    } else if (args[0] === 'off') {
      if (!antiVirtex) return replyalya('Already deactivated')
      let off = ntvirtex.indexOf(from)
      ntvirtex.splice(off, 1)
      fs.writeFileSync('./database/antivirus.json', JSON.stringify(ntvirtex))
      replyalya('Success in turning off antivirus this group')
    } else {
      replyalya(`Contoh: ${prefix + command} on/off`)
    }
  }
}
