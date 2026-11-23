const handler = async (m, { sock, reply }) => {
	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const baseUrl = global.APIs?.kyzz;
		const apiKey = global.APIKeys?.[baseUrl] || global.APIKeys?.kyzz;
		const fallbackUrl = `${baseUrl}/api/asupan/notnot?apikey=${apiKey}`;

		const data = await global.fetchApi('kyzz', '/api/asupan/notnot').catch(() => null);

		let mediaUrl = fallbackUrl;
		if (data) {
			if (typeof data === 'string' && data.startsWith('http')) {
				mediaUrl = data;
			} else if (data.url) {
				mediaUrl = data.url;
			} else if (data.result) {
				mediaUrl = typeof data.result === 'string' ? data.result : (data.result.url || data.result.link);
			}
		}

		try {
			await sock.sendMessage(m.chat, {
				video: { url: mediaUrl },
				caption: `🎥 *Asupan Notnot*\n\n© ${global.namaBot}`,
				mimetype: 'video/mp4'
			}, { quoted: m });
		} catch {
			await sock.sendMessage(m.chat, {
				image: { url: mediaUrl },
				caption: `📸 *Asupan Notnot*\n\n© ${global.namaBot}`
			}, { quoted: m });
		}

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

	} catch (e) {
		console.error('[ASUPAN NOTNOT ERROR]', e);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		return reply('❌ Gagal mengambil asupan Notnot.');
	}
};

handler.help = ['notnot'];
handler.tags = ['asupan'];
handler.command = ['notnot'];
handler.limit = true;

export default handler;