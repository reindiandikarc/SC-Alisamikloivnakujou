/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

const handler = async (m, { sock, conn, text, usedPrefix, command, reply }) => {
	const client = sock || conn;

	let num = parseInt(text?.trim());
	if (isNaN(num) || num < 1 || num > 99) {
		num = Math.floor(Math.random() * 99) + 1;
	}

	try {
		await global.react?.(client, m, '🕒').catch(() => {});

		const apiUrl = global.API('kyzz', '/api/islamic/asmaul-husna', { nomor: num }, 'apikey');
		const { data } = await axios.get(apiUrl, { timeout: 15000 });

		if (!data?.status || !data?.result) {
			await global.react?.(client, m, '❌').catch(() => {});
			return reply('❌ Gagal mengambil data Asmaul Husna.');
		}

		const res = data.result;
		const caption = `✨ *ASMAUL HUSNA* (${res.index}/99)\n\n` +
			`📖 *Arab:* ${res.arabic}\n` +
			`🔤 *Latin:* ${res.latin}\n` +
			`🇮🇩 *Arti (ID):* ${res.translation_id}\n` +
			`🇬🇧 *Arti (EN):* ${res.translation_en}\n\n` +
			`💡 *Tips:* Ketik \`${usedPrefix}${command} 1\` - \`${usedPrefix}${command} 99\` untuk nomor tertentu.`;

		await reply(caption);
		await global.react?.(client, m, '✅').catch(() => {});

	} catch (err) {
		console.error('[ASMAUL HUSNA ERROR]', err);
		await global.react?.(client, m, '❌').catch(() => {});
		return reply('❌ Terjadi kesalahan saat mengambil Asmaul Husna!');
	}
};

handler.help = ['asmaulhusna <nomor 1-99>'];
handler.tags = ['islamic'];
handler.command = ['asmaulhusna', 'asma'];
handler.limit = true;

handler.register = true;

export default handler;
