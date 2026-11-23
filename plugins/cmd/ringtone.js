// Plugin: ringtone
// Auto-generated from Alya V12
// Commands: ringtone

const path = require('path')

module.exports = {
  command: ["ringtone"],
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

    		if (!text) return replyalya(`Example : ${prefix + command} black rover`)
            let { ringtone } = require('../../lib/scraper')
    		let anutone2 = await ringtone(text)
    		let result = anutone2[Math.floor(Math.random() * anutone2.length)]
    		alya.sendMessage(m.chat, { audio: { url: result.audio }, fileName: result.title+'.mp3', mimetype: 'audio/mpeg' }, { quoted: m })
    if (!text) return replyalya(`Which genshin are you lookin for?`)
    try {
    const genshin = require("genshin-api")
    a = text.toLowerCase();
    const anime = await genshin.Characters(text)
    let txt = ""
    txt += `🎀 *Nama:* ${anime.name}\n`
    txt += `🎖️ *Judul:* ${anime.title}\n`
    txt += `💠 *Versi:* ${anime.vision}\n`
    txt += `🏹 *Weapon:* ${anime.weapon}\n`
    txt += `💮 *Gender:* ${anime.gender}\n`
    txt += `🌏 *Nation:* ${anime.nation}\n`
    txt += `🪷 *Affiliation:* ${anime.affiliation}\n`
    txt += `🌟 *Rarity:* ${anime.rarity}\n`
    txt += `❄️ *Constellation:* ${anime.constellation}\n`
    txt += `📖 *Description:* ${anime.description}\n`
    txt += `🌐 *Url:* https://genshin-impact.fandom.com/wiki/${a}\n`
    urll = `https://api.genshin.dev/characters/${a}/portrait`
    await alya.sendMessage(m.chat,{image:{url:urll}, caption:txt},{quoted:m})
    } catch (err) {
    console.log(err)
    return replyalya('Error')
}
}
}
