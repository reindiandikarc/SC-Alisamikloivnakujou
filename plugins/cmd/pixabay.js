// Plugin: pixabay
// Auto-generated from Alya V12
// Commands: pixabay

const path = require('path')

module.exports = {
  command: ["pixabay"],
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

    async function formatNumber(integer) {
          let numb = parseInt(integer)
          return Number(numb).toLocaleString().replace(/,/g, '.')
       }
          if (!text) return reply(`*• Example :* ${prefix + command} *[type query]*

    List Type :
    * *Image*
    * *Video*`)
       let keyword = text.split(" ")[0];
       let data = text.slice(keyword.length + 1);
        if (keyword.toLowerCase() === "image") {
            if (!data) return reply( `*• Example :* ${prefix + command} image *[query]*`)
             let res = await(await axios.get("https://pixabay.com/api/?key=30089426-4575ed7bbbc8bfffe9a0b8eb4&q=" + data)).data;
         let rand = res.hits[Math.floor(Math.random() * res.hits.length)]
       let cap = `*± P I X - A B A Y*
    * *Type :* ${rand.type}
    * *Tags :* ${rand.tags}
    * *Size :* ${rand.imageWidth} x ${rand.imageHeight}
    * *Views :* ${await formatNumber(rand.views)}
    * *Likes :* ${await formatNumber(rand.likes)}
    * *Comments :* ${await formatNumber(rand.comments)}
    * *Downloads :* ${await formatNumber(rand.downloads)}
    * *Username :* ${rand.user} *[ ${rand.user_id} ]*

    _Media Has been sent, Please wait...._`
         let q = await alya.sendMessage(m.chat, {
                  text: cap
                  }, {
                quoted: m
             });
           await alya.sendMessage(m.chat, {
                image: {
                  url: rand.largeImageURL
                }}, {
                quoted: m
             });
             } else if (keyword.toLowerCase() === "video") {
          if (!data) return reply( `*• Example :* ${prefix + command} video *[query]*`)
             let res = await(await axios.get("https://pixabay.com/api/videos?key=30089426-4575ed7bbbc8bfffe9a0b8eb4&q=" + data)).data;
         let rand = res.hits[Math.floor(Math.random() * res.hits.length)]
         let cap = `*± P I X - A B A Y*
    * *Type :* ${rand.type}
    * *Tags :* ${rand.tags}
    * *Duration :* ${rand.duration} seconds
    * *Views :* ${await formatNumber(rand.views)}
    * *Likes :* ${await formatNumber(rand.likes)}
    * *Comments :* ${await formatNumber(rand.comments)}
    * *Downloads :* ${await formatNumber(rand.downloads)}
    * *Username :* ${rand.user} *[ ${rand.user_id} ]*

    _Media Has been sent, Please wait...._`
         let q = await alya.sendMessage(m.chat, {
                image: {
                  url: rand.videos["medium"].thumbnail
                   },
                 caption: cap
                }, {
                quoted: m
             });
           await alya.sendMessage(m.chat, {
                video: {
                  url: rand.videos["medium"].url
                 },
              gifPlayBack: true
             }, {
                quoted: m
             });
          }
      }
    //=================================//
    //=================================================//
  }
