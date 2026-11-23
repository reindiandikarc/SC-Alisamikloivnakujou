// Plugin: blackshop
// Auto-generated from Alya V12
// Commands: blackshop

const path = require('path')

module.exports = {
  command: ["blackshop"],
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

    	if (!args[0]) return replyalya(
    `📦 SHOP ITEM

    1. antibegal

    Contoh:
    .blackshop antibegal`
    	)
    	if (args[0].toLowerCase() !== 'antibegal')
    		return replyalya('❌ Item tidak tersedia')

    	const PRICE = 500000000

    	let userAlt = global.db.users[m.sender] ||= {}
    	user.money = Number(user.money) || 0
    	user.antibegal = Number(user.antibegal) || 0

    	if (user.money < PRICE)
    		return replyalya(
    `❌ Uang tidak cukup!
    Harga: ${PRICE}
    Uang kamu: ${user.money}`
    		)
    	user.money -= PRICE
    	user.antibegal += 1

    	replyalya(
    `✅ Berhasil membeli *Anti Begal*
    🛡️ Stok Anti Begal: ${user.antibegal}
    💰 Sisa uang: ${user.money}`
    	)
  }
}
