// Plugin: tagall
// Ported from Alya V10 → V13 Plugin System (FIXED - participants → groupMembers)
// Commands: tagall

module.exports = {
  command: ["tagall"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      q,
      isGroup, isBotAdmins, isAdmins, Ryuu,
      groupMembers,
      replyalya, replytolak, reply
    } = ctx

    if (!isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')

    const members = Array.isArray(groupMembers) ? groupMembers : []
    const me = m.sender

    let teks = `╚»˙·٠${themeemoji}●♥ Tag All ♥●${themeemoji}٠·˙«╝\n\n 😶 *penanda :*  @${me.split('@')[0]}\n 🌿 *Isi pesan : ${q ? q : 'tidak ada pesan'}*\n\n`
    for (let mem of members) {
      teks += `${themeemoji} @${(mem.id || mem).split('@')[0]}\n`
    }

    alya.sendMessage(m.chat, {
      text: teks,
      mentions: members.map(a => a.id || a)
    }, { quoted: m })
  }
}
