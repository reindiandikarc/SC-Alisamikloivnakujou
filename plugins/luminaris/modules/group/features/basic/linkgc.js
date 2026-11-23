import { CHAT } from '../../../../_runtime/core-shim.js'

export default {
  name: 'linkgc',
  command: ['linkgc', 'gclink', 'linkgroup', 'invite'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Ambil link undangan grup (admin only)',

  async handle(ctx) {
    const { sock, chat } = ctx

    let code
    try {
      code = await sock.groupInviteCode(chat)
    } catch (error) {
      return ctx.reply.error(
        `Gagal mengambil link grup: ${error.message}\n` +
        'Pastikan bot adalah admin grup.'
      )
    }

    if (!code) return ctx.reply.error('Grup tidak mengembalikan kode undangan.')

    return ctx.reply.success(`https://chat.whatsapp.com/${code}`)
  }
}
