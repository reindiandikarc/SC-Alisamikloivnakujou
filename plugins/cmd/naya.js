// Plugin: naya
// Auto-generated from Alya V12
// Commands: naya

const path = require('path')

module.exports = {
  command: ["naya"],
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

    	if (!isPrem) return replyprem(mess.premium)
        if (!text) return replyalya(`Contoh:\n.naya Hai sayang`)

        try {
            const axios = require('axios')

            const res = await axios.get(
                `https://api.cuki.biz.id/api/ai/naya?apikey=cuki-x&question=${encodeURIComponent(text)}`,
                {
                    headers: {
                        'x-api-key': 'cuki-x'
                    }
                }
            )

            replyalya(res.data.data.response)

        } catch (err) {
            console.error(err)
            replyalya('Error bang')
        }
    }

}
