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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <UID>\n*Contoh:* ${usedPrefix + command} 800000000`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/gensin', { uid: text.trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.playerData) return doReply(`❌ Player Genshin dengan UID "${text}" tidak ditemukan.`);

		const p = data.playerData;
		let cap = `⚔️ *GENSHIN IMPACT STALKER*\n\n`;
		cap += `• *UID:* ${data.uid || text}\n`;
		cap += `• *Nickname:* ${p.username || '-'}\n`;
		cap += `• *Level:* ${p.level ?? '-'}\n`;
		cap += `• *World Level:* ${p.worldLevel ?? '-'}\n`;
		cap += `• *Signature:* ${p.signature || '-'}\n`;
		cap += `• *Achievements:* ${p.finishAchievementNum ?? '-'}\n`;
		cap += `• *Abyss Floor:* ${p.towerFloorIndex ? `${p.towerFloorIndex}-${p.towerLevelIndex}` : '-'}\n`;

		if (p.avatar) {
			await client.sendMessage(m.chat, { image: { url: p.avatar }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-GENSHIN]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk Genshin: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalkgenshin <uid>'];
handler.tags = ['stalker'];
handler.command = /^(stalkgenshin|genshinstalk|stalkgi)$/i;
handler.limit = true;
handler.register = true;
export default handler;
