const handler = async (m, { sock, args, text, reply, example }) => {
	const rawUrl = args[0] || (m.quoted ? (m.quoted.text || '') : text);

	if (!rawUrl) {
		return reply(
			`🔓 *BYPASS SAFELINKU* 🎀\n\n` +
			`Masukkan link Safelinku yang ingin di-bypass!\n\n` +
			`• 📌 *ᴄᴏɴᴛᴏʜ:* ${example('https://safelinku.com/xxxx')}`
		);
	}

	const match = rawUrl.match(/https?:\/\/[^\s]+/i);
	const targetUrl = match ? match[0] : (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const res = await global.fetchApi('kyzz', '/api/bypass/safelinku', {
			url: targetUrl
		}, { timeout: 30000 });

		if (!res || !res.status) {
			await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
			return reply(`❌ Gagal bypass Safelinku: ${res?.message || 'Link tidak valid atau expired.'}`);
		}

		const result = res.result || res.data || res;
		const resultUrl = typeof result === 'string' ? result : (result.url || result.destinationUrl || result.destination || result.link || result.result || '-');

		let caption = `🔓 *SAFELINKU BYPASS RESULT*\n\n`;
		caption += `🔗 *Original:* ${targetUrl}\n`;
		caption += `🎯 *Result:* ${resultUrl}\n\n`;
		caption += `© ${global.namaBot || 'Elysia Ai'}`;

		await reply(caption.trim());
		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
	} catch (e) {
		console.error('[SAFELINKU ERROR]', e.response?.data || e.message);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		return reply(`❌ Terjadi kesalahan: ${e.response?.data?.message || e.message}`);
	}
};

handler.help = ['safelinku <url>'];
handler.tags = ['tools'];
handler.command = ['safelinku'];
handler.limit = true;

export default handler;