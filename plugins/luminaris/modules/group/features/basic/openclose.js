import { CHAT } from '../../../../_runtime/core-shim.js'

export default {
  name: 'openclose',
  command: ['open', 'close', 'openclose', 'opengc', 'closegc', 'buka', 'tutup'],
  allow: CHAT.GROUP,
  role: 5,
  category: 'group',
  description: 'Buka / tutup grup untuk anggota (admin only)',

  async handle(ctx) {
    const { sock, chat, trigger, args } = ctx
    const name = String(trigger || '').toLowerCase()

    let action = null
    if (['open', 'unlock', 'opengc', 'buka'].includes(name)) action = 'open'
    else if (['close', 'lock', 'closegc', 'tutup'].includes(name)) action = 'close'
    else {
      const sub = String(args[0] || '').toLowerCase()
      if (['open', 'unlock', 'buka', 'not_announcement'].includes(sub)) action = 'open'
      if (['close', 'lock', 'tutup', 'announcement'].includes(sub)) action = 'close'
    }

    if (!action) {
      return ctx.reply.error(
        'Pakai: open (semua bisa kirim) atau close (hanya admin).'
      )
    }

    try {
      await sock.groupSettingUpdate(
        chat,
        action === 'open' ? 'not_announcement' : 'announcement'
      )
    } catch (error) {
      return ctx.reply.error(
        `Gagal mengubah pengaturan grup: ${error.message}\n` +
        'Pastikan bot adalah admin grup.'
      )
    }

    return ctx.reply.success(
      action === 'open'
        ? '🔓 Grup dibuka. Semua anggota bisa mengirim pesan.'
        : '🔒 Grup ditutup. Hanya admin yang bisa mengirim pesan.'
    )
  }
}
