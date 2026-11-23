import { CHAT } from '../../../../_runtime/core-shim.js'
import { isGroupAdmin } from '../moderation/shared.js'
import { botJid, isRootOwner, resolveTarget, sameUser } from './shared.js'

export default {
  name: 'kick',
  command: ['kick', 'tendang', 'remove'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Keluarkan anggota dari grup (admin only)',

  async handle(ctx) {
    const { sock, chat } = ctx
    const target = resolveTarget(ctx)
    if (!target) {
      return ctx.reply.error('Mention / reply anggota yang mau dikeluarkan, atau tulis nomornya.')
    }

    const me = botJid(sock)
    if (me && sameUser(me, target)) {
      return ctx.reply.error('Aku tidak bisa mengeluarkan diriku sendiri.')
    }
    if (isRootOwner(target)) {
      return ctx.reply.error('Owner bot tidak bisa dikeluarkan lewat command ini.')
    }

    const meta = await sock.groupMetadata(chat).catch(() => null)
    if (meta && isGroupAdmin(meta, target)) {
      return ctx.reply.error('Target adalah admin grup. Demote dulu sebelum mengeluarkannya.')
    }

    try {
      await sock.groupParticipantsUpdate(chat, [target], 'remove')
    } catch (error) {
      return ctx.reply.error(
        `Gagal mengeluarkan ${target}: ${error.message}\n` +
        'Pastikan bot adalah admin grup.'
      )
    }

    return ctx.reply.success(`✅ ${target} dikeluarkan dari grup.`)
  }
}
