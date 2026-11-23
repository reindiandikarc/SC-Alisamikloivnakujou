// Plugin: totag
// Ported from Alya V10 → V13 Plugin System (FIXED - participants → groupMembers)
// Commands: totag

module.exports = {
  command: ["totag"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      prefix, command,
      isGroup, isBotAdmins, isAdmins, Ryuu,
      groupMembers,
      replyalya, replytolak, reply
    } = ctx

    if (!isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!m.quoted) return replyalya(`Reply message with caption ${prefix + command}`)

    const members = Array.isArray(groupMembers) ? groupMembers : []
    alya.sendMessage(m.chat, {
      forward: m.quoted.fakeObj,
      mentions: members.map(a => a.id || a)
    })
  }
}
