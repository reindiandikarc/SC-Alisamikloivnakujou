// Plugin: qc / quotly / quotechat / xquote
// Commands: qc, quotly, quotechat, xquote
// Exact logic dari Alya V10 — primary: brat.siputzx.my.id/quoted

'use strict';

const FormData   = require('form-data');
const { fromBuffer } = require('file-type');

module.exports = {
  command: ['qc', 'quotly', 'quotechat', 'xquote'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      prefix, command,
      sender, from, pushname,
      text, q,
      reply, replyalya,
    } = ctx;

    const teks = (text || q || '').trim();
    if (!teks) return reply('Teksnya mana?');
    if (teks.length > 10000) return reply('Maximal 10000 karakter!');

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    // Fungsi hapus emoji dari teks
    function removeEmojis(str) {
      return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF])/g, '');
    }

    // Upload ke catbox.moe
    async function uploadCatbox(buffer) {
      try {
        const form = new FormData();
        const { ext } = await fromBuffer(buffer);
        form.append('fileToUpload', buffer, 'file.' + ext);
        form.append('reqtype', 'fileupload');
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
          headers: form.getHeaders(),
        });
        if (res.data && res.data.startsWith('https://')) return res.data;
        return null;
      } catch {
        return null;
      }
    }

    try {
      const defaultProfile = 'https://raw.githubusercontent.com/RyuuAkbarID/media/refs/heads/main/kontak.jpg';
      let finalUrl = defaultProfile;

      // Coba ambil foto profil user
      try {
        const profilePic = await alya.profilePictureUrl(sender, 'image');
        if (profilePic && !profilePic.includes('undefined')) {
          const profileBuffer = await getBuffer(profilePic);
          const uploaded = await uploadCatbox(profileBuffer);
          if (uploaded) finalUrl = uploaded;
        }
      } catch {
        // kalau gagal ambil profil, biarkan pakai defaultProfile
      }

      // Bersihkan nama user dari emoji
      let cleanName = removeEmojis(pushname || '').trim() || 'User';

      // Payload API brat (primary — sama persis V10)
      const payload = {
        messages: [
          {
            from: {
              id: 1,
              first_name: cleanName,
              last_name: '',
              name: cleanName,
              photo: { url: finalUrl },
            },
            text: teks,
            entities: [],
            avatar: true,
            media: { url: '' },
            mediaType: '',
            replyMessage: {
              name: '',
              text: '',
              entities: [],
              chatId: 1,
            },
          },
        ],
        backgroundColor: '#292232',
        width: 512,
        height: 512,
        scale: 2,
        type: 'quote',
        format: 'png',
        emojiStyle: 'apple',
      };

      // Kirim ke API brat (primary)
      const res = await axios.post('https://brat.siputzx.my.id/quoted', payload, {
        responseType: 'arraybuffer',
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      });

      // Kirim hasil sebagai stiker
      await alya.sendImageAsSticker(from, res.data, m, {
        packname: global.botname || 'Alya Bot',
        author: global.botname || 'Alya Bot',
      });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[qc]', err);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply('❌ Gagal membuat quote.');
    }
  },
};
