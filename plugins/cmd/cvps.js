// Plugin: cvps
// Auto-generated from Alya V12
// Commands: cvps

const path = require('path')

module.exports = {
  command: ["cvps"],
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

    if (!text) return m.reply("hostname")
    return alya.sendMessage(m.chat, {
      buttons: [
        {
        buttonId: 'action',
        buttonText: { displayText: 'ini pesan interactiveMeta' },
        type: 4,
        nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              title: 'Pilih Spesifikasi Vps',
              sections: [
                {
                  title: 'List Ram & Cpu Vps',
                  highlight_label: 'Recommended',
                  rows: [
                    {
                      title: 'Ram 16GB || CPU 4',
                      id: `.r16c4 ${text}`
                    },
                    {
                      title: 'Ram 1GB || CPU 1',
                      id: `.r1c1 ${text}`
                    },
                    {
                      title: 'Ram 2GB || CPU 1',
                      id: `.r2c1 ${text}`
                    },
                    {
                      title: 'Ram 2GB || CPU 2',
                      id: `.r2c2 ${text}`
                    },
                    {
                      title: 'Ram 4GB || CPU 2',
                      id: `.r4c2 ${text}`
                    },
                    {
                      title: 'Ram 8GB || CPU 4',
                      id: `.r8c4 ${text}`
                    }
                  ]
                }
              ]
            })
          }
          }
      ],
      footer: `© 2024 ${botname}`,
      headerType: 1,
      viewOnce: true,
      text: "Pilih Spesifikasi Vps Yang Tersedia\n",
      contextInfo: {
       isForwarded: true,
       mentionedJid: [m.sender, global.owner+"@s.whatsapp.net"],
      },
    }, {quoted: m})
    }
  }
