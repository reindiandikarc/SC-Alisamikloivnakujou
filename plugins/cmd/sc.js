// Plugin: sc
// Commands: sc
// Menampilkan info SC (Source Code) bot beserta harga dan kontak owner

'use strict';

const {
  generateWAMessageFromContent,
  proto,
  prepareWAMessageMedia,
} = require('@whiskeysockets/baileys');
const fs   = require('fs');
const path = require('path');

module.exports = {
  command: ['sc'],
  tags   : ['info'],
  run    : async (alya, m, ctx) => {
    const { pushname, reply, replyalya } = ctx;

    const name         = pushname || 'Kak';
    const ownerNumber  = '6285602845943';
    const ownerWa      = `https://wa.me/${ownerNumber}`;

    const scText =
      `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
      `┃   🤖 *SOURCE CODE BOT* 🤖   ┃\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

      `╭───────────────────────╮\n` +
      `│  Halo Kak *${name}*! 👋  │\n` +
      `╰───────────────────────╯\n\n` +

      `✨ *Tertarik punya bot WhatsApp*\n` +
      `✨ *seperti ini?*\n\n` +

      `╔══════════════════════╗\n` +
      `║   📦 *PAKET SC BOT*    ║\n` +
      `╚══════════════════════╝\n\n` +

      `┌─────────────────────────\n` +
      `│ 💰 *Harga   :* Rp 50.000 - 100.000\n` +
      `│ 🧑‍💻 *Contact :* ${ownerNumber}\n` +
      `│ 📱 *Platform:* WhatsApp Bot\n` +
      `│ ⚡ *Framework:* Baileys V13\n` +
      `└─────────────────────────\n\n` +

      `╔══════════════════════╗\n` +
      `║   📋 *SUDAH INCLUDE*   ║\n` +
      `╚══════════════════════╝\n\n` +
      `✅ Full Source Code\n` +
      `✅ Plugin 200+ commands\n` +
      `✅ AI Chat (Gemini/GPT)\n` +
      `✅ Downloader (YT, TikTok, dll)\n` +
      `✅ Game & Fun features\n` +
      `✅ Group Management\n` +
      `✅ Anti-spam, Anti-link\n` +
      `✅ Support & Panduan setup\n\n` +

      `╔══════════════════════╗\n` +
      `║  🔞 *NSFW MODULE*      ║\n` +
      `╚══════════════════════╝\n\n` +

      `📂 *Kategori Anime/SFW:*\n` +
      `┌─────────────────────────\n` +
      `│ 🐱 neko       — 367 link\n` +
      `│ 🐱 neko2      — 103 link\n` +
      `│ 📖 manga      — 54 link\n` +
      `│ 🎞️  gifs       — 28 link\n` +
      `│ 👘 zettai     — 51 link\n` +
      `│ 🌸 jahy       — 14 link\n` +
      `└─────────────────────────\n\n` +

      `📂 *Kategori Ecchi/Soft:*\n` +
      `┌─────────────────────────\n` +
      `│ 💦 ero        — 125 link\n` +
      `│ 🍑 eba        — 100 link\n` +
      `│ 👓 glasses    — 57 link\n` +
      `│ 🦵 thighs     — 81 link\n` +
      `│ 👙 panties    — 130 link\n` +
      `│ 🦶 foot       — 15 link\n` +
      `└─────────────────────────\n\n` +

      `📂 *Kategori Hentai:*\n` +
      `┌─────────────────────────\n` +
      `│ 🔞 hentai     — 156 link\n` +
      `│ 💦 cum        — 190 link\n` +
      `│ 😩 ahegao     — 39 link\n` +
      `│ 👄 blowjob    — 59 link\n` +
      `│ 🍑 ass        — 179 link\n` +
      `│ 💦 pussy      — 43 link\n` +
      `│ 💦 masturbation — 127 link\n` +
      `└─────────────────────────\n\n` +

      `📂 *Kategori Spesial:*\n` +
      `┌─────────────────────────\n` +
      `│ 👩‍❤️‍👩 yuri       — 159 link\n` +
      `│ 🍒 milf       — 196 link\n` +
      `│ 🌀 orgy       — 221 link\n` +
      `│ 🔗 bdsm       — 145 link\n` +
      `│ 👑 femdom     — 45 link\n` +
      `│ 👥 gangbang   — 61 link\n` +
      `│ 🦑 tentacles  — 54 link\n` +
      `│ 🤡 cuckold    — 47 link\n` +
      `│ 🔞 nsfwloli   — 127 link\n` +
      `└─────────────────────────\n\n` +
      `📊 *Total: 2.973 link NSFW*\n` +
      `📁 *28 kategori tersedia*\n\n` +

      `╔══════════════════════╗\n` +
      `║   ⚠️ *KETENTUAN*       ║\n` +
      `╚══════════════════════╝\n\n` +
      `• Harga bisa berubah sewaktu-waktu\n` +
      `• Bayar dulu, baru dikasih SC\n` +
      `• Tidak ada refund setelah bayar\n` +
      `• Dilarang dijual kembali\n\n` +

      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📞 *Hubungi Owner sekarang!*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━`;

    // Coba kirim dengan button CTA ke WhatsApp owner
    try {
      // Cari thumbnail lokal
      let mediaOpts;
      const thumbPaths = [
        path.join(process.cwd(), 'data', 'image', 'thumb.jpg'),
        path.join(process.cwd(), 'media', 'thumb.jpg'),
        path.join(process.cwd(), 'media', 'menu.jpg'),
      ];
      let thumbFound = null;
      for (const tp of thumbPaths) {
        if (fs.existsSync(tp)) { thumbFound = tp; break; }
      }

      if (thumbFound) {
        mediaOpts = await prepareWAMessageMedia(
          { image: fs.readFileSync(thumbFound) },
          { upload: alya.waUploadToServer }
        );
      } else {
        mediaOpts = await prepareWAMessageMedia(
          { image: { url: 'https://raw.githubusercontent.com/RyuuAkbarID/media/refs/heads/main/kontak.jpg' } },
          { upload: alya.waUploadToServer }
        );
      }

      const card = {
        header: proto.Message.InteractiveMessage.Header.create({
          ...mediaOpts,
          title: '',
          subtitle: '🤖 Alya Bot — Source Code',
          hasMediaAttachment: true,
        }),
        body: { text: scText },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text : `💬 Chat Owner (${ownerNumber})`,
                url          : ownerWa,
                merchant_url : ownerWa,
              }),
            },
          ],
        },
      };

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: { text: '🛒 *Informasi Source Code Bot*' },
                carouselMessage: {
                  cards           : [card],
                  messageVersion  : 1,
                },
              },
            },
          },
        },
        {}
      );

      await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (err) {
      console.warn('[sc.js] carousel gagal, fallback teks:', err.message);

      // Fallback: teks biasa + tombol URL via button message
      try {
        await alya.sendMessage(m.chat, {
          text   : scText,
          buttons: [
            {
              buttonId  : ownerWa,
              buttonText: { displayText: `💬 Chat Owner (${ownerNumber})` },
              type      : 4, // URL button type
            },
          ],
          footer: '🤖 Alya Bot — Source Code',
        }, { quoted: m });
      } catch {
        // Final fallback teks polos
        replyalya(scText + `\n\n💬 *WhatsApp Owner:* wa.me/${ownerNumber}`);
      }
    }
  },
};
