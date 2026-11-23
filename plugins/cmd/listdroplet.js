// Plugin: listdroplet
// Auto-generated from Alya V12
// Commands: listdroplet

const path = require('path')

module.exports = {
  command: ["listdroplet"],
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
    const getDroplets = async () => {
    try {
    const response = await fetch('https://api.digitalocean.com/v2/droplets', {
    headers: {
    Authorization: "Bearer " + global.apiDigitalOcean
    }
    });
    const data = await response.json();
    return data.droplets || [];
    } catch (err) {
    m.reply('Error fetching droplets: ' + err);
    return [];
    }
    };

    getDroplets().then(droplets => {
    let totalvps = droplets.length;
    let mesej = `List droplet digital ocean kamu: ${totalvps}\n\n`;

    if (droplets.length === 0) {
    mesej += 'Tidak ada droplet yang tersedia!';
    } else {
    droplets.forEach(droplet => {
    const ipv4Addresses = droplet.networks.v4.filter(network => network.type === "public");
    const ipAddress = ipv4Addresses.length > 0 ? ipv4Addresses[0].ip_address : 'Tidak ada IP!';
    mesej += `Droplet ID: ${droplet.id}
    Hostname: ${droplet.name}
    Username: Root
    IP: ${ipAddress}
    Ram: ${droplet.memory} MB
    Cpu: ${droplet.vcpus} CPU
    OS: ${droplet.image.distribution}
    Storage: ${droplet.disk} GB
    Status: ${droplet.status}\n`;
    });
    }
    alya.sendMessage(m.chat, { text: mesej }, {quoted: m});
    });
    } catch (err) {
    m.reply('Terjadi kesalahan saat mengambil data droplet: ' + err);
    }
    }
  }
