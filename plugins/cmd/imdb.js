// Plugin: imdb
// Auto-generated from Alya V12
// Commands: imdb

const path = require('path')

module.exports = {
  command: ["imdb"],
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

    if (!text) return replyalya(`_Name a Series or movie`)
    reply(mess.wait)
                let fids = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`)
                let imdbt = ""
                console.log(fids.data)
                imdbt += "⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n" + " ``` IMDB SEARCH```\n" + "⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n"
                imdbt += "🎬Title      : " + fids.data.Title + "\n"
                imdbt += "📅Year       : " + fids.data.Year + "\n"
                imdbt += "⭐Rated      : " + fids.data.Rated + "\n"
                imdbt += "📆Released   : " + fids.data.Released + "\n"
                imdbt += "⏳Runtime    : " + fids.data.Runtime + "\n"
                imdbt += "🌀Genre      : " + fids.data.Genre + "\n"
                imdbt += "👨🏻‍💻Director   : " + fids.data.Director + "\n"
                imdbt += "✍Writer     : " + fids.data.Writer + "\n"
                imdbt += "👨Actors     : " + fids.data.Actors + "\n"
                imdbt += "📃Plot       : " + fids.data.Plot + "\n"
                imdbt += "🌐Language   : " + fids.data.Language + "\n"
                imdbt += "🌍Country    : " + fids.data.Country + "\n"
                imdbt += "🎖️Awards     : " + fids.data.Awards + "\n"
                imdbt += "📦BoxOffice  : " + fids.data.BoxOffice + "\n"
                imdbt += "🏙️Production : " + fids.data.Production + "\n"
                imdbt += "🌟imdbRating : " + fids.data.imdbRating + "\n"
                imdbt += "✅imdbVotes  : " + fids.data.imdbVotes + ""
               alya.sendMessage(m.chat, {
    image: {
    url: fids.data.Poster,
    },
    caption: imdbt,
                }, {
    quoted: m,
                })
  }
}
