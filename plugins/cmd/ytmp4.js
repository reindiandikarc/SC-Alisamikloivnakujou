// Plugin: ytmp4
// Commands: ytmp4
// ✅ Port V10 — API hub.ytconvert.org via fitur/youtubedl.js
// ✅ FIX #1: Download buffer terlebih dahulu → video BISA diputar di WhatsApp
// ✅ FIX #2: Tidak ada link preview pada hasil download
// ✅ FIX #3: mimetype 'video/mp4' eksplisit agar WA kenali sebagai video inline

'use strict';

const axios = require('axios');
const {
  generateWAMessageFromContent
} = require('@whiskeysockets/baileys');

module.exports = {
  command: ['ytmp4'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { text, args, prefix, command, replyalya, isPrem } = ctx;

    if (!text) {
      return replyalya(
        `Duh, kamu ini pelupa atau gimana sih? 🙄\nMasukin link YouTube-nya dulu baru aku bantu!\n\n📌 Contoh: ${prefix + command} https://youtu.be/...`
      );
    }

    const limitHarga = {
      '144': 2,
      '240': 4,
      '360': 6,
      '480': 8,
      '720': 10,
      '1080': 20
    };

    // ─── MODE: Ada quality di args[0] → langsung download ───────────────────
    if (/^\d+$/.test(args[0])) {
      const quality = args[0];
      const url = args.slice(1).join(' ');

      if (!url) return replyalya('Hah? URL-nya mana? Jangan bikin aku bingung dong! 💢');

      if (quality === '1080' && !isPrem) {
        return replyalya('Eits! 🔒 Resolusi 1080p itu cuma buat user Premium! Kamu beli dulu sana, jangan mau gratisan terus! 😤');
      }

      const biaya = limitHarga[quality] || 6;
      const limitUser = global.db.users[m.sender]?.limit || 0;

      if (limitUser < biaya) {
        return replyalya(
          `Duh, limit kamu tipis banget sih! 😒\nNggak cukup buat download kualitas ${quality}p!\n\n` +
          `💳 Butuh: ${biaya}\n📊 Sisa limit kamu: ${limitUser}\n\nSana buy limit dulu, baru balik ke aku!`
        );
      }

      try {
        await alya.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const { ytmp4 } = require('../../fitur/youtubedl');
        const res = await ytmp4(url, quality);

        // ✅ Download buffer agar video bisa diputar di WhatsApp
        await replyalya(`⏬ *Sedang mengunduh video ${quality}p...*\nMohon tunggu sebentar ya! (Jangan kabur dulu)`);

        const vidResponse = await axios.get(res.downloadUrl, {
          responseType: 'arraybuffer',
          timeout: 180000, // 3 menit
          maxContentLength: 250 * 1024 * 1024 // 250MB max
        });
        const vidBuffer = Buffer.from(vidResponse.data);

        global.db.users[m.sender].limit -= biaya;
        const sisa = global.db.users[m.sender].limit;

        // ✅ Kirim video sebagai BUFFER — tanpa link preview
        await alya.sendMessage(m.chat, {
          video: vidBuffer,
          mimetype: 'video/mp4',
          caption:
            `🎬 *${res.title || 'YouTube Video'}*\n\n` +
            `📺 Resolusi: ${quality}p\n\n` +
            `━━━━━━━━━━━━━━━\n` +
            `Limit kamu kepotong ${biaya} ya! Sisa: ${sisa}\n\n` +
            `Tuh, tonton gih! Jangan berisik lagi! 💖`,
          gifPlayback: false
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      } catch (e) {
        console.error('[ytmp4]', e.message);
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        replyalya('Gagal kan... Makanya, kalau kasih link itu yang bener! Bikin repot aja! 💢');
      }

    // ─── MODE: Tidak ada quality → tampilkan pilihan resolusi ────────────────
    } else {
      const url = text;
      const limitUser = global.db.users[m.sender]?.limit || 0;

      const rows = [
        { header: 'Hemat',        title: '144p',  description: 'Biaya: 2 Limit',             id: `${prefix}ytmp4 144 ${url}` },
        { header: 'Standar',      title: '240p',  description: 'Biaya: 4 Limit',             id: `${prefix}ytmp4 240 ${url}` },
        { header: 'Bening',       title: '360p',  description: 'Biaya: 6 Limit',             id: `${prefix}ytmp4 360 ${url}` },
        { header: 'Jernih',       title: '480p',  description: 'Biaya: 8 Limit',             id: `${prefix}ytmp4 480 ${url}` },
        { header: 'HD',           title: '720p',  description: 'Biaya: 10 Limit',            id: `${prefix}ytmp4 720 ${url}` },
        { header: 'FULL HD 👑',   title: '1080p', description: 'Biaya: 20 Limit (Premium)',  id: `${prefix}ytmp4 1080 ${url}` }
      ];

      try {
        const msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: {
                body: {
                  text: `🎬 *Pilih Resolusi Video*\n\nCepetan pilih mau kualitas yang mana! Gak usah lama-lama ya! 😤\n\n📊 Limit kamu: ${limitUser}`
                },
                footer: {
                  text: 'Jangan pilih yang kamu nggak mampu bayar ya! 🙄'
                },
                header: {
                  title: '📺 YouTube Video Downloader'
                },
                nativeFlowMessage: {
                  buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'Klik di sini, baka!',
                      sections: [{
                        title: 'Daftar Resolusi',
                        rows
                      }]
                    })
                  }]
                }
              }
            }
          }
        }, { quoted: m });

        await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

      } catch (err) {
        // Fallback teks kalau interactive gagal
        replyalya(
          `🎬 *Pilih Resolusi Video:*\n\n` +
          rows.map(r => `• *${r.title}* (${r.description})\n  \`${r.id}\``).join('\n\n')
        );
      }
    }
  }
};
