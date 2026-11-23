// Plugin: owner
// Commands: owner
// Dimiripkan dengan Alya V10 — carousel 2 kartu (Owner + Bot), fallback teks plain

'use strict';

const fs   = require('fs');
const path = require('path');
const {
  generateWAMessageFromContent,
  proto,
  prepareWAMessageMedia,
} = require('@whiskeysockets/baileys');

module.exports = {
  command: ['owner'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { pushname, reply, replyalya } = ctx;

    const _ownername   = global.ownername   || 'Owner';
    const _ownernumber = global.ownernumber || global.ownernomer || '0';
    const _botname     = global.botname     || 'Alya Bot';
    let   _botnumber   = '0';
    try {
      const jid = alya.user?.id || '';
      _botnumber = jid.split(':')[0].split('@')[0];
    } catch {}

    const name = pushname || 'Kak';

    const pan =
      `\n▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
      `> *Halo Kak \`${name}\`, Tekan Tombol Yang bertuliskan Chat Owner Untuk Menghubungi Nomor Owner ku*\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n`;

    // Cari thumb lokal, fallback ke URL default
    const thumbCandidates = [
      path.join(process.cwd(), 'data', 'image', 'thumb.jpg'),
      path.join(process.cwd(), 'media', 'alya.jpg'),
      path.join(process.cwd(), 'data', 'image', 'menu.jpg'),
    ];
    let thumbPath = null;
    for (const tp of thumbCandidates) {
      if (fs.existsSync(tp)) { thumbPath = tp; break; }
    }

    try {
      let mediaOpts;
      if (thumbPath) {
        mediaOpts = await prepareWAMessageMedia(
          { image: fs.readFileSync(thumbPath) },
          { upload: alya.waUploadToServer }
        );
      } else {
        mediaOpts = await prepareWAMessageMedia(
          { image: { url: 'https://raw.githubusercontent.com/RyuuAkbarID/media/refs/heads/main/kontak.jpg' } },
          { upload: alya.waUploadToServer }
        );
      }

      const makeHeader = (subtitle) =>
        proto.Message.InteractiveMessage.Header.create({
          ...mediaOpts,
          title: '',
          subtitle,
          gifPlayback: true,
          hasMediaAttachment: false,
        });

      const ownerCard = {
        header: makeHeader(_ownername),
        body: {
          text:
`\n┏───────────────┈ \n` +
`┆     「 *\`[OWNER BOT]\`* 」\n` +
`┣───────────────┈ \n` +
`┣──=[ *\`[ ${_ownername} ]\`* ]==─\n` +
`┆ • Jangan Chat Yang Aneh Aneh\n` +
`┆ • Jangan Telpon/Call Owner \n` +
`┆ • Chat Langsung ke intinya aja\n` +
`┆ • Klo Ada Uang Minimal transferlah\n` +
`└────────────┈ ⳹`,
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: `👤 Chat Owner ( ${_ownername} )`,
              url: `https://wa.me/${_ownernumber}`,
              merchant_url: `https://wa.me/${_ownernumber}`,
            }),
          }],
        },
      };

      const botCard = {
        header: makeHeader(_botname),
        body: {
          text:
`\n┏───────────────┈ \n` +
`┆     「 *\`[NOMOR BOT]\`* 」\n` +
`┣───────────────┈ \n` +
`┣──=[ *\`[ ${_botname} ]\`* ]==─\n` +
`┆ • Jangan Spam Bot\n` +
`┆ • Jangan Telpon/Call Bot \n` +
`┆ • Gausah Chat Yg Aneh Aneh\n` +
`┆ • Beli Prem Dll Chat Owner\n` +
`└────────────┈ ⳹`,
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: `  💬  Chat Bot ( ${_botname} )`,
              url: `https://wa.me/${_botnumber}`,
              merchant_url: `https://wa.me/${_botnumber}`,
            }),
          }],
        },
      };

      const websiteCard = {
        header: makeHeader('Website Resmi'),
        body: {
          text:
`\n┏───────────────┈ \n` +
`┆     「 *\`[WEBSITE RESMI]\`* 」\n` +
`┣───────────────┈ \n` +
`┆ • Cek info & fitur lengkap bot\n` +
`┆ • Update menu & berita terbaru\n` +
`┆ • Klik tombol di bawah ya~\n` +
`└────────────┈ ⳹`,
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: `🌐 Buka Website Resmi`,
              url: `${global.websitex || global.ownerweb}`,
              merchant_url: `${global.websitex || global.ownerweb}`,
            }),
          }],
        },
      };

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: { text: pan },
                carouselMessage: {
                  cards: [ownerCard, botCard, websiteCard],
                  messageVersion: 1,
                },
              },
            },
          },
        },
        {}
      );

      await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (err) {
      console.error('[owner.js] carousel error:', err.message);
      // Fallback teks plain
      replyalya(
`┏━━『 *OWNER BOT* 』━━⬣
┃
┃ 👤 *Owner  :* ${_ownername}
┃ 📞 *Nomor  :* wa.me/${_ownernumber}
┃
┃ 🤖 *Bot    :* ${_botname}
┃ 📞 *Bot No :* wa.me/${_botnumber}
┃
┃ 🌐 *Website:* ${global.websitex || global.ownerweb}
┃
┗━━━━━━━━━━━━━━━━━━⬣`
      );
    }
  },
};
