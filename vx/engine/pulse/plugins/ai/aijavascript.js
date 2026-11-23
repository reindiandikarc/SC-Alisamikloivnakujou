import https from 'node:https';
import crypto from 'node:crypto';

const BASE_URL = 'https://gemini.google.com';
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36';
const BL = 'boq_assistant-bard-web-server_20260603.11_p0';

class GeminiError extends Error {
	constructor(message, code = 'UNKNOWN') {
		super(message);
		this.name = 'GeminiError';
		this.code = code;
	}
}

function generateAtToken() {
	const random = crypto.randomBytes(16)
		.toString('base64url')
		.slice(0, 22);
	const ts = Date.now() * 1000;
	return `AOOh${random}:${ts}`;
}

function generateFSid() {
	return '-' + String(Math.floor(Math.random() * 9e18) + 1e18);
}

async function gemini(message) {
	const atToken = generateAtToken();
	const fSid = generateFSid();
	const reqid = Math.floor(Math.random() * 10000000);

	const inner = [
		[message, 0, null, null, null, null, 0],
		['id']
	];

	const outer = [null, JSON.stringify(inner)];
	const body = new URLSearchParams();

	body.append('f.req', JSON.stringify(outer));
	body.append('at', atToken);

	const payload = body.toString();
	const url = new URL(`${BASE_URL}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate`);

	url.searchParams.set('bl', BL);
	url.searchParams.set('f.sid', fSid);
	url.searchParams.set('hl', 'id');
	url.searchParams.set('_reqid', reqid);
	url.searchParams.set('rt', 'c');

	return new Promise((resolve, reject) => {
		const req = https.request(
			{
				hostname: url.hostname,
				path: url.pathname + url.search,
				method: 'POST',
				headers: {
					authority: 'gemini.google.com',
					accept: '*/*',
					'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
					origin: BASE_URL,
					referer: BASE_URL + '/',
					'user-agent': UA,
					'content-length': Buffer.byteLength(payload)
				},
				timeout: 120000
			},
			res => {
				let raw = '';

				res.on('data', chunk => {
					raw += chunk.toString();
				});

				res.on('end', () => {
					try {
						let text = '';
						const lines = raw.split('\n');

						for (const line of lines) {
							if (!line || line.startsWith(")]}'") || /^\d+$/.test(line.trim())) {
								continue;
							}

							try {
								const parsed = JSON.parse(line);
								if (Array.isArray(parsed) && parsed[0]?.[2]) {
									let data = parsed[0][2];
									try {
										data = JSON.parse(data);
										if (Array.isArray(data) && data[4]?.[0]?.[1]?.[0]) {
											text = data[4][0][1][0];
										}
									} catch {
										text = data;
									}
								}
							} catch {}
						}

						if (!text) {
							text = raw.replace(/\)]}'/g, '').trim();
						}

						resolve(text);
					} catch (e) {
						reject(new GeminiError(e.message, 'PARSE_ERROR'));
					}
				});
			}
		);

		req.on('error', err => {
			reject(new GeminiError(err.message, err.code));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new GeminiError('Request timeout', 'TIMEOUT'));
		});

		req.write(payload);
		req.end();
	});
}

const handler = async (m, { sock, text, usedPrefix, command, reply }) => {
	const input = text || (m.quoted && (m.quoted.text || m.quoted.caption));

	if (!input) {
		return reply(
			`*AI CODE GENERATOR*\n\n` +
			`*Contoh Penggunaan:*\n` +
			`• \`${usedPrefix + command} buatkan kode fungsi filter array unik\`\n` +
			`• Balas teks prompt dengan \`${usedPrefix + command}\``
		);
	}

	await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => null);

	const isHtml = /^aihtml$/i.test(command);
	const language = isHtml ? 'HTML' : 'JavaScript';
	const codeTag = isHtml ? 'html' : 'javascript';

	const prompt =
		`Buatkan kode ${language} sesuai permintaan berikut:\n\n${input.trim()}\n\n` +
		`HANYA kembalikan blok kode murni dalam format markdown code block (\`\`\`${codeTag} ... \`\`\`). ` +
		`JANGAN memberikan penjelasan teks apa pun di luar code block. ` +
		`Kode harus bersih tanpa komentar apa pun (tanpa //, /* */, atau <!-- -->).`;

	try {
		let result = await gemini(prompt);

		result = result
			.replace(/https?:\/\/googleusercontent\.com\/\S+/gi, '')
			.trim();

		const codeMatch = result.match(/```(?:html|javascript|js)?\s*([\s\S]*?)```/i);
		let code = codeMatch ? codeMatch[1].trim() : result.trim();

		code = code
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/^\s*\/\/.*$/gm, '')
			.replace(/^\s*<!--[\s\S]*?-->\s*$/gm, '')
			.replace(/^\s*<!--.*?-->\s*$/gm, '')
			.trim();

		await sock.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => null);

		const responseText = `\`\`\`${codeTag}\n${code}\n\`\`\``;

		if (typeof sock.sendButtons === 'function' && code) {
			return await sock.sendButtons(
				m.chat,
				{
					text: responseText,
					footer: `vanXone </> • ${language} Generator`,
					buttons: [
						{
							name: 'cta_copy',
							buttonParamsJson: JSON.stringify({
								display_text: 'Salin Kode',
								copy_code: code,
								id: 'copy_ai_code'
							})
						}
					]
				},
				{ quoted: m }
			);
		}

		return await reply(responseText);

	} catch (e) {
		console.error('[AI CODE GENERATOR ERROR]:', e);
		await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
		return reply(`❌ Gagal menghasilkan kode: ${e.message || e}`);
	}
};

handler.help = ['aijavascript <prompt>', 'aihtml <prompt>'];
handler.tags = ['ai'];
handler.command = ['aijavascript', 'aijs', 'aihtml'];
handler.limit = true;

export default handler;