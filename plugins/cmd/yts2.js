// Plugin: yts2
// Auto-generated from Alya V12
// Commands: yts2
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["yts2"],
  tags: ['downloader'],
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

        if (!text) return replyalya(`Example : ${prefix + command} story wa anime`);
        const yts = require('yt-search');
        async function searchYouTube(text) {
            let search = await yts(text);
            let groups = search.all.map((v) => {
                return {
                    title: v.title,
                    rows: [
                        {
                            title: "Download Video",
                            description: `${v.url}`,
                            id: 'ytmp4 ' + v.url
                        },
                        {
                            title: "Download Audio",
                            description: `${v.url}`,
                            id: 'ytmp3 ' + v.url
                        }
                    ]
                };
            });

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: {
                                text: `🔎 Hasil Pencarian Dari ${text}
    Silahkan Pilih List di bawah ini`
                            },
                            footer: {
                                text: null
                            },
                            header: proto.Message.InteractiveMessage.Header.create({
                                ...(await prepareWAMessageMedia({ image: { url: search.all[0].thumbnail } }, { upload: alya.waUploadToServer })),
                                title: '',
                                gifPlayback: true,
                                subtitle: ownername,
                                hasMediaAttachment: false
                            }),
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "PILIH DISINI",
                                            sections: groups
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m }, {});
            await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
        }
        searchYouTube(text);
  }
}
