// Plugin: restartvps
// Auto-generated from Alya V12
// Commands: restartvps

const path = require('path')

module.exports = {
  command: ["restartvps"],
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
    if (!text) return m.reply("iddroplet")
    let dropletId = text
    const restartVPS = async (dropletId) => {
    try {
    const apiUrl = `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`;

    const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${global.apiDigitalOcean}`
    },
    body: JSON.stringify({
    type: 'reboot'
    })
    });

    if (response.ok) {
    const data = await response.json();
    return data.action;
    } else {
    const errorData = await response.json();
    m.reply(`Gagal melakukan restart VPS: ${errorData.message}`);
    }
    } catch (err) {
    m.reply('Terjadi kesalahan saat melakukan restart VPS: ' + err);
    }
    };

    restartVPS(dropletId)
    .then((action) => {
    m.reply(`Aksi restart VPS berhasil dimulai. Status aksi: ${action.status}`);
    })
    .catch((err) => {
    m.reply(err);
    })

    }
  }
