import { ephoto } from '../../lib/scrape/ephoto.js';

const handler = async (m, { sock, text, command, reply, usedPrefix }) => {
	if (!text) return reply(`Masukkan teks!\nContoh: *${usedPrefix}${command}* Elysia AI`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const { buffer } = await ephoto('https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html', text);

		const caption = `✅ *CARTOONSTYLE Text*\n` +
			`📝 *Teks:* ${text}\n\n` +
			`© ${global.namaBot}`;

		await sock.sendMessage(m.chat, {
			image: buffer,
			caption: caption
		}, { quoted: m });

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

	} catch (e) {
		console.error('[EPHOTO:cartoonstyle]', e?.message || e);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		reply(`Gagal generate *cartoonstyle*.\nReason: ${e?.message || 'Error occurred'}`);
	}
};

handler.help = ['cartoonstyle <teks>'];
handler.tags = ['maker', 'ephoto'];
handler.command = ['cartoonstyle'];
handler.limit = true

export default handler;