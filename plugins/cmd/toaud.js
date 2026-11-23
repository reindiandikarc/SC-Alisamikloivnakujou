// Plugin: toaud
// Commands: toaud
// Konversi video/audio yang di-reply jadi file audio (mp3-style).
//
// ⚠️ CATATAN: file ini ditulis ULANG dari nol. Versi sebelumnya berisi sisa
// migrasi switch-case yang gagal — beberapa fitur tidak berkaitan (togif,
// toqr, dare, truth) ter-gabung jadi SATU alur linear tanpa percabangan
// sama sekali (semua kode di setiap "case" lama akan tereksekusi berurutan
// dalam satu pemanggilan .toaud, bukan dipisah per command). togif dan toqr
// sudah punya plugin terpisah yang berfungsi normal (tomp4.js, qr.js),
// jadi tidak hilang fungsinya. Fitur dare/truth dihapus karena sebagian
// kontennya tidak pantas untuk konteks bot umum.

const path = require('path')

module.exports = {
  command: ['toaud'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { prefix, command, quoted, mime, reply, replyalya } = ctx

    if (!quoted || !(/video|audio/.test(mime || ''))) {
      return reply(`Reply video/audio yang ingin dikonversi jadi audio dengan caption *${prefix}${command}*`)
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
      const media = await quoted.download()
      const { toAudio } = require('../../lib/converter')
      const audio = await toAudio(media, 'mp4')

      await alya.sendMessage(m.chat, { audio, mimetype: 'audio/mpeg' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[toaud] gagal konversi:', e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await replyalya(`❌ Gagal mengonversi ke audio.\n_${e?.message || 'Format file mungkin tidak didukung'}_`)
    }
  }
}
