import { ephoto } from '../../lib/scrape/ephoto.js';

const handler = async (m, { sock, text, command, reply, usedPrefix }) => {
	if (!text) return reply(`Masukkan teks!\nContoh: *${usedPrefix}${command}* sahril2nd`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const { buffer } = await ephoto('https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html', text);

		const caption = `✅ *MULTICOLOREDNEON Text*\n` +
			`📝 *Teks:* ${text}\n\n` +
			`© ${global.namaBot}`;

		await sock.sendMessage(m.chat, {
			image: buffer,
			caption: caption
		}, { quoted: m });

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

	} catch (e) {
		console.error('[EPHOTO:multicoloredneon]', e?.message || e);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		reply(`Gagal generate *multicoloredneon*.\nReason: ${e?.message || 'Error occurred'}`);
	}
};

handler.help = ['multicoloredneon <teks>'];
handler.tags = ['maker', 'ephoto'];
handler.command = ['multicoloredneon'];
handler.limit = true

export default handler;