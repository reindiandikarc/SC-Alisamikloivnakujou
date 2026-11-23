import axios from 'axios';
import FormData from 'form-data';

async function uploadUguu(buffer, filename = 'image.jpg') {
  const form = new FormData();
  form.append('files[]', buffer, { filename, contentType: 'image/jpeg' });
  const { data } = await axios.post('https://uguu.se/upload', form, { headers: { ...form.getHeaders() } });
  return data?.files?.[0]?.url || null;
}

const handler = async (m, { sock, qmsg, mime, reply, usedPrefix, command }) => {
  if (!/^image\//.test(mime || '')) {
    return reply(`❌ Reply atau kirim gambar dengan perintah *${usedPrefix + command}*`);
  }

  await sock.sendMessage(m.chat, { react: { text: '🕒', key: m.key } }).catch(() => null);

  try {
    const buffer = await qmsg.download().catch(() => null);
    if (!buffer) return reply('❌ Gagal mengunduh gambar!');

    const uguuUrl = await uploadUguu(buffer, `${command}-${Date.now()}.jpg`);
    if (!uguuUrl) return reply('❌ Gagal mengunggah gambar ke Uguu!');

    const apiUrl = `https://api-faa.my.id/faa/tomonyet?url=${encodeURIComponent(uguuUrl)}`;
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 });
    const resultBuffer = Buffer.from(response.data);

    await sock.sendMessage(m.chat, { image: resultBuffer, caption: '✅ Done' }, { quoted: m });
    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => null);

  } catch (e) {
    console.error('[TOMONYET ERROR]:', e);
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
    reply('❌ Gagal memproses gambar!');
  }
};

handler.help = ['tomonyet (reply gambar)'];
handler.tags = ['maker'];
handler.command = ['tomonyet'];
handler.limit = true;

export default handler;