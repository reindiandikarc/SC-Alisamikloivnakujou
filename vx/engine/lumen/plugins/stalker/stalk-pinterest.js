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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} yuliii___`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/pinterest', { username: text.trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.result) return doReply(`❌ Akun Pinterest "${text}" tidak ditemukan.`);

		const r = data.result;
		let cap = `📌 *PINTEREST STALKER*\n\n`;
		cap += `• *Nama:* ${r.name || r.fullName || '-'}\n`;
		cap += `• *Username:* ${data.username || text}\n`;
		cap += `• *Bio:* ${r.about || r.bio || '-'}\n`;
		cap += `• *Followers:* ${r.followers ?? '-'}\n`;
		cap += `• *Following:* ${r.following ?? '-'}\n`;
		cap += `• *Pins:* ${r.pins ?? r.pinCount ?? '-'}\n`;

		const img = r.avatar || r.image;
		if (img) {
			await client.sendMessage(m.chat, { image: { url: img }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-PINTEREST]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk Pinterest: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalkpinterest <username>'];
handler.tags = ['stalker'];
handler.command = /^(stalkpinterest|pinstalk)$/i;
handler.limit = true;
handler.register = true;
export default handler;
