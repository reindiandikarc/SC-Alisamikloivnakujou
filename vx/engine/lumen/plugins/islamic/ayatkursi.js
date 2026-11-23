/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

const handler = async (m, { sock, conn, reply }) => {
	const client = sock || conn;

	try {
		await global.react?.(client, m, '🕒').catch(() => {});

		const apiUrl = global.API('kyzz', '/api/islamic/ayat-kursi', {}, 'apikey');
		const { data } = await axios.get(apiUrl, { timeout: 15000 });

		if (!data?.status || !data?.result) {
			await global.react?.(client, m, '❌').catch(() => {});
			return reply('❌ Gagal mengambil data Ayat Kursi.');
		}

		const res = data.result;
		const caption = `🕋 *AYAT KURSI*\n` +
			`📜 *Surah:* ${res.surah} (Ayat ${res.ayat})\n\n` +
			`📖 *Arab:*\n${res.arabic}\n\n` +
			`🔤 *Latin:*\n${res.latin}\n\n` +
			`🇮🇩 *Terjemahan:*\n${res.translation_id}`;

		await reply(caption);
		await global.react?.(client, m, '✅').catch(() => {});

	} catch (err) {
		console.error('[AYAT KURSI ERROR]', err);
		await global.react?.(client, m, '❌').catch(() => {});
		return reply('❌ Terjadi kesalahan saat mengambil Ayat Kursi!');
	}
};

handler.help = ['ayatkursi'];
handler.tags = ['islamic'];
handler.command = ['ayatkursi', 'akursi'];
handler.limit = true;

handler.register = true;

export default handler;
