// ============================================================
//  Plugin: nanobanana.js
//  Fungsi : AI Image Editing via Nano Banana (api-nanzz.my.id)
//  Author : Alya Bot V20
//  CMD    : .nanobanana / .nbana / .aiedit
//  FIX    : Converted from old-style fn export → {command, run}
//           conn → alya
// ============================================================

'use strict'

const FormData = require('form-data');
const axios = require('axios');

const API_URL = 'https://api-nanzz.my.id/docs/api/ai-image/nanobanana-edit.php';

// ── Helper: download buffer dari URL ──────────────────────────
async function getBufferFromUrl(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(res.data);
}

// ── Helper: coba POST dengan berbagai format ──────────────────
async function tryNanobanana(prompt, imageUrl) {
  const errors = [];

  try {
    const res = await axios.post(API_URL, { prompt, image: imageUrl }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });
    if (res.data?.status && (res.data?.result || res.data?.image || res.data?.url)) return res.data;
    errors.push(`JSON: ${res.data?.message || 'no result'}`);
  } catch (e) { errors.push(`JSON: ${e.message}`); }

  try {
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('image', imageUrl);
    const res = await axios.post(API_URL, form, { headers: form.getHeaders(), timeout: 60000 });
    if (res.data?.status && (res.data?.result || res.data?.image || res.data?.url)) return res.data;
    errors.push(`FormData URL: ${res.data?.message || 'no result'}`);
  } catch (e) { errors.push(`FormData URL: ${e.message}`); }

  try {
    const imgBuffer = await getBufferFromUrl(imageUrl);
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('image', imgBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    form.append('url', imageUrl);
    const res = await axios.post(API_URL, form, { headers: form.getHeaders(), timeout: 90000 });
    if (res.data?.status && (res.data?.result || res.data?.image || res.data?.url)) return res.data;
    errors.push(`FormData Buffer: ${res.data?.message || 'no result'}`);
  } catch (e) { errors.push(`FormData Buffer: ${e.message}`); }

  throw new Error(`Semua percobaan gagal:\n${errors.join('\n')}`);
}

module.exports = {
  command: ['nanobanana', 'nbana', 'aiedit'],
  tags: ['ai'],
  help: ['nanobanana <prompt> (reply gambar)'],
  owner: false,
  admin: false,
  group: false,
  private: false,
  premium: false,
  limit: true,
  register: false,

  run: async (alya, m, ctx) => {
    const {
      args, reply,
      isQuotedImage, isImage,
      quoted, prefix, command,
      getBuffer, mime
    } = ctx;

    const hasImage = isImage || isQuotedImage;
    if (!hasImage) {
      return reply(
        `╭━━━[ 🍌 NANO BANANA AI ]━━━╮\n` +
        `┃\n` +
        `┃  Edit gambar pakai AI!\n` +
        `┃  Kirim/reply gambar + prompt.\n` +
        `┃\n` +
        `┃  📌 Format:\n` +
        `┃  Reply gambar dengan:\n` +
        `┃  ${prefix}${command} <deskripsi edit>\n` +
        `┃\n` +
        `┃  📌 Contoh:\n` +
        `┃  ${prefix}${command} ubah jadi anime style\n` +
        `┃  ${prefix}${command} tambahkan efek sunset\n` +
        `┃  ${prefix}${command} ganti background jadi hutan\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `❓ Tulis deskripsi edit gambarnya!\n\n` +
        `Contoh:\n` +
        `*${prefix}${command} ubah jadi anime style*\n` +
        `*${prefix}${command} tambahkan efek hujan*`
      );
    }

    let imageUrl;
    try {
      if (isQuotedImage && quoted?.message) {
        const msg = quoted.message;
        const imgMsg = msg.imageMessage || msg.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        if (imgMsg?.url) {
          imageUrl = imgMsg.url;
        } else {
          // Download via alya (bukan conn)
          const media = await alya.downloadMediaMessage(quoted);
          if (!media) throw new Error('Gagal download media quoted');
          await reply(`⏳ Memproses gambar dengan AI...\n🖊️ Prompt: _${prompt}_\n\n_Mohon tunggu..._`);
          const form = new FormData();
          form.append('prompt', prompt);
          form.append('image', media, { filename: 'image.jpg', contentType: 'image/jpeg' });
          const res = await axios.post(API_URL, form, { headers: form.getHeaders(), timeout: 90000 });
          if (!res.data?.status) return reply(`❌ Gagal: ${res.data?.message || 'API error'}`);
          const resultUrl = res.data?.result || res.data?.image || res.data?.url;
          if (!resultUrl) return reply(`❌ API tidak mengembalikan gambar.`);
          const resultBuffer = await getBufferFromUrl(resultUrl);
          return await alya.sendMessage(m.chat, {
            image: resultBuffer,
            caption: `🍌 *Nano Banana AI Edit*\n\n🖊️ *Prompt:* ${prompt}\n\n_Powered by api-nanzz.my.id_`
          }, { quoted: m });
        }
      } else if (isImage) {
        const imgMsg = m.message?.imageMessage;
        imageUrl = imgMsg?.url || null;
      }
    } catch (e) {
      return reply(`❌ Gagal mengambil gambar: ${e.message}`);
    }

    if (!imageUrl) return reply(`❌ Tidak bisa mengambil URL gambar.\nCoba kirim ulang gambarnya.`);

    await reply(`⏳ *Memproses dengan Nano Banana AI...*\n🖊️ Prompt: _${prompt}_\n\n_Mohon tunggu 10–30 detik..._`);

    let result;
    try {
      result = await tryNanobanana(prompt, imageUrl);
    } catch (err) {
      return reply(
        `❌ *Gagal memproses gambar!*\n\n` +
        `Kemungkinan penyebab:\n` +
        `• API sedang tidak stabil\n` +
        `• Format gambar tidak didukung\n\n` +
        `Detail: _${err.message.split('\n')[0]}_`
      );
    }

    const resultUrl = result?.result || result?.image || result?.url || result?.data?.url;
    if (!resultUrl) return reply(`⚠️ API merespons tapi tidak ada gambar.\nResponse: \`${JSON.stringify(result).slice(0, 200)}\``);

    try {
      const resultBuffer = await getBufferFromUrl(resultUrl);
      await alya.sendMessage(m.chat, {
        image: resultBuffer,
        caption: `🍌 *Nano Banana AI Edit*\n\n🖊️ *Prompt:* ${prompt}\n\n_Powered by api-nanzz.my.id_`
      }, { quoted: m });
    } catch (e) {
      await reply(`✅ Gambar berhasil diedit!\n\n🔗 Hasil: ${resultUrl}\n\n🖊️ Prompt: ${prompt}`);
    }
  }
};
