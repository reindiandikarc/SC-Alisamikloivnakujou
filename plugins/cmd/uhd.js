// Plugin: uhd
// Commands: uhd
// Meningkatkan kualitas gambar via catbox + api-faa.my.id

'use strict';

const fs       = require('fs');
const axios    = require('axios');
const FormData = require('form-data');

module.exports = {
  command: ['uhd'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { command, prefix, quoted, mime, replyalya } = ctx;

    // FIX: mime dari ctx sudah = (quoted || m).mimetype, jadi cukup cek mime
    if (!quoted || !/image/.test(mime)) {
      return replyalya(
        `📸 Kirim lalu reply gambar dengan caption *${prefix + command}* untuk meningkatkan kualitas.`
      );
    }

    const biaya    = 4;
    const userData = global.db.users[m.sender];
    const limitUser = userData?.limit || 0;

    if (limitUser < biaya) {
      return replyalya(
        `❌ Limit kamu tidak cukup!\n\n` +
        `💳 Limit dibutuhkan : ${biaya}\n` +
        `📊 Limit kamu       : ${limitUser}`
      );
    }

    alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    let mediaPath = null;
    try {
      // FIX: gunakan 'quoted' (message object), bukan './temp/' sebagai message
      mediaPath = await alya.downloadAndSaveMediaMessage(quoted);

      let form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(mediaPath));

      let upload = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        { headers: form.getHeaders() }
      );

      let fileUrl = upload.data?.trim();
      if (!fileUrl || !fileUrl.startsWith('https://')) {
        return replyalya('❌ Upload gambar gagal!');
      }

      let apiUrl = `https://api-faa.my.id/faa/hdv3?image=${encodeURIComponent(fileUrl)}`;
      let res    = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      userData.limit -= biaya;

      await alya.sendMessage(
        m.chat,
        {
          image  : Buffer.from(res.data),
          caption:
            `✅ *Kualitas gambar berhasil ditingkatkan.*\n\n` +
            `💳 Limit terpakai : ${biaya}\n` +
            `📊 Sisa limit     : ${userData.limit}`,
        },
        { quoted: m }
      );

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[uhd]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Terjadi kesalahan saat memproses gambar UHD!');
    } finally {
      try { if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath); } catch {}
    }
  },
};
