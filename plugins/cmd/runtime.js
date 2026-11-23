// Plugin: runtime
// Auto-generated from Alya V12
// Commands: rt, runtime

const path = require('path')

module.exports = {
  command: ["rt", "runtime"],
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

        const os = require('os')

        function formatUptime(seconds) {
            seconds = Math.floor(seconds)

            const hari = Math.floor(seconds / 86400)
            const jam = Math.floor((seconds % 86400) / 3600)
            const menit = Math.floor((seconds % 3600) / 60)
            const detik = Math.floor(seconds % 60)

            return `${hari} Hari ${jam} Jam ${menit} Menit ${detik} Detik`
        }

        const uptime = formatUptime(process.uptime())

        const load = os.loadavg()[0] || 0
        const cores = os.cpus().length || 1
        const beban = load / cores

        let status = ''
        let icon = ''

        if (beban < 0.5) {
            status = 'Lancar'
            icon = '🟢'
        } else if (beban < 1) {
            status = 'Normal'
            icon = '🟡'
        } else {
            status = 'Lambat'
            icon = '🔴'
        }

        let teks = `
    ╭━━━〔 ⏱️ STATUS BOT 〕━━━╮
    ┃
    ┃ ${icon} Status : ${status}
    ┃ ⏳ Aktif  : ${uptime}
    ┃
    ╰━━━━━━━━━━━━━━━━━━━━━━━╯

    🤖 Alya Chan Assistant.
    `.trim()

        replyalya(teks)
    }

//                 case 'stupidcheck':case 'uncleancheck':
  }
