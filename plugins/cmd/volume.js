// Plugin: volume
// Auto-generated from Alya V12
// Commands: volume

const path = require('path')

module.exports = {
  command: ["volume"],
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

    if (!args.join(" ")) return replyalya(`Example: ${prefix + command} 10`)
    media = await alya.downloadAndSaveMediaMessage(quoted, "volume")
    if (isQuotedAudio) {
    rname = getRandom('.mp3')
    exec(`ffmpeg -i ${media} -filter:a volume=${args[0]} ${rname}`, (err, stderr, stdout) => {
    fs.unlinkSync(media)
    if (err) return replyalya('Error!')
    jadie = fs.readFileSync(rname)
    alya.sendMessage(from, {audio:jadie, mimetype: 'audio/mp4', ptt: true}, {quoted: m})
    fs.unlinkSync(rname)
    })
    } else if (isQuotedVideo) {
    rname = getRandom('.mp4')
    exec(`ffmpeg -i ${media} -filter:a volume=${args[0]} ${rname}`, (err, stderr, stdout) => {
    fs.unlinkSync(media)
    if (err) return replyalya('Error!')
    jadie = fs.readFileSync(rname)
    alya.sendMessage(from, {video:jadie, mimetype: 'video/mp4'}, {quoted: m})
    fs.unlinkSync(rname)
    })
    } else {
    replyalya("Send video/audio")
    }
    }
}
