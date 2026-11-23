// Plugin: bot
// Auto-generated from Alya V12
// Commands: bot

const path = require('path')

module.exports = {
  command: ["bot"],
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

     if (!text) return reply(`Hai, aku *${botname}*! 🤖 Aku adalah asisten virtual yang siap membantu kamu dengan berbagai informasi dan kebutuhan sehari-hari. Aku bisa kasih kamu rekomendasi, bantu cari jawaban, atau sekadar ngobrol santai. Yuk, tanya-tanya aja! 😊`)
        let response = await axios.post("https://chateverywhere.app/api/chat/", {
            "model": {
                "id": "gpt-4",
                "name": "GPT-4",
                "maxLength": 32000,
                "tokenLimit": 8000,
                "completionTokenLimit": 5000,
                "deploymentName": "gpt-4"
            },
            "messages": [
                {
                    "pluginId": null,
                    "content": text,
                    "role": "user"
                }
            ],
            "prompt": "nama mu adalah ALya, kamu adalah asisten kecerdasan buatan yang sering membantu orang lain jika ada yang ditanyakan, dan kamu adalah bot WhatsApp yang di buat oleh Yuusuke",
            "temperature": 0.5
        }, {
            headers: {
                "Accept": "/*/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            }
        });

        let result = response.data;
                    const xeonrl = googleTTS.getAudioUrl(result, {
                    lang: "ID",
                    slow: false,
                    host: "https://translate.google.com",
                })
                return alya.sendMessage(m.chat, {
                    audio: {
                        url: xeonrl,
                    },
                    mimetype: 'audio/mp4',
                    ptt: true,
                    fileName: `${text}.mp3`,
                }, {
                    quoted: m,
                })
  }
}
