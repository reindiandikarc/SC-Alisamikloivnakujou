import { ephoto } from '../../lib/scrape/ephoto.js';

const handler = async (m, { sock, text, command, reply, usedPrefix }) => {
	if (!text) return reply(`Masukkan teks!\nContoh: *${usedPrefix}${command}* sahril2nd`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const { buffer } = await ephoto('https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html', text);

		const caption = `✅ *PIXELGLITCH Text*\n` +
			`📝 *Teks:* ${text}\n\n` +
			`© ${global.namaBot}`;

		await sock.sendMessage(m.chat, {
			image: buffer,
			caption: caption
		}, { quoted: m });

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

	} catch (e) {
		console.error('[EPHOTO:pixelglitch]', e?.message || e);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		reply(`Gagal generate *pixelglitch*.\nReason: ${e?.message || 'Error occurred'}`);
	}
};

handler.help = ['pixelglitch <teks>'];
handler.tags = ['maker', 'ephoto'];
handler.command = ['pixelglitch'];
handler.limit = true

export default handler;