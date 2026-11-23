const handler = async (m, { sock, args, text, reply, example }) => {
	const rawUrl = args[0] || (m.quoted ? (m.quoted.text || '') : text);

	if (!rawUrl) {
		return reply(
			`🔓 *BYPASS SHORTLINK* 🎀\n\n` +
			`Masukkan link yang ingin di-bypass!\n\n` +
			`• 📌 *ᴄᴏɴᴛᴏʜ:* ${example('https://example.link/xxxx')}`
		);
	}

	const match = rawUrl.match(/https?:\/\/[^\s]+/i);
	const targetUrl = match ? match[0] : (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const res = await global.fetchApi('kyzz', '/api/bypass/bypass', {
			url: targetUrl
		}, { timeout: 30000 });

		if (!res || !res.status) {
			await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
			return reply(`❌ Gagal bypass link: ${res?.message || 'Link tidak dapat diproses.'}`);
		}

		const result = res.result || res.data || res;
		const resultUrl = typeof result === 'string' ? result : (result.url || result.destinationUrl || result.destination || result.link || result.result || '-');

		let caption = `🔓 *BYPASS RESULT*\n\n`;
		caption += `🔗 *Original:* ${targetUrl}\n`;
		caption += `🎯 *Result:* ${resultUrl}\n\n`;
		caption += `© ${global.namaBot}`;

		await reply(caption.trim());
		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
	} catch (e) {
		console.error('[BYPASS ERROR]', e.response?.data || e.message);
		await sock.sendMessage(m.chat, { react: { text: '⚠', key: m.key } });
		return reply(`❌ Terjadi kesalahan: ${e.response?.data?.message || e.message}`);
	}
};

handler.help = ['bypass <url>'];
handler.tags = ['bypass'];
handler.command = ['bypass'];
handler.limit = true;

export default handler;