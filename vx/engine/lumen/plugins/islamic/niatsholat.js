/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

const handler = async (m, { sock, conn, text, usedPrefix, command, reply }) => {
	const client = sock || conn;
	let waktu = text?.trim().toLowerCase() || 'subuh';

	if (waktu === 'isya' || waktu === "isya'") waktu = 'isha';

	try {
		await global.react?.(client, m, '🕒').catch(() => {});

		const apiUrl = global.API('kyzz', '/api/islamic/niat-sholat', { waktu }, 'apikey');
		const { data } = await axios.get(apiUrl, { timeout: 15000 });

		if (!data?.status || !data?.result) {
			await global.react?.(client, m, '❌').catch(() => {});
			return reply(`❌ Niat sholat untuk waktu *${waktu}* tidak ditemukan.\nPilihan waktu: subuh, dzuhur, ashar, maghrib, isha.`);
		}

		const res = data.result;
		const caption = `🕌 *NIAT SHOLAT ${res.waktu.toUpperCase()}*\n\n` +
			`📖 *Arab:*\n${res.arabic}\n\n` +
			`🔤 *Latin:*\n${res.latin}\n\n` +
			`🇮🇩 *Terjemahan:*\n${res.translation_id}\n\n` +
			`💡 *Pilihan Waktu:* subuh, dzuhur, ashar, maghrib, isha`;

		await reply(caption);
		await global.react?.(client, m, '✅').catch(() => {});

	} catch (err) {
		console.error('[NIAT SHOLAT ERROR]', err);
		await global.react?.(client, m, '❌').catch(() => {});
		return reply('❌ Terjadi kesalahan saat mengambil Niat Sholat!');
	}
};

handler.help = ['niatsholat <waktu>'];
handler.tags = ['islamic'];
handler.command = ['niatsholat', 'niatsolat'];
handler.limit = true;

handler.register = true;

export default handler;
