// Plugin: nglspam
// Commands: nglspam
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['nglspam'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

try {
			if (!text) return replyalya(
			  `Contoh penggunaan:\n` +
			  `${prefix + command} https://ngl.link/reindiandikarc|11|hai bro 😎|`
			)

			let [url, totalSpam, messageText] = text.split('|')

			if (!url || !totalSpam || !messageText)
			  return replyalya('⚠️ Format salah!\nGunakan: url|jumlah|pesan')

			totalSpam = parseInt(totalSpam)
			if (isNaN(totalSpam) || totalSpam < 1)
			  return replyalya('⚠️ Jumlah harus berupa angka!')

			let username = url.split('/').pop()

			replyalya(
			  `🚀 Memulai pengiriman ${totalSpam} pesan ke akun NGL *${username}*...`
			)

			const api = `https://api.elrayyxml.web.id/api/tools/spamngl?url=${encodeURIComponent(url)}&jumlah=${totalSpam}&pesan=${encodeURIComponent(messageText)}`
			const { data } = await axios.get(api)

			if (!data.status)
			  return replyalya('⚠️ gagal senpai :.')

			replyalya(
			  `✅ Selesai! Berhasil mengirim ${totalSpam} pesan ke *${username}*\n\n` +
			  `🚀 *Powered By ${botname}*`
			)

		  } catch (err) {
			console.error(err)
			replyalya("⚠️ Terjadi kesalahan, coba lagi nanti.")
		  }
  }
};
