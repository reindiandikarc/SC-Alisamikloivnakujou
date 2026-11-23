// Plugin: linkgc
// Ported from Alya V10 → V13 Plugin System
// Commands: linkgc, linkgroup, gclink, grouplink

module.exports = {
  command: ["linkgc", "linkgroup", "gclink", "grouplink"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      isGroup, groupMetadata,
      isBotAdmins,
      replytolak
    } = ctx

    if (!isGroup) return replytolak(mess.only.group)
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')

    let response = await alya.groupInviteCode(m.chat)
    alya.sendMessage(m.chat, {
      text: `https://chat.whatsapp.com/${response}\n\nGroup Link : ${groupMetadata.subject}`,
      detectLinks: true
    }, { quoted: m })
  }
}
