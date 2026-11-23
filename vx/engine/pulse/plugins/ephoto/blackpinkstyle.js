import { ephoto } from '../../lib/scrape/ephoto.js';

const handler = async (m, { sock, text, command, reply, usedPrefix }) => {
	if (!text) return reply(`Masukkan teks!\nContoh: *${usedPrefix}${command}* sahril2nd`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const { buffer } = await ephoto('https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html', text);

		const caption = `✅ *BLACKPINKSTYLE Text*\n` +
			`📝 *Teks:* ${text}\n\n` +
			`© ${global.namaBot}`;

		await sock.sendMessage(m.chat, {
			image: buffer,
			caption: caption
		}, { quoted: m });

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

	} catch (e) {
		console.error('[EPHOTO:blackpinkstyle]', e?.message || e);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		reply(`Gagal generate *blackpinkstyle*.\nReason: ${e?.message || 'Error occurred'}`);
	}
};

handler.help = ['blackpinkstyle <teks>'];
handler.tags = ['maker', 'ephoto'];
handler.command = ['blackpinkstyle'];
handler.limit = true

export default handler;