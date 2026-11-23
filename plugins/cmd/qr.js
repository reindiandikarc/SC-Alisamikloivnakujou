// Plugin: QR / toqr
// Commands: QR, qr, toqr
// Fix untuk Alya V13 — Generate QR Code dari teks/link
'use strict';

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['QR', 'qr', 'toqr'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const {
      command, text, q, prefix,
      reply, replyalya
    } = ctx;

    const input = text || q;
    if (!input) {
      return replyalya(
        `╭─「 🔳 *QR CODE GENERATOR* 」\n│\n` +
        `│ 📌 Cara Pakai:\n` +
        `│ *${prefix}${command} <teks/link>*\n│\n` +
        `│ 📌 Contoh:\n` +
        `│ ${prefix}${command} https://wa.me/6281234567890\n` +
        `│ ${prefix}${command} Halo ini pesan rahasia\n` +
        `╰──────────────────`
      );
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      // Gunakan QR API yang stabil
      const encoded = encodeURIComponent(input);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encoded}&format=png&margin=10&ecc=M`;

      const res = await fetch(qrUrl, { timeout: 15000 });
      if (!res.ok) throw new Error(`QR API error: ${res.status}`);

      const buffer = await res.buffer();
      if (!buffer || buffer.length < 100) throw new Error('QR buffer kosong');

      const caption =
        `🔳 *QR CODE BERHASIL DIBUAT!*\n\n` +
        `📝 *Isi:* ${input.length > 80 ? input.slice(0, 80) + '...' : input}\n` +
        `📏 *Panjang:* ${input.length} karakter\n` +
        `🔒 *Error Correction:* Medium (M)\n` +
        `📐 *Resolusi:* 512×512 px\n\n` +
        `_Scan QR Code di atas menggunakan kamera HP kamu!_ ✨`;

      await alya.sendMessage(m.chat, {
        image: buffer,
        caption: caption
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[QR Error]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      // Fallback ke URL alternatif
      try {
        const encoded = encodeURIComponent(input);
        const fallbackUrl = `https://quickchart.io/qr?text=${encoded}&size=400&format=png`;
        const res2 = await fetch(fallbackUrl, { timeout: 15000 });
        if (!res2.ok) throw new Error('Fallback juga gagal');
        const buf2 = await res2.buffer();

        await alya.sendMessage(m.chat, {
          image: buf2,
          caption: `🔳 *QR Code berhasil!*\n📝 Isi: ${input.length > 80 ? input.slice(0, 80) + '...' : input}`
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err2) {
        replyalya(`❌ *Gagal membuat QR Code!*\n\n🔍 *Error:* ${err.message}\n\n💡 Coba lagi beberapa saat atau gunakan teks yang lebih pendek.`);
      }
    }
  }
};
