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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <username_user>\n*Contoh:* ${usedPrefix + command} alex`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/telegram-user', { username: text.replace(/^@/, '').trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status && !data?.username && !data?.name) return doReply(`❌ User Telegram "${text}" tidak ditemukan.`);

		const r = data.result || data;
		let cap = `👤 *TELEGRAM USER STALKER*\n\n`;
		cap += `• *Nama:* ${r.name || r.title || '-'}\n`;
		cap += `• *Username:* @${r.username || text}\n`;
		cap += `• *Bio:* ${r.bio || r.description || '-'}\n`;
		if (r.id) cap += `• *ID:* ${r.id}\n`;

		const img = r.photoUrl || r.avatar;
		if (img) {
			await client.sendMessage(m.chat, { image: { url: img }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-TGUSER]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk User Telegram: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalktg <username>'];
handler.tags = ['stalker'];
handler.command = /^(stalktg|tgstalk)$/i;
handler.limit = true;
handler.register = true;
export default handler;
