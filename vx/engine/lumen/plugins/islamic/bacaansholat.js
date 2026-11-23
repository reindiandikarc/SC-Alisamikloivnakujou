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

		const apiUrl = global.API('kyzz', '/api/islamic/bacaan-sholat', {}, 'apikey');
		const { data } = await axios.get(apiUrl, { timeout: 15000 });

		if (!data?.status || !Array.isArray(data?.result)) {
			await global.react?.(client, m, '❌').catch(() => {});
			return reply('❌ Gagal mengambil data Bacaan Sholat.');
		}

		let txt = `🕌 *BACAAN SHOLAT LENGKAP*\n\n`;
		data.result.forEach((item, i) => {
			txt += `*${i + 1}. ${item.nama}*\n`;
			if (item.arabic) txt += `📖 ${item.arabic}\n`;
			if (item.latin) txt += `🔤 _${item.latin}_\n`;
			if (item.terjemahan) txt += `🇮🇩 ${item.terjemahan}\n`;
			txt += `\n───────────────────\n\n`;
		});

		await reply(txt.trim());
		await global.react?.(client, m, '✅').catch(() => {});

	} catch (err) {
		console.error('[BACAAN SHOLAT ERROR]', err);
		await global.react?.(client, m, '❌').catch(() => {});
		return reply('❌ Terjadi kesalahan saat mengambil Bacaan Sholat!');
	}
};

handler.help = ['bacaansholat'];
handler.tags = ['islamic'];
handler.command = ['bacaansholat', 'bacaansolat'];
handler.limit = true;

handler.register = true;

export default handler;
