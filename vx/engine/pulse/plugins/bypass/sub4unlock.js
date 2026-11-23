const handler = async (m, { sock, args, text, reply, example }) => {
	const rawUrl = args[0] || (m.quoted ? (m.quoted.text || '') : text);

	if (!rawUrl) {
		return reply(
			`🔓 *BYPASS SUB4UNLOCK* 🎀\n\n` +
			`Masukkan link Sub4Unlock yang ingin di-bypass!\n\n` +
			`• 📌 *ᴄᴏɴᴛᴏʜ:* ${example('https://sub4unlock.io/xxxx')}`
		);
	}

	const match = rawUrl.match(/https?:\/\/[^\s]+/i);
	const targetUrl = match ? match[0] : (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const res = await global.fetchApi('kyzz', '/api/bypass/sub4unlock', {
			url: targetUrl
		}, { timeout: 30000 });

		if (!res || !res.status) {
			await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
			return reply(`❌ Gagal bypass Sub4Unlock: ${res?.message || 'Link tidak valid atau expired.'}`);
		}

		const result = res.result || res.data || res;
		const resultUrl = typeof result === 'string' ? result : (result.url || result.destinationUrl || result.destination || result.link || result.result || '-');

		let caption = `🔓 *SUB4UNLOCK BYPASS RESULT*\n\n`;
		caption += `🔗 *Original:* ${targetUrl}\n`;
		caption += `🎯 *Result:* ${resultUrl}\n\n`;
		caption += `© ${global.namaBot}`;

		await reply(caption.trim());
		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
	} catch (e) {
		console.error('[SUB4UNLOCK ERROR]', e.response?.data || e.message);
		await sock.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
		return reply(`❌ Terjadi kesalahan: ${e.response?.data?.message || e.message}`);
	}
};

handler.help = ['sub4unlock <url>'];
handler.tags = ['tools'];
handler.command = ['sub4unlock'];
handler.limit = true;

export default handler;