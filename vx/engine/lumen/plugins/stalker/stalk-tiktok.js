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

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} mrbeast`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/tiktok', { username: text.replace(/^@/, '').trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.result) return doReply(`❌ Akun TikTok "${text}" tidak ditemukan.`);

		const r = data.result;
		let cap = `🎵 *TIKTOK STALKER*\n\n`;
		cap += `• *Nickname:* ${r.nickname || '-'}\n`;
		cap += `• *Username:* ${r.username || text}\n`;
		cap += `• *Bio:* ${r.signature || r.bio || '-'}\n`;
		cap += `• *Followers:* ${r.followers ?? r.followerCount ?? '-'}\n`;
		cap += `• *Following:* ${r.following ?? r.followingCount ?? '-'}\n`;
		cap += `• *Likes:* ${r.likes ?? r.heartCount ?? '-'}\n`;
		cap += `• *Total Video:* ${r.videoCount ?? '-'}\n`;
		cap += `• *Verified:* ${r.verified ? 'Ya ✔️' : 'Tidak'}\n`;
		cap += `• *Akun Privat:* ${r.privateAccount ? 'Ya 🔒' : 'Tidak 🔓'}\n`;

		const avatar = r.avatarLarger || r.avatar || r.avatarThumb;
		if (avatar) {
			await client.sendMessage(m.chat, { image: { url: avatar }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-TIKTOK]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk TikTok: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalktiktok <username>'];
handler.tags = ['stalker'];
handler.command = /^(stalktiktok|tiktokstalk)$/i;
handler.limit = true;
handler.register = true;
export default handler;
