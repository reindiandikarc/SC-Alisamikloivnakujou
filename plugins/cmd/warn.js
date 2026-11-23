// Plugin: warn
// Fixed for Alya V20 -- pakai shared lib/warnHelper.js (dipakai juga oleh AFK auto-warn)
// Commands: warn

const { addWarn } = require('../../lib/warnHelper')

module.exports = {
  command: ["warn"],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      isGroup,
      groupAdmins,
      isBotAdmins, isGroupAdmins, isAdmins,
      Ryuu,
      replyalya, replytolak
    } = ctx

    if (!isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return replytolak(mess.only.admin)

    let targetUser = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    if (!targetUser) return replyalya('Tag atau balas pesan member yang ingin diberi peringatan.')

    if (groupAdmins.includes(targetUser)) return replyalya('Tidak bisa memberi peringatan kepada admin!')

    const { warnCount, maxWarn, kicked } = addWarn(m.chat, targetUser)

    if (kicked) {
      if (!isBotAdmins) return replyalya(`@${targetUser.split('@')[0]} sudah mencapai ${maxWarn}/${maxWarn} peringatan, tapi bot bukan admin sehingga tidak bisa kick!`, [targetUser])

      await alya.sendMessage(m.chat, {
        text: `@${targetUser.split('@')[0]} telah mencapai ${maxWarn}/${maxWarn} peringatan.\n\nMember telah di-KICK dari grup!`,
        mentions: [targetUser]
      }, { quoted: m })
      await alya.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
    } else {
      replyalya(
        `PERINGATAN DIBERIKAN\n\n` +
        `User: @${targetUser.split('@')[0]}\n` +
        `Warn: ${warnCount}/${maxWarn}\n\n` +
        `${warnCount >= 3 ? 'Hati-hati! Mendekati batas maksimal.' : 'Perhatikan aturan grup!'}\n` +
        `Jika warn mencapai ${maxWarn}/${maxWarn} maka akan di-kick otomatis.`,
        [targetUser]
      )
    }
  }
}
