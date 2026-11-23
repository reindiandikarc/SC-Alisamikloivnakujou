/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029VbDO8tI2phHLTSN2ed0U
 * 
 * note : don't claim this code
 */

import axios from 'axios';

const handler = async (m, { sock, conn, text, usedPrefix, command, reply }) => {
	const client = sock || conn;
	const nama = text?.trim();

	if (!nama) {
		return reply(`Gunakan format:\n*${usedPrefix}${command} <nama nabi>*\n\nContoh:\n*${usedPrefix}${command} adam*\n*${usedPrefix}${command} muhammad*`);
	}

	try {
		await global.react?.(client, m, '🕒').catch(() => {});

		const apiUrl = global.API('kyzz', '/api/islamic/kisah-nabi', { nama }, 'apikey');
		const { data } = await axios.get(apiUrl, { timeout: 15000 });

		if (!data?.status || !data?.result) {
			await global.react?.(client, m, '❌').catch(() => {});
			return reply(`❌ Kisah nabi *${nama}* tidak ditemukan.`);
		}

		const res = data.result;
		let desc = res.description || '';
		if (desc.length > 3000) {
			desc = desc.substring(0, 3000) + '...\n\n_(Kisah dipotong karena terlalu panjang)_';
		}

		const caption = `📜 *KISAH ${res.name.toUpperCase()}*\n\n` +
			`👶 *Kelahiran:* ${res.thn_kelahiran || '-'}\n` +
			`⏳ *Usia:* ${res.usia || '-'} tahun\n` +
			`📍 *Tempat:* ${res.tmp || '-'}\n\n` +
			`📖 *Kisah:*\n${desc}`;

		if (res.image_url && /^https?:\/\//i.test(res.image_url)) {
			await client.sendMessage(m.chat, {
				image: { url: res.image_url },
				caption
			}, { quoted: m }).catch(async () => {
				await reply(caption);
			});
		} else {
			await reply(caption);
		}

		await global.react?.(client, m, '✅').catch(() => {});

	} catch (err) {
		console.error('[KISAH NABI ERROR]', err);
		await global.react?.(client, m, '❌').catch(() => {});
		return reply('❌ Terjadi kesalahan saat mengambil Kisah Nabi!');
	}
};

handler.help = ['kisahnabi <nama nabi>'];
handler.tags = ['islamic'];
handler.command = ['kisahnabi', 'nabi'];
handler.limit = true;

handler.register = true;

export default handler;
