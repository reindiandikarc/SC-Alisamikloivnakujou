// Plugin: >
// Auto-generated from Alya V12
// Commands: >

const path = require('path')

module.exports = {
  command: [">"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    var err = new TypeError
    err.name = "EvalError "
    err.message = "Code Not Found (404)"
    if (!q) return replyalya(util.format(err))
    var arg = command == ">" ? args.join(" ") : "return " + args.join(" ")
    try {
    var txtes = util.format(await eval(`(async()=>{ ${arg} })()`))
    replyalya(txtes)
    } catch(e) {
    let _syntax = ""
    let _err = util.format(e)
    let err = syntaxerror(arg, "EvalError", {
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    sourceType: "commonjs"
    })
    if (err) _syntax = err + "\n\n"
    replyalya(util.format(_syntax + _err))
  }
}
}
