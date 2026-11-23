// Plugin: upvidey
// Auto-generated from Alya V12
// Commands: upvidey
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["upvidey"],
  tags: ['general'],
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

        const { Videy } = require("@zanixongroup/uploader");
        let quotedAlt = m.quoted ? m.quoted : m;
        let mimeAlt = (quotedAlt.msg || quoted).mimetype || '';

        if (!/video/.test(mime)) return replytolak(`🎬 Kirim video dengan caption *${prefix + command}* atau reply video yang sudah dikirim.`);

        replyalya('⏳ Sedang upload video ke Videy, mohon tunggu...');

        try {
            let stream = await downloadContentFromMessage(quotedAlt.msg || quoted, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const videyUrl = await Videy(buffer);

            if (!videyUrl) throw new Error('Upload ke Videy gagal!');

            let ext = (mimeAlt.split('/')[1] || 'mp4').toUpperCase();

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: {
                                text: `✅ *Video Upload Berhasil!*\n📹 Service: Videy\n📄 Format: ${ext}`
                            },
                            header: {
                                title: '🎬 Videy Upload Complete',
                                subtitle: 'Video berhasil diupload',
                                hasMediaAttachment: false
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'cta_copy',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: '📋 Copy URL',
                                            copy_code: videyUrl
                                        })
                                    },
                                    {
                                        name: 'cta_url',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: '🔗 Buka Video',
                                            url: videyUrl
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m });

            await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (e) {
            console.error('Error Videy Upload:', e);
            replytolak('🚨 Error: ' + (e.message || e));
        }
//     	case 'hentaivid2': {
    if (!isPrem) return replyprem(mess.premium)
    reply(mess.wait)
    alya.sendMessage(m.chat, { video: { url: `https://api.fgmods.xyz/api/nsfw-nime/hentai-mp4?apikey=qzu9Ja5Q`},
    caption: `success` }, { quoted: m })
// [REMOVED]     	case 'hentaivid': case 'hentaivideo': {
    	if (!isPrem) return replyprem(mess.premium)
    reply(mess.wait)
    alya.sendMessage(m.chat, { video: { url: `https://api.fgmods.xyz/api/nsfw-nime/hentai-mp4?apikey=qzu9Ja5Q`},
    caption: `success` }, { quoted: m })
  }
}
