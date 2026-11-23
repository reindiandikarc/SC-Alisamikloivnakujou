module.exports = async function (__naren_imp, __naren_meta) {


/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029Vb94x5OI1rcrIGfUza2Y
 * 
 * note : don't claim this code
 */

let handler = async (m, { conn, sock, reply }) => {
	const client = conn || sock
	const doReply = typeof reply === 'function' ? reply : typeof m.reply === 'function' ? m.reply.bind(m) : (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m })

	try {
		if (typeof global.react === 'function') {
			await global.react(client, m, 'loading')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})
		}

		const url = global.API('kyzz', '/api/image/anime-hot', {}, 'apikey')
		await client.sendMessage(m.chat, {
			image: { url },
			caption: `✨ Random Image — Anime Hot`
		}, { quoted: m })

		if (typeof global.react === 'function') {
			await global.react(client, m, 'success')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
		}
	} catch (e) {
		console.error('[IMAGE:Anime Hot]', e.response?.data || e)
		if (typeof global.react === 'function') {
			await global.react(client, m, 'error')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
		}
		doReply('❌ Gagal mengambil gambar Anime Hot.')
	}
}

handler.help = ["animehot","hotanime"]
handler.tags = ['image']
handler.command = /^(animehot|hotanime)$/i
handler.limit = true
handler.register = true

const __naren_default = handler;

;return { default: __naren_default };
}
