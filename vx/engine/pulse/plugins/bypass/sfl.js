const handler = async (m, { sock, args, text, reply, example }) => {
	const rawUrl = args[0] || (m.quoted ? (m.quoted.text || '') : text);

	if (!rawUrl) {
		return reply(
			`🔓 *SFL LINK BYPASS* 🎀\n\n` +
			`Masukkan link SFL yang ingin di-bypass!\n\n` +
			`• 📌 *ᴄᴏɴᴛᴏʜ:* ${example('https://sfl.gl/xxxx')}`
		);
	}

	const matchUrl = rawUrl.match(/https?:\/\/[^\s]+/i);
	const targetUrl = matchUrl ? matchUrl[0] : (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const data = await global.fetchApi('kyzz', '/api/bypass/sfl', {
			url: targetUrl
		}, { timeout: 30000 });

		if (!data?.status || !data?.result) {
			await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
			return reply('❌ Gagal melakukan bypass link SFL. Pastikan link valid.');
		}

		const { originalUrl, destinationUrl } = data.result;

		let caption = `🔓 *SFL LINK BYPASS*\n\n`;
		caption += `🔗 *Original:* ${originalUrl || targetUrl}\n`;
		caption += `🎯 *Destination:* ${destinationUrl || '-'}\n\n`;
		caption += `© ${global.namaBot}`;

		await reply(caption.trim());
		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

	} catch (e) {
		console.error('[SFL BYPASS ERROR]', e.response?.data || e.message);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		return reply('❌ Terjadi kesalahan saat menghubungi server bypass.');
	}
};

handler.help = ['sfl <url>', 'bypasssfl <url>'];
handler.tags = ['tools'];
handler.command = ['sfl', 'bypasssfl', 'sflbypass'];
handler.limit = true;

export default handler;