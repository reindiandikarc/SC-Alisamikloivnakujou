import axios from 'axios';
import FormData from 'form-data';

async function uploadUguu(buffer, filename = 'image.jpg') {
  const form = new FormData();
  form.append('files[]', buffer, { filename, contentType: 'image/jpeg' });
  const { data } = await axios.post('https://uguu.se/upload', form, { headers: { ...form.getHeaders() } });
  return data?.files?.[0]?.url || null;
}

const PROMPT = "Create a picture taken with a polaroid camera. Make it look like a 3-grid photobooth composition. The photo should appear natural and casual, without any strong props or clear subject focus. Add a soft blur and consistent lighting effect, resembling a flash in a dark room. Do not alter the face of the person in the original image. Replace the background with a white curtain. In the photo, the girl should be gently holding the yellow dinosaur’s cheek, and the yellow dinosaur should be holding the girl’s head affectionately. Add another cute and playful pose in one of the frames to complete the photobooth style. The overall aesthetic should look authentic, warm, and slightly vintage, like a real polaroid photo.";

const handler = async (m, { sock, qmsg, mime, reply, usedPrefix, command }) => {
  if (!/^image\//.test(mime || '')) {
    return reply(`❌ Reply ke *gambar* atau kirim gambar dengan caption *${usedPrefix + command}*`);
  }

  await sock.sendMessage(m.chat, { react: { text: '🦖', key: m.key } }).catch(() => null);

  try {
    const buffer = await qmsg.download().catch(() => null);
    if (!buffer) return reply('❌ Gagal mengunduh gambar!');

    const uguuUrl = await uploadUguu(buffer, `todino-${Date.now()}.jpg`);
    if (!uguuUrl) return reply('❌ Gagal mengunggah gambar ke server!');

    const apiUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(uguuUrl)}&prompt=${encodeURIComponent(PROMPT)}`;
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 });
    const resultBuffer = Buffer.from(response.data);

    await sock.sendMessage(m.chat, { image: resultBuffer, caption: '📸 *success*' }, { quoted: m });
    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => null);

  } catch (e) {
    console.error('[TODINO ERROR]:', e);
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
    reply('❌ Error: ' + (e.message || e));
  }
};

handler.help = ['todino (reply gambar)'];
handler.tags = ['maker', 'ai'];
handler.command = ['todino'];
handler.limit = true;

export default handler;