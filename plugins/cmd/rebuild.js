// Plugin: rebuild
// Auto-generated from Alya V12
// Commands: rebuild

const path = require('path')

module.exports = {
  command: ["rebuild"],
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
    let rebuildVPS = async () => {
    try {
    const response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}/actions`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${global.apiDigitalOcean}`
    },
    body: JSON.stringify({
    type: 'rebuild',
    image: 'ubuntu-20-04-x64' // Ganti dengan slug image yang ingin digunakan untuk rebuild (misal: 'ubuntu-18-04-x64')
    })
    });

    if (response.ok) {
    const data = await response.json();
    m.reply('Rebuild VPS berhasil dimulai. Status aksi:', data.action.status);
    const vpsInfo = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${global.apiDigitalOcean}`
    }
    });
    if (vpsInfo.ok) {
    const vpsData = await vpsInfo.json();
    const droplet = vpsData.droplet;
    const ipv4Addresses = droplet.networks.v4.filter(network => network.type === 'public');
    const ipAddress = ipv4Addresses.length > 0 ? ipv4Addresses[0].ip_address : 'Tidak ada IP!';

    const textvps = `*VPS BERHASIL DI REBUILD*
    IP VPS: ${ipAddress}
    SYSTEM IMAGE: ${droplet.image.slug}`;
    await sleep(60000)
    alya.sendMessage(m.chat, { text: textvps }, {quoted: m});
    } else {
    m.reply('Gagal mendapatkan informasi VPS setelah rebuild!');
    }
    } else {
    const errorData = await response.json();
    m.reply('Gagal melakukan rebuild VPS : ' + errorData.message);
    }
    } catch (err) {
    m.reply('Terjadi kesalahan saat melakukan rebuild VPS : ' + err);
    }};
    rebuildVPS();
    }
  }
