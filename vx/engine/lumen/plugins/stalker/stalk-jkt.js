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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <nama_member>\n*Contoh:* ${usedPrefix + command} freya`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/jkt', { username: text.trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.result) return doReply(`❌ Member JKT48 "${text}" tidak ditemukan.`);

		const r = data.result;
		let cap = `🌸 *JKT48 MEMBER STALKER*\n\n`;
		cap += `• *Nama:* ${r.name || r.fullname || '-'}\n`;
		cap += `• *Panggilan:* ${r.nickname || '-'}\n`;
		cap += `• *Team:* ${r.team || '-'}\n`;
		cap += `• *Generasi:* ${r.generation || '-'}\n`;
		cap += `• *Tanggal Lahir:* ${r.birthdate ? r.birthdate.split('T')[0] : '-'}\n`;
		cap += `• *Golongan Darah:* ${r.bloodType || '-'}\n`;
		cap += `• *Horoskop:* ${r.horoscope || '-'}\n`;
		cap += `• *Tinggi Badan:* ${r.height || '-'}\n`;

		const img = r.picture || r.avatar || r.image;
		if (img) {
			await client.sendMessage(m.chat, { image: { url: img }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-JKT]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk JKT48: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalkjkt <nama>'];
handler.tags = ['stalker'];
handler.command = /^(stalkjkt|jktstalk|jkt48stalk)$/i;
handler.limit = true;
handler.register = true;
export default handler;
