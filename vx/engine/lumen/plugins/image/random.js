/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

let handler = async (m, { conn, sock, args, reply }) => {
	const client = conn || sock
	const doReply = typeof reply === 'function' ? reply : typeof m.reply === 'function' ? m.reply.bind(m) : (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m })

	try {
		if (typeof global.react === 'function') {
			await global.react(client, m, 'loading')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})
		}

		const category = args[0] || ''
		const apiUrl = global.API('kyzz', '/api/image/random', category ? { category } : {}, 'apikey')
		const { data } = await axios.get(apiUrl, { timeout: 15000 })

		const imgUrl = data?.url || data?.result || data?.image || apiUrl
		await client.sendMessage(m.chat, {
			image: { url: typeof imgUrl === 'string' ? imgUrl : apiUrl },
			caption: `✨ Random Image`
		}, { quoted: m })

		if (typeof global.react === 'function') {
			await global.react(client, m, 'success')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
		}
	} catch (e) {
		console.error('[IMAGE:random]', e.response?.data || e)
		if (typeof global.react === 'function') {
			await global.react(client, m, 'error')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
		}
		doReply('❌ Gagal mengambil random image.')
	}
}

handler.help = ['imagerandom [kategori]']
handler.tags = ['image']
handler.command = /^(imagerandom|randomimage)$/i
handler.limit = true
handler.register = true

export default handler
