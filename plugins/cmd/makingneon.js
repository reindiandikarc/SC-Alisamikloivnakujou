// Plugin: makingneon
// Commands: makingneon, royaltext, freecreate
// V20 FIX: pakai lib/ephoto.js
'use strict'
const { ephoto, getEphotoUrl } = require('../../lib/ephoto')

module.exports = {
  command: ['makingneon', 'royaltext', 'freecreate'],
  tags: ['ephoto'],
  run: async (alya, m, ctx) => {
    const { command, q, prefix, replyalya, mess } = ctx
    if (!q) return replyalya(`✏️ Masukkan teks yang mau dibuat!\nContoh: *${prefix + command}* Nama Kamu`)
    const url = getEphotoUrl(command)
    if (!url) return replyalya('❌ Command tidak dikenal.')
    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    try {
      const imgUrl = await ephoto(url, q)
      await alya.sendMessage(m.chat, { image: { url: imgUrl }, caption: mess?.success || '✅ Selesai!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[ephoto:makingneon]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal membuat efek teks.\n_${e.message}_`)
    }
  }
}
