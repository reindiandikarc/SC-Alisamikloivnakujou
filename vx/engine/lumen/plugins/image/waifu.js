/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

let handler = async (m, { conn, sock, reply }) => {
	const client = conn || sock
	const doReply = typeof reply === 'function' ? reply : typeof m.reply === 'function' ? m.reply.bind(m) : (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m })

	try {
		if (typeof global.react === 'function') {
			await global.react(client, m, 'loading')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})
		}

		const apiUrl = global.API('kyzz', '/api/image/waifu', { count: '10' }, 'apikey')
		const { data } = await axios.get(apiUrl, { timeout: 15000 })

		if (!data?.status || !Array.isArray(data?.result) || !data.result.length) {
			throw new Error('Gambar waifu tidak ditemukan')
		}

		const imgUrl = data.result[Math.floor(Math.random() * data.result.length)]
		await client.sendMessage(m.chat, {
			image: { url: imgUrl },
			caption: `✨ Random Image — Waifu`
		}, { quoted: m })

		if (typeof global.react === 'function') {
			await global.react(client, m, 'success')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
		}
	} catch (e) {
		console.error('[IMAGE:waifu]', e.response?.data || e)
		if (typeof global.react === 'function') {
			await global.react(client, m, 'error')
		} else if (client.sendMessage) {
			await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
		}
		doReply('❌ Gagal mengambil gambar Waifu.')
	}
}

handler.help = ['waifu']
handler.tags = ['image']
handler.command = /^(waifu)$/i
handler.limit = true
handler.register = true

export default handler
