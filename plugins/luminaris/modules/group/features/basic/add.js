import { CHAT, toJid } from '../../../../_runtime/core-shim.js'

export default {
  name: 'add',
  command: ['add', 'tambah'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Tambahkan nomor ke grup (admin only)',

  async handle(ctx) {
    const { sock, chat, args } = ctx
    const raw = args[0]
    if (!raw) {
      return ctx.reply.error('Pakai: add 6281234567890')
    }

    const digits = String(raw).replace(/\D/g, '')
    if (digits.length < 6) {
      return ctx.reply.error('Nomor tidak valid. Contoh: add 6281234567890')
    }

    const jid = toJid(digits)
    let result
    try {
      result = await sock.groupParticipantsUpdate(chat, [jid], 'add')
    } catch (error) {
      return ctx.reply.error(
        `Gagal menambahkan ${jid}: ${error.message}\n` +
        'Pastikan bot admin dan nomor tidak memblokir undangan grup.'
      )
    }

    const status = Array.isArray(result) ? result[0] : null
    if (status?.status && String(status.status) !== '200') {
      return ctx.reply.error(
        `Gagal menambahkan ${jid} (status ${status.status}). ` +
        'Mungkin privasi undangannya menolak, atau nomor tidak terdaftar di WhatsApp.'
      )
    }

    return ctx.reply.success(`✅ ${jid} ditambahkan ke grup.`)
  }
}
