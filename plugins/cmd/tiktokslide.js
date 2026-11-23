// Plugin: tiktokslide
// Commands: ttslide, tiktokslide
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['ttslide', 'tiktokslide'],
  tags: ['download'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!text) return replyalya(`Gunakan dengan cara ${prefix+command} *url*\n\n_Contoh_\n\n${prefix+command} https://vt.tiktok.com/ZSL36LfEP/`)
    await alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    try {
      const anu = await fetchJson(`https://btch.us.kg/download/tiktokslide?url=${encodeURIComponent(text)}`)
      const images = anu?.result?.images
      if (!Array.isArray(images) || !images.length) {
        throw new Error('API tidak mengembalikan gambar slide apapun')
      }
      for (const img of images) {
        await alya.sendMessage(m.chat, { image: { url: img }, caption: anu.result.title || '' }, { quoted: m })
      }
      await alya.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })
    } catch (error) {
      console.error('[tiktokslide] gagal:', error?.message || error)
      await alya.sendMessage(m.chat, { react: { text: "✖️", key: m.key } })
      await replyalya(`❌ Gagal mengambil slide TikTok.\n_${error?.message || 'Coba lagi nanti'}_`)
    }
  }
};
