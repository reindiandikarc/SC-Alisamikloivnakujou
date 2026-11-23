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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} dimeh493`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/tiktok-repost', { username: text.replace(/^@/, '').trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.result) return doReply(`❌ Data repost TikTok "${text}" tidak ditemukan.`);

		const r = data.result;
		let cap = `🔁 *TIKTOK REPOST VIEWER*\n\n`;
		cap += `• *Username:* ${data.username || text}\n`;
		if (Array.isArray(r)) {
			cap += `• *Total Repost:* ${r.length}\n\n`;
			for (const [i, item] of r.slice(0, 5).entries()) {
				cap += `*${i + 1}.* ${item.title || item.desc || 'Video'}\n> ${item.url || item.videoUrl || '-'}\n\n`;
			}
		} else {
			cap += `• *Hasil:* ${JSON.stringify(r).slice(0, 300)}\n`;
		}

		await doReply(cap.trim());
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-TTREPOST]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal ambil repost TikTok: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalkttrepost <username>'];
handler.tags = ['stalker'];
handler.command = /^(stalkttrepost|ttrepost)$/i;
handler.limit = true;
handler.register = true;
export default handler;
