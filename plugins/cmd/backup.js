// Plugin: backup
// Auto-generated from Alya V12
// Commands: backup

const path = require('path')

module.exports = {
  command: ["backup"],
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
    try {
      reply('Loading...')

      const { exec } = require("child_process")  // ganti execSync → exec async
      const fs = require("fs")
      const { promisify } = require("util")
      const execAsync = promisify(exec)

      const owner = global.ownernomer.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

      // ls async — tidak block event loop
      const { stdout: lsOut } = await execAsync("ls", { timeout: 10000 })
      const ls = lsOut.toString().split("\n").filter((pe) =>
        pe != "node_modules" &&
        pe != "Alyachan" &&
        pe != "AlyaChan.zip" &&
        pe != "package-lock.json" &&
        pe != "yarn.lock" &&
        pe != ""
      )

      // zip async — tidak block event loop, timeout 5 menit
      await execAsync(`zip -r AlyaChan.zip ${ls.join(" ")}`, { timeout: 300000 })

      await alya.sendMessage(owner, {
        document: await fs.promises.readFile('./AlyaChan.zip'),
        mimetype: "application/zip",
        fileName: "AlyaChan.zip",
      }, {
        quoted: m
      })

      // rm async
      await execAsync("rm -rf AlyaChan.zip", { timeout: 10000 })

    } catch (err) {
      reply('Terjadi kesalahan')
      console.error('Error: ', err)
    }
  }
}
