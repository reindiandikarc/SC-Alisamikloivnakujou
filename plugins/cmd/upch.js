// Plugin: upch
// Commands: upch
// Upload media/teks ke WhatsApp Channel resmi bot (owner only).
//
// ⚠️ Ditulis ulang — versi sebelumnya punya beberapa ReferenceError pasti:
// `mess` tidak pernah didestructure dari ctx, `channel`/`media`/`conn` tidak
// pernah didefinisikan di scope manapun (channel sebenarnya tersedia lewat
// global.channel, sudah dikonfigurasi di settings.js), dan hasil getBuffer
// foto profil diambil tapi tidak pernah dipakai (dead code, fitur ini tidak
// pernah benar-benar membutuhkan foto profil pengirim).

module.exports = {
  command: ['upch'],
  tags: ['owner'],
  owner: true,
  run: async (alya, m, ctx) => {
    const { text, mime, quoted, Ryuu, reply, replytolak } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    if (!global.channel) {
      return reply('❌ Channel belum dikonfigurasi (global.channel kosong di settings.js).')
    }

    const defaultCaption = '✨ Pesan ini dikirim via sistem otomatis ✨'

    try {
      if (!mime && !text) {
        return reply('Kirim/reply media atau teks untuk di-upload ke channel, dengan caption .upch')
      }

      const media = mime ? await quoted.download() : null
      const caption = text || defaultCaption

      if (/image/.test(mime || '')) {
        await alya.sendMessage(global.channel, { image: media, caption })
        await reply(`📸 Gambar berhasil diupload ke channel.\nCaption: "${caption}"`)
      } else if (/video/.test(mime || '')) {
        await alya.sendMessage(global.channel, { video: media, caption })
        await reply(`🎥 Video berhasil diupload ke channel.\nCaption: "${caption}"`)
      } else if (/audio/.test(mime || '')) {
        await alya.sendMessage(global.channel, { audio: media, mimetype: mime, ptt: true })
        await reply('🎵 Audio berhasil diupload ke channel.')
      } else if (text) {
        await alya.sendMessage(global.channel, { text })
        await reply(`💬 Teks berhasil dikirim ke channel: "${text}"`)
      } else {
        return reply('Hmm... tipe media ini belum didukung. Coba kirim image/video/audio/teks ya.')
      }
    } catch (error) {
      console.error('[upch] gagal upload ke channel:', error?.message || error)
      reply(`❌ Gagal upload ke channel.\n_${error?.message || 'Coba lagi nanti'}_`)
    }
  }
}
