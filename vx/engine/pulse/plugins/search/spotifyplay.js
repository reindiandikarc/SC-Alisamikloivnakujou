import axios from 'axios';

function formatNumber(num) {
	return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-';
}

const handler = async (m, { sock, text, prefix, command, reply }) => {
	const p = prefix || '.';
	const botName = global.namaBot;
	const input = text || (m.quoted && (m.quoted.text || m.quoted.caption));

	if (!input) {
		return reply(
			'🎵 *SPOTIFY PLAY*\n\n' +
			'Format Penggunaan:\n' +
			`• \`${p + command} <judul lagu / artis>\`\n\n` +
			'Contoh:\n' +
			`• \`${p + command} Payung Teduh Mari Bercerita\``
		);
	}

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => null);

	try {
		const data = await global.fetchApi('nexray', '/downloader/spotifyplay', { q: input.trim() });

		if (!data?.status || !data?.result) {
			await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
			return reply('❌ Lagu tidak ditemukan!');
		}

		const v = data.result;
		const caption = [
			'🎵 *SPOTIFY PLAY*',
			'─────────────────────────',
			'',
			`• 📌 *Judul:* ${v.title || '-'}`,
			`• 👤 *Artis:* ${v.artist || '-'}`,
			`• 💿 *Album:* ${v.album || '-'}`,
			`• ⏱️ *Durasi:* ${v.duration || '-'}`,
			`• 🔥 *Popularitas:* ${formatNumber(v.popularity)}`,
			`• 📅 *Rilis:* ${v.release_at || '-'}`,
			'',
			'Sedang mengirim berkas audio, mohon tunggu...',
			'',
			`© ${botName}`
		].join('\n');

		if (v.thumbnail) {
			await sock.sendMessage(m.chat, { image: { url: v.thumbnail }, caption }, { quoted: m });
		} else {
			await reply(caption);
		}

		let sizeMB = 0;
		try {
			const head = await axios.head(v.download_url, { timeout: 15000 });
			const size = Number(head.headers['content-length'] || 0);
			sizeMB = size / 1024 / 1024;
		} catch (_) {}

		const cleanTitle = (v.title || 'Spotify Audio').replace(/[/\\?%*:|"<>]/g, '');

		if (sizeMB > 50) {
			await sock.sendMessage(
				m.chat,
				{
					document: { url: v.download_url },
					mimetype: 'audio/mpeg',
					fileName: `${cleanTitle}.mp3`
				},
				{ quoted: m }
			);
		} else {
			await sock.sendMessage(
				m.chat,
				{
					audio: { url: v.download_url },
					mimetype: 'audio/mpeg',
					fileName: `${cleanTitle}.mp3`
				},
				{ quoted: m }
			);
		}

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => null);

	} catch (e) {
		console.error('[SPOTIFYPLAY ERROR]:', e);
		await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
		return reply(`❌ Gagal mengambil lagu: ${e.message || e}`);
	}
};

handler.help = ['spotifyplay <judul>', 'spplay <judul>'];
handler.tags = ['download'];
handler.command = ['spotifyplay', 'splay'];
handler.limit = true;

export default handler;