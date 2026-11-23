/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

const handler = async (m, { sock, conn, text, usedPrefix, command, reply }) => {
	const client = sock || conn;
	const query = text?.trim();

	if (!query) {
		return reply(`Gunakan format:\n*${usedPrefix}${command} <kata kunci>*\n\nContoh:\n*${usedPrefix}${command} sabar*`);
	}

	try {
		await global.react?.(client, m, '🕒').catch(() => {});

		const apiUrl = global.API('kyzz', '/api/islamic/tafsir', { query }, 'apikey');
		const { data } = await axios.get(apiUrl, { timeout: 15000 });

		if (!data?.status || !Array.isArray(data?.result) || data.result.length === 0) {
			await global.react?.(client, m, '❌').catch(() => {});
			return reply(`❌ Tafsir dengan kata kunci *"${query}"* tidak ditemukan.`);
		}

		let txt = `📖 *TAFSIR AL-QUR'AN*\n🔍 *Kata Kunci:* ${query}\n📊 *Total:* ${data.count || data.result.length} hasil\n\n`;

		data.result.forEach((item, i) => {
			let t = item.tafsir || '';
			if (t.length > 700) {
				t = t.substring(0, 700) + '...';
			}
			txt += `*${i + 1}. Surah ${item.surah} (Ayat ${item.nomorAyat})*\n${t}\n\n───────────────────\n\n`;
		});

		await reply(txt.trim());
		await global.react?.(client, m, '✅').catch(() => {});

	} catch (err) {
		console.error('[TAFSIR ERROR]', err);
		await global.react?.(client, m, '❌').catch(() => {});
		return reply('❌ Terjadi kesalahan saat mencari Tafsir!');
	}
};

handler.help = ['tafsir <kata kunci>'];
handler.tags = ['islamic'];
handler.command = ['tafsir'];
handler.limit = true;

handler.register = true;

export default handler;
