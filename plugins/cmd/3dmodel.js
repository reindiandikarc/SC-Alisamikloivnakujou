// Plugin: 3dmodel
// Commands: realistic, 3dmodel
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['realistic', '3dmodel'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!text) return reply(`*Contoh:* ${prefix + command} blue sky`)

    try {
      await alya.sendMessage(m.chat, { react: { text: "⏱️", key: m.key }})

      let data = await BingAlya(text)
      if (!data) return reply('❌ Gagal generate gambar. Coba lagi.')

      const img = Array.isArray(data) ? data[0] : data
      await alya.sendMessage(m.chat, {
        image: { url: img },
        caption: `✅ *${command}* — ${text}`
      }, { quoted: m })

    } catch(e) {
      await reply(`❌ Gagal generate gambar.\n${e.message || ''}`)
    }
  }
};
