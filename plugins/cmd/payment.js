// Plugin: payment / donasi
// Fixed V13: import lengkap, ownername dari global/settings, robust error handling
'use strict';

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const path = require('path');
const fs   = require('fs');

module.exports = {
  command: ['donasi', 'payment'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { replyalya } = ctx;

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    // Ambil ownername dari global (fallback ke settings.js)
    let ownername = global.ownername || global.setting?.ownername || 'Owner';
    let nodana    = global.nodana    || global.setting?.nodana    || '-';
    let nogopay   = global.nogopay   || global.setting?.nogopay   || '-';
    let andana    = global.andana    || global.setting?.andana    || ownername;
    let angopay   = global.angopay   || global.setting?.angopay   || ownername;
    let qris      = global.qris      || global.setting?.qris      || null;

    // Helper: siapkan media dari path lokal atau URL
    async function getMedia(src) {
      try {
        if (!src) throw new Error('no src');
        const isUrl = /^https?:\/\//i.test(src);
        if (isUrl) {
          return await prepareWAMessageMedia({ image: { url: src } }, { upload: alya.waUploadToServer });
        }
        if (!fs.existsSync(src)) throw new Error('file tidak ada: ' + src);
        return await prepareWAMessageMedia({ image: { url: src } }, { upload: alya.waUploadToServer });
      } catch (e) {
        console.error('[payment] getMedia error:', e.message);
        return null;
      }
    }

    // Build cards
    const cards = [];

    // ── DANA ──────────────────────────────────────────────────────────────────
    const danaMedia = await getMedia('./data/image/payment/dana.jpg');
    if (danaMedia) {
      cards.push({
        header: proto.Message.InteractiveMessage.Header.create({
          ...danaMedia,
          title: '',
          gifPlayback: false,
          subtitle: ownername,
          hasMediaAttachment: true,
        }),
        body: { text: `> Klik tombol DANA di bawah\n> DANA A/N: ${andana}` },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: '💙 Copy No. DANA',
              id: 'dana_copy',
              copy_code: nodana,
            }),
          }],
        },
      });
    }

    // ── GOPAY ─────────────────────────────────────────────────────────────────
    const gopayMedia = await getMedia('./data/image/payment/gopay.jpg');
    if (gopayMedia) {
      cards.push({
        header: proto.Message.InteractiveMessage.Header.create({
          ...gopayMedia,
          title: '',
          gifPlayback: false,
          subtitle: ownername,
          hasMediaAttachment: true,
        }),
        body: { text: `> Klik tombol GOPAY di bawah\n> GOPAY A/N: ${angopay}` },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: '💚 Copy No. GOPAY',
              id: 'gopay_copy',
              copy_code: nogopay,
            }),
          }],
        },
      });
    }

    // ── OVO ───────────────────────────────────────────────────────────────────
    const ovoMedia = await getMedia('./data/image/payment/ovo.jpg');
    if (ovoMedia) {
      const noovo   = global.noovo   || global.setting?.noovo   || '-';
      const anovo   = global.anovo   || global.setting?.anovo   || ownername;
      cards.push({
        header: proto.Message.InteractiveMessage.Header.create({
          ...ovoMedia,
          title: '',
          gifPlayback: false,
          subtitle: ownername,
          hasMediaAttachment: true,
        }),
        body: { text: `> Klik tombol OVO di bawah\n> OVO A/N: ${anovo}` },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: '💜 Copy No. OVO',
              id: 'ovo_copy',
              copy_code: noovo,
            }),
          }],
        },
      });
    }

    // ── QRIS ──────────────────────────────────────────────────────────────────
    if (qris) {
      const qrisMedia = await getMedia(qris);
      if (qrisMedia) {
        cards.push({
          header: proto.Message.InteractiveMessage.Header.create({
            ...qrisMedia,
            title: '',
            gifPlayback: false,
            subtitle: ownername,
            hasMediaAttachment: true,
          }),
          body: { text: `> SCAN QRIS di atas untuk semua pembayaran\n> Pastikan nominal sesuai` },
          nativeFlowMessage: {
            buttons: [{
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🔳 Lihat QRIS Full',
                url: /^https?:\/\//.test(qris) ? qris : 'https://www.google.com',
                merchant_url: 'https://www.google.com',
              }),
            }],
          },
        });
      }
    }

    // Jika tidak ada card sama sekali, kirim teks biasa sebagai fallback
    if (cards.length === 0) {
      return replyalya(
        `💳 *Metode Pembayaran*\n\n` +
        `• DANA   : ${nodana} (A/N: ${andana})\n` +
        `• GOPAY  : ${nogopay} (A/N: ${angopay})\n\n` +
        `_Hubungi owner untuk konfirmasi pembayaran ya~_`
      );
    }

    try {
      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: `Halo @${m.sender.split('@')[0]}, berikut daftar metode pembayaran saya ya~`,
              },
              footer: { text: `Terima kasih atas dukungannya! 💖` },
              carouselMessage: {
                cards,
                messageVersion: 1,
              },
            },
          },
        },
      }, { quoted: m, userJid: alya.user.id });

      await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[payment] interactiveMessage gagal:', err.message);
      // Fallback teks biasa
      let teks = `💳 *Metode Pembayaran*\n\n`;
      teks += `• DANA   : *${nodana}*  (A/N: ${andana})\n`;
      teks += `• GOPAY  : *${nogopay}*  (A/N: ${angopay})\n`;
      if (global.noovo || global.setting?.noovo) teks += `• OVO    : *${global.noovo || global.setting?.noovo}*\n`;
      if (qris) teks += `• QRIS   : ${/^https?:\/\//.test(qris) ? qris : 'Tanya owner'}\n`;
      teks += `\n_Hubungi owner untuk konfirmasi pembayaran ya~_`;
      await replyalya(teks);
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
  },
};
