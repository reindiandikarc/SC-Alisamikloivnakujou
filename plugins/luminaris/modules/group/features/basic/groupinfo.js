import { CHAT } from '../../../../_runtime/core-shim.js'
import { adminCount, formatDate, ownerOf } from './shared.js'

export default {
  name: 'groupinfo',
  command: ['groupinfo', 'infogc', 'gcinfo'],
  allow: CHAT.GROUP,
  role: 10,
  category: 'group',
  description: 'Lihat informasi grup',

  async handle(ctx) {
    const { sock, chat } = ctx
    const meta = await sock.groupMetadata(chat).catch(() => null)
    if (!meta) return ctx.reply.error('Gagal mengambil metadata grup.')

    const description = String(meta.desc || '').trim()
    const owner = ownerOf(meta)
    const created = meta.creation

    return ctx.reply([
      `*${meta.subject || 'Grup'}*`,
      `ID       : ${chat}`,
      `Owner    : ${owner || '—'}`,
      `Dibuat   : ${formatDate(created)}`,
      `Anggota  : ${meta.participants?.length ?? 0}`,
      `Admin    : ${adminCount(meta)}`,
      `Kirim    : ${meta.announce ? 'hanya admin 🔒' : 'semua anggota 🔓'}`,
      `Edit info: ${meta.restrict ? 'hanya admin 🔒' : 'semua anggota 🔓'}`,
      '',
      `Deskripsi:\n${description || '_belum diisi_'}`
    ].join('\n'))
  }
}
