// Plugin: tenor
// Auto-generated from Alya V12
// Commands: tenor

const path = require('path')

module.exports = {
  command: ["tenor"],
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

    function isValidURL(message) {
        const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/;
        return urlPattern.test(message);
    }

    async function getTemplateImageUrl(input, number) {
        try {
            const data = await (await fetch(`https://g.tenor.com/v1/search?q=${input}&key=LIVDSRZULELA`)).json();
            const selectedId = data.results[number - 1];
            return {
                one: selectedId,
                all: data.results
            };
        } catch (error) {
            console.error("Error fetching data:", error);
            return "Error fetching data.";
        }
    }
        let [tema, urutan] = text.split(/[^\w\s]/g)
        if (!tema) return m.reply("*Example:*\n.tenor [tema]|[angka]")
        if (!urutan) return m.reply("*Example:*\n.tenor [tema]|[angka]")
        if (isNaN(urutan)) return m.reply("*Example:*\n.tenor [tema]|[angka]")
        await m.reply(mess.wait)
        try {
            let json = await getTemplateImageUrl(tema, urutan)
            let data = json.one
            let all = json.all
            if (urutan > all.length) return m.reply("Input query!\n*Example:*\n.tenor [tema]|[angka]\n\n*Pilih angka yg ada*\n" + all.map((item, index) => `*${index + 1}.* ${item.content_description}`).join("\n"))
            if (isValidURL(data.media[0].mp4.url)) {
                let caption = `🔍 *[ HASIL ]*

    🆔 *ID:* ${data.id}
    🌐 *URL:* ${data.url}
    📋 *Description:* ${data.content_description}
    📌 *Item:* ${data.itemurl}`
                await alya.sendMessage(m.chat, {
                    video: {
                        url: data.media[0].mp4.url
                    },
                    caption: caption,
                    gifPlayback: true,
                    gifAttribution: 2
                }, {
                    quoted: m
                })
            }
        } catch (e) {
            await m.reply(eror)
        }
    }

    //===============Store-Menu================\\
  }
