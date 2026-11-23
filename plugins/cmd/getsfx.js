// Plugin: getsfx
// Commands: getsfx
// Download & kirim audio SFX dari URL (dipanggil dari carousel searchsfx)
// V20 — by Alya

'use strict'

const axios = require('axios')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

module.exports = {
  command: ['getsfx'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { text, q, reply, replyalya, replytolak } = ctx

    if (!q) return replytolak('❌ Tidak ada URL SFX!')

    // Format dari carousel: "url|judul"
    const parts  = q.split('|')
    const mp3Url = parts[0].trim()
    const title  = parts.slice(1).join('|').trim() || 'SFX'

    // Validasi URL
    if (!mp3Url.startsWith('http') || !mp3Url.includes('.mp3')) {
      return replytolak('❌ URL tidak valid!')
    }

    await alya.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } })

    try {
      // Download audio sebagai buffer
      const response = await axios.get(mp3Url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': UA },
        timeout: 20000
      })

      const buffer = Buffer.from(response.data)

      // Kirim sebagai audio (bukan PTT)
      await alya.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[getsfx]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal download SFX: ${e.message}`)
    }
  }
}
