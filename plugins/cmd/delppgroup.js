// Plugin: delppgroup
// Commands: deleteppgroup, delppgc, deleteppgc, delppgroup
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['deleteppgroup', 'delppgc', 'deleteppgc', 'delppgroup'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    await alya.removeProfilePicture(from)
    await reply('✅ Foto profil grup berhasil dihapus.')
  }
};
