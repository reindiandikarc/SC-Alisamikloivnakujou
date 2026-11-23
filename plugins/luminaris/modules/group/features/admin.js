import { jidNormalizedUser } from '@whiskeysockets/baileys'
import { CHAT } from '../../../_runtime/core-shim.js'

export default {
  name: 'admin',
  command: ['admin', 'admins'],
  allow: CHAT.GROUP,
  role: 10,
  category: 'group',
  description: 'List group admins',

  async handle(ctx) {
    const { sock, msg, chat } = ctx
    if (!chat.endsWith('@g.us')) {
      return sock.sendMessage(chat, { text: 'Group only.' })
    }

    const meta = await sock.groupMetadata(chat)
    const admins =
      meta.admins ||
      (meta.participants || []).filter((p) => p.admin).map(display)

    const lines = [
      `*${meta.subject}*`,
      `Admins: ${admins.length} / ${meta.participants?.length ?? '?'}`,
      ''
    ]
    for (const admin of admins) lines.push(`• ${jidNormalizedUser(admin)}`)

    await sock.sendMessage(chat, { text: lines.join('\n') }, { quoted: msg })
  }
}

function display(participant) {
  const jid = participant.phoneNumber || participant.id || participant.lid
  return jidNormalizedUser(jid)
}