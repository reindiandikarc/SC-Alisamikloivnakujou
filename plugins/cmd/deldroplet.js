// Plugin: deldroplet
// Auto-generated from Alya V12
// Commands: deldroplet

const path = require('path')

module.exports = {
  command: ["deldroplet"],
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
    let deleteDroplet = async () => {
    try {
    let response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
    method: 'DELETE',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${global.apiDigitalOcean}`
    }
    });

    if (response.ok) {
    m.reply('Droplet berhasil dihapus!');
    } else {
    const errorData = await response.json();
    return new Error(`Gagal menghapus droplet: ${errorData.message}`);
    }
    } catch (error) {
    console.error('Terjadi kesalahan saat menghapus droplet:', error);
    m.reply('Terjadi kesalahan saat menghapus droplet.');
    }};
    deleteDroplet();
    }
  }
