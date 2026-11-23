import { getTargetJid } from '../../../_runtime/core-shim.js'
import { CHAT } from '../../../_runtime/core-shim.js'

export default {
  name: 'promote',
  command: ['promote', 'up'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Promote someone to group admin',

  async handle(ctx) {
    const { sock, msg, chat } = ctx
    if (!chat.endsWith('@g.us')) {
      return sock.sendMessage(chat, { text: 'Group only.' })
    }

    const target = getTargetJid(msg)
    if (!target) {
      return sock.sendMessage(chat, { text: 'Mention or reply to someone.' }, { quoted: msg })
    }

    await sock.groupParticipantsUpdate(chat, [target], 'promote')
    await sock.sendMessage(chat, { text: `Promoted ${target}` })
  }
}