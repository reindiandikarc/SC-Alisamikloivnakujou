import { CHAT } from '../../../../_runtime/core-shim.js'
import { botJid, mentionList, participantMentions, sameUser } from './shared.js'

export default {
  name: 'tagall',
  command: ['tagall', 'everyone', 'hidetag', 'tagall2'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Tag semua anggota grup (admin only)',

  async handle(ctx) {
    const { sock, chat, trigger, args } = ctx
    const meta = await sock.groupMetadata(chat).catch(() => null)
    if (!meta) return ctx.reply.error('Gagal mengambil daftar anggota grup.')

    const me = botJid(sock)
    const members = participantMentions(meta).filter((jid) => !me || !sameUser(me, jid))
    if (!members.length) return ctx.reply.error('Tidak ada anggota yang bisa di-tag.')

    const message = args.join(' ').trim() || '📢 Pengumuman'
    const hidden = ['hidetag', 'tagall2'].includes(String(trigger || '').toLowerCase())

    const text = hidden
      ? message
      : `${message}\n\n${mentionList(members)}`

    try {
      await sock.sendMessage(chat, { text, mentions: members })
    } catch (error) {
      return ctx.reply.error(`Gagal tag semua: ${error.message}`)
    }
  }
}
