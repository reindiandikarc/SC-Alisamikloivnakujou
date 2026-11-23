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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <link_saluran>\n*Contoh:* ${usedPrefix + command} https://whatsapp.com/channel/0029Vb8cslf8aKvEpFOaMC0m`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/wa-sl-stalk', { url: text.trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.result) return doReply(`❌ Channel WhatsApp tidak ditemukan atau link salah.`);

		const r = data.result;
		let cap = `📢 *WHATSAPP CHANNEL STALKER*\n\n`;
		cap += `• *Nama Saluran:* ${r.name || '-'}\n`;
		cap += `• *Deskripsi:* ${r.desc || r.description || '-'}\n`;
		if (r.followers) cap += `• *Followers:* ${r.followers}\n`;
		if (r.role) cap += `• *Role:* ${r.role}\n`;
		if (r.verified !== undefined) cap += `• *Verified:* ${r.verified ? 'Ya ✔️' : 'Tidak'}\n`;

		const img = r.image || r.avatar;
		if (img) {
			await client.sendMessage(m.chat, { image: { url: img }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-WACH]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk Saluran WhatsApp: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalkwach <link_saluran>'];
handler.tags = ['stalker'];
handler.command = /^(stalkwach|wachstalk)$/i;
handler.limit = true;
handler.register = true;
export default handler;
