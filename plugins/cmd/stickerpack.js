// Plugin: stickerpack
// Auto-generated from Alya V12
// Commands: stickerpack

const path = require('path')

module.exports = {
  command: ["stickerpack"],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

        try {
            const scraper = require('../../fitur/stickerpack');
            const axios = require('axios');
            const crypto = require('crypto');
            const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

            if (!text) return reply(`Contoh:\n${prefix + command} blue archive`);

            if (text.startsWith('send')) {
                const session = global.stickerSession[m.sender];
                if (!session) return reply('Sesi habis, silakan cari lagi.');

                await reply(`*Sedang memproses Sticker Pack...*\nMohon tunggu sebentar.`);

                try {
                    const thumbResponse = await axios.get(session.stickers[0].image, { responseType: 'arraybuffer' });
                    const thumbBuffer = Buffer.from(thumbResponse.data);

                    const stickers = session.stickers.slice(0, 10).map(s => ({
                        url: s.image
                    }));

                    const packMsg = generateWAMessageFromContent(m.chat, {
                        stickerPackMessage: {
                            stickerPackId: session.slug || crypto.randomBytes(10).toString('hex'),
                            name: session.title || "Sticker Pack",
                            publisher: "Alya-Assistant",
                            thumbnail: thumbBuffer,
                            stickers: stickers
                        }
                    }, { quoted: m });

                    await alya.relayMessage(m.chat, packMsg.message, { messageId: packMsg.key.id });

                    delete global.stickerSession[m.sender]; // Hapus sesi setelah sukses
                    return;

                } catch (e) {
                    console.error(e);
                    return reply("Gagal memproses pack. Pastikan gambar sticker adalah format .webp");
                }
            }

            if (text.startsWith('pick')) {
                const slug = text.split(' ')[1];
                if (!slug) return reply('ID tidak ditemukan.');

                const data = await scraper.detail(slug);
                if (!data || !data.stickers || data.stickers.length === 0) return reply('Gagal mengambil data.');

                if (!global.stickerSession) global.stickerSession = {};
                global.stickerSession[m.sender] = data;

                return await alya.sendMessage(m.chat, {
                    text: `📦 *${data.title}*\n\nTotal: ${data.stickers.length} sticker\nPublisher: ${data.author || 'Unknown'}\n\nKlik tombol di bawah untuk mengimpor ke WhatsApp.`,
                    footer: 'Alya Assistant',
                    buttons: [
                        {
                            buttonId: `${prefix + command} send`,
                            buttonText: { displayText: 'Kirim Sebagai Pack' },
                            type: 1
                        }
                    ],
                    viewOnce: true
                }, { quoted: m });
            }

            const packs = await scraper.search(text);
            if (!packs || packs.length === 0) return reply('Sticker tidak ditemukan.');

            const rows = packs.slice(0, 10).map(p => ({
                title: p.name,
                description: `Author: ${p.author || 'Ryuu'}`,
                id: `${prefix + command} pick ${p.slug}`
            }));

            await alya.sendMessage(m.chat, {
                text: `🔍 *Pencarian Sticker: ${text}*`,
                footer: 'Pilih pack yang ingin dilihat',
                buttons: [{
                    buttonId: 'list_p',
                    buttonText: { displayText: 'Lihat Daftar Pack' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'Hasil Pencarian',
                            sections: [{ title: 'Daftar Pack', rows }]
                        })
                    }
                }],
                viewOnce: true
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            reply('Terjadi kesalahan sistem: ' + err.message);
        }
    }
}
