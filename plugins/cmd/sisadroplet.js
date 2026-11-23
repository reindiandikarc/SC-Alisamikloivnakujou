// Plugin: sisadroplet
// Auto-generated from Alya V12
// Commands: sisadroplet

const path = require('path')

module.exports = {
  command: ["sisadroplet"],
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
    async function getDropletInfo() {
    try {
    const accountResponse = await axios.get('https://api.digitalocean.com/v2/account', {
    headers: {
    Authorization: `Bearer ${global.apiDigitalOcean}`,
    },
    });

    const dropletsResponse = await axios.get('https://api.digitalocean.com/v2/droplets', {
    headers: {
    Authorization: `Bearer ${global.apiDigitalOcean}`,
    },
    });

    if (accountResponse.status === 200 && dropletsResponse.status === 200) {
    const dropletLimit = accountResponse.data.account.droplet_limit;
    const dropletsCount = dropletsResponse.data.droplets.length;
    const remainingDroplets = dropletLimit - dropletsCount;

    return {
    dropletLimit,
    remainingDroplets,
    totalDroplets: dropletsCount,
    };
    } else {
    return new Error('Gagal mendapatkan data akun digital ocean atau droplet!');
    }
    } catch (err) {
    return err;
    }}
    async function sisadropletHandler() {
    try {
    if (!Ryuu) return replytolak(mess.only.owner)

    const dropletInfo = await getDropletInfo();
    m.reply(`Sisa droplet yang dapat kamu pakai: ${dropletInfo.remainingDroplets}

    Total droplet terpakai: ${dropletInfo.totalDroplets}`);
    } catch (err) {
    reply(`Terjadi kesalahan: ${err}`);
    }}
    sisadropletHandler();
    }
  }
