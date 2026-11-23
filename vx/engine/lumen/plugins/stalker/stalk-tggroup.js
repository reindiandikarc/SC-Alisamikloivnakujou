/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

let handler = async (m, { conn, sock, text, usedPrefix, command, reply }) => {
	const client = conn || sock;
	const doReply = typeof reply === 'function' ? reply : typeof m.reply === 'function' ? m.reply.bind(m) : (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m });

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <username_grup>\n*Contoh:* ${usedPrefix + command} anyabot`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/telegram-group', { username: text.replace(/^@/, '').trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status && !data?.title) return doReply(`❌ Group Telegram "${text}" tidak ditemukan.`);

		let cap = `👥 *TELEGRAM GROUP STALKER*\n\n`;
		cap += `• *Judul:* ${data.title || data.result?.title || '-'}\n`;
		cap += `• *Username:* @${data.username || text}\n`;
		cap += `• *Deskripsi:* ${data.description || data.result?.description || '-'}\n`;
		cap += `• *Anggota:* ${data.members ?? data.subscribers ?? data.result?.members ?? '-'}\n`;
		if (data.link) cap += `• *Link:* ${data.link}\n`;

		const img = data.photoUrl || data.result?.photoUrl;
		if (img) {
			await client.sendMessage(m.chat, { image: { url: img }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-TGGROUP]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk Group Telegram: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalktggroup <username>'];
handler.tags = ['stalker'];
handler.command = /^(stalktggroup|tggroupstalk)$/i;
handler.limit = true;
handler.register = true;
export default handler;
