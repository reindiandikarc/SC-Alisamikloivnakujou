async function uploadUguu(buffer) {
	const formData = new FormData();
	formData.append('files[]', new Blob([buffer]), 'upload.jpg');

	const res = await fetch('https://uguu.se/upload.php', {
		method: 'POST',
		body: formData
	});
	const json = await res.json();
	return json.files[0]?.url;
}

const handler = async (m, { sock, text, prefix, command, reply }) => {
	const p = prefix || '.';
	const q = m.quoted ? m.quoted : m;
	const mime = (q.msg || q).mimetype || '';
	const input = text || (m.quoted && (m.quoted.text || m.quoted.caption));

	if (!input && !/image/.test(mime)) {
		return reply(
			'✨ *IPHONE QUOTED CHAT (V2)*\n\n' +
			'Kirim atau balas gambar disertai teks.\n\n' +
			'*Format Penggunaan:*\n' +
			`• \`${p + command} <teks>\` (dengan/reply gambar)\n\n` +
			'*Contoh:*\n' +
			`• \`${p + command} Halo cihuyy\``
		);
	}

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => null);

	try {
		let imageUrl = '';
		if (/image/.test(mime)) {
			const media = await q.download();
			imageUrl = await uploadUguu(media);
		}

		// Siapkan waktu saat ini (HH.mm)
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const currentTime = `${hours}.${minutes}`;

		const payload = {
			sender: 'other',
			message: input ? input.trim() : ' ',
			imageUrl,
			timestamp: currentTime,
			time: currentTime,
			status: {
				carrierName: 'INDOSAT',
				batteryPercentage: 88,
				signalStrength: 4,
				wifi: true
			},
			backgroundUrl: '',
			readStatus: true,
			emojiStyle: 'apple'
		};

		// Panggil via helper central di settings.js dengan responseType arraybuffer
		const resData = await global.postApi('siputzx', '/v2/iphone-quoted', payload, {
			responseType: 'arraybuffer'
		});

		const imageBuffer = Buffer.from(resData);

		// Kirim langsung gambarnya dari buffer
		await sock.sendMessage(
			m.chat,
			{
				image: imageBuffer,
				caption: '✨ *IPhone Quoted Chat V2*'
			},
			{ quoted: m }
		);

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => null);

	} catch (e) {
		console.error('[IQCV2 ERROR]:', e);
		await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
		return reply(`❌ Gagal memproses gambar: ${e.message || e}`);
	}
};

handler.help = ['iqcv2 <teks>'];
handler.tags = ['maker'];
handler.command = ['iqcv2'];
handler.limit = true;

export default handler;