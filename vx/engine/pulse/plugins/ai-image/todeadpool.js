import axios from 'axios';
import FormData from 'form-data';

async function uploadUguu(buffer, filename = 'image.jpg') {
  const form = new FormData();
  form.append('files[]', buffer, { filename, contentType: 'image/jpeg' });
  const { data } = await axios.post('https://uguu.se/upload', form, { headers: { ...form.getHeaders() } });
  return data?.files?.[0]?.url || null;
}

const PROMPT = 'transform into Deadpool, wearing red and black suit, katana swords, fourth-wall breaking pose, Marvel anti-hero style, while keeping the same original face and only changing the outfit';

const handler = async (m, { sock, qmsg, mime, reply, usedPrefix, command }) => {
  if (!/^image\//.test(mime || '')) return reply(`❌ Reply/kirim gambar dengan caption *${usedPrefix + command}*`);

  await sock.sendMessage(m.chat, { react: { text: '⚔️', key: m.key } }).catch(() => null);

  try {
    const buffer = await qmsg.download().catch(() => null);
    if (!buffer) return reply('❌ Gagal mengunduh gambar!');

    const uguuUrl = await uploadUguu(buffer, `${command}-${Date.now()}.jpg`);
    if (!uguuUrl) return reply('❌ Gagal upload gambar ke Uguu!');

    const apiUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(uguuUrl)}&prompt=${encodeURIComponent(PROMPT)}`;
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 });

    await sock.sendMessage(m.chat, { image: Buffer.from(response.data), caption: '✅ Done' }, { quoted: m });
    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => null);
  } catch (e) {
    console.error(`[${command.toUpperCase()} ERROR]:`, e);
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => null);
    reply('❌ Gagal memproses gambar pada API Edit Foto!');
  }
};

handler.help = ['todeadpool (reply foto)'];
handler.tags = ['maker', 'ai'];
handler.command = ['todeadpool'];
handler.limit = true;

export default handler;