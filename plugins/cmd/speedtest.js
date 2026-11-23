// Plugin: speedtest
// Auto-generated from Alya V12
// Commands: speedtest

const path = require('path')

module.exports = {
  command: ["speedtest"],
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

    				replyalya('Testing Speed...')
    				let cp = require('child_process')
    				let { promisify } = require('util')
    				let exec = promisify(cp.exec).bind(cp)
    				let o
    				try {
    					o = await exec('python3 speed.py --share')
    				} catch (e) {
    					o = e
    				} finally {
    					let { stdout, stderr } = o
    					if (stdout.trim()) m.reply(stdout)
    					if (stderr.trim()) m.reply(stderr)
    				}
  }
}
