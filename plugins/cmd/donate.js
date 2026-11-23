// Plugin: donate
// Commands: donate, pay, donasi, payment
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['donate', 'pay', 'donasi', 'payment'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

await alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});

    async function getMedia(path) {
        return await prepareWAMessageMedia({ image: { url: path } }, { upload: alya.waUploadToServer });
    }

    let cards = [
        {
            header: proto.Message.InteractiveMessage.Header.create({
                ...(await getMedia('./data/image/payment/dana.jpg')),
                title: '',
                gifPlayback: false,
                subtitle: ownername,
                hasMediaAttachment: true
            }),
            body: { text: `> Klik tombol DANA di bawah\n> DANA A/N: ${global.andana}` },
            nativeFlowMessage: {
                buttons: [
                    {
                        "name": "cta_copy",
                        "buttonParamsJson": JSON.stringify({
                            "display_text": "Copy No. DANA",
                            "id": "dana_copy",
                            "copy_code": global.nodana
                        })
                    }
                ]
            }
        },
        {
            header: proto.Message.InteractiveMessage.Header.create({
                ...(await getMedia('./data/image/payment/gopay.jpg')),
                title: '',
                gifPlayback: false,
                subtitle: ownername,
                hasMediaAttachment: true
            }),
            body: { text: `> Klik tombol GOPAY di bawah\n> GOPAY A/N: ${global.angopay}` },
            nativeFlowMessage: {
                buttons: [
                    {
                        "name": "cta_copy",
                        "buttonParamsJson": JSON.stringify({
                            "display_text": "Copy No. GOPAY",
                            "id": "gopay_copy",
                            "copy_code": global.nogopay
                        })
                    }
                ]
            }
        },
        {
            header: proto.Message.InteractiveMessage.Header.create({
                ...(await getMedia(global.qris)),
                title: '',
                gifPlayback: false,
                subtitle: ownername,
                hasMediaAttachment: true
            }),
            body: { text: `> SCAN QRIS di atas untuk semua pembayaran\n> Pastikan nominal sesuai` },
            nativeFlowMessage: {
                buttons: [
                    {
                        "name": "cta_url",
                        "buttonParamsJson": JSON.stringify({
                            "display_text": "Lihat QRIS Full",
                            "url": global.qris,
                            "merchant_url": "https://www.google.com"
                        })
                    }
                ]
            }
        }
    ];

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: `Halo @${m.sender.split('@')[0]} , berikut daftar metode pembayaran saya ya~` },
                    footer: { text: `Terima kasih atas dukungannya!` },
                    carouselMessage: {
                        cards: cards,
                        messageVersion: 1
                    }
                }
            }
        }
    }, { quoted: m, userJid: alya.user.id });

    await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }
};
