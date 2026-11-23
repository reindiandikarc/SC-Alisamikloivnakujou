import { CHAT } from '../../../../_runtime/core-shim.js'
import { botJid, sameUser } from './shared.js'

export default {
  name: 'delete',
  command: ['delete', 'del', 'hapus'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Hapus pesan yang di-reply (admin only)',

  async handle(ctx) {
    const { sock, chat, msg } = ctx
    const info = contextInfoOf(msg.message)
    if (!info?.stanzaId) {
      return ctx.reply.error('Reply pesan yang mau dihapus, lalu jalankan command ini.')
    }

    const me = botJid(sock)
    const participant = info.participant || null
    const fromMe = !!me && !!participant && sameUser(me, participant)

    try {
      await sock.sendMessage(chat, {
        delete: {
          remoteJid: chat,
          fromMe,
          id: info.stanzaId,
          participant: fromMe ? undefined : participant
        }
      })
    } catch (error) {
      return ctx.reply.error(
        `Gagal menghapus pesan: ${error.message}\n` +
        'Pastikan bot adalah admin grup.'
      )
    }
  }
}

function contextInfoOf(message) {
  if (!message) return null
  const direct = message.extendedTextMessage?.contextInfo
  if (direct) return direct

  for (const value of Object.values(message)) {
    if (value && typeof value === 'object' && value.contextInfo) return value.contextInfo
  }
  return null
}
