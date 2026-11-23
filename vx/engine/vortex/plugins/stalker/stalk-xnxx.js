module.exports = async function (__naren_imp, __naren_meta) {

const __ni_0 = await __naren_imp("axios"); const axios = __ni_0.default;
/**
 * Creator : Kyuu 
 * Ch : https://whatsapp.com/channel/0029Vb94x5OI1rcrIGfUza2Y
 * 
 * note : don't claim this code
 */



let handler = async (m, { conn, sock, text, usedPrefix, command, reply }) => {
	const client = conn || sock;
	const doReply = typeof reply === 'function' ? reply : typeof m.reply === 'function' ? m.reply.bind(m) : (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m });

	if (!text) return doReply(`🔍 *Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} sweetie_fox_official`);

	try {
		if (typeof global.react === 'function') await global.react(client, m, 'loading');
		const url = global.API('kyzz', '/api/stalker/xnxx', { username: text.trim() }, 'apikey');
		const { data } = await axios.get(url, { timeout: 15000 });
		if (!data?.status || !data?.result) return doReply(`❌ Profile XNXX "${text}" tidak ditemukan.`);

		const r = data.result;
		let cap = `🔞 *XNXX STALKER*\n\n`;
		cap += `• *Nama/Model:* ${r.name || r.username || text}\n`;
		if (r.subscribers) cap += `• *Subscribers:* ${r.subscribers}\n`;
		if (r.views) cap += `• *Total Views:* ${r.views}\n`;
		if (r.rank) cap += `• *Rank:* ${r.rank}\n`;
		if (r.bio) cap += `• *Bio:* ${r.bio}\n`;

		const img = r.avatar || r.image;
		if (img) {
			await client.sendMessage(m.chat, { image: { url: img }, caption: cap.trim() }, { quoted: m });
		} else {
			await doReply(cap.trim());
		}
		if (typeof global.react === 'function') await global.react(client, m, 'success');
	} catch (e) {
		console.error('[STALK-XNXX]', e.response?.data || e);
		if (typeof global.react === 'function') await global.react(client, m, 'error');
		doReply(`❌ Gagal stalk XNXX: ${e.response?.data?.error || e.message}`);
	}
};

handler.help = ['stalkxnxx <username>'];
handler.tags = ['stalker'];
handler.command = /^(stalkxnxx|xnxxstalk)$/i;
handler.limit = true;
handler.register = true;
const __naren_default = handler;;

;return { default: __naren_default };
}
