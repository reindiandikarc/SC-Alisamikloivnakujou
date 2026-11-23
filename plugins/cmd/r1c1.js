// Plugin: r1c1
// Auto-generated from Alya V12
// Commands: r1c1

const path = require('path')

module.exports = {
  command: ["r1c1"],
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
    function generateRandomPassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%^&*';
    const length = 10;
    let password = '';
    for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
    }
    return password;
    }
    if (!text) return
        await sleep(1000)
        let images
        let region = "sgp1"
        if (command == "r1c1") {
        images = "s-1vcpu-1gb"
        } else if (command == "r2c1") {
        images = "s-1vcpu-2gb"
        } else if (command == "r2c2") {
        images = "s-2vcpu-2gb"
        } else if (command == "r4c2") {
        images = "s-2vcpu-4gb"
        } else if (command == "r8c4") {
        images = 's-4vcpu-8gb'
        } else {
        images = "s-4vcpu-16gb-amd"
        region = "sgp1"
        }
        let hostname = text.toLowerCase()
        if (!hostname) return m.reply("hostname")

        try {
            let dropletData = {
                name: hostname,
                region: region,
                size: images,
                image: 'ubuntu-20-04-x64',
                ssh_keys: null,
                backups: false,
                ipv6: true,
                user_data: null,
                private_networking: null,
                volumes: null,
                tags: ['T']
            };

            let password = await  generateRandomPassword()
            dropletData.user_data = `#cloud-config
    password: ${password}
    chpasswd: { expire: False }`;

            let response = await fetch('https://api.digitalocean.com/v2/droplets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + global.apiDigitalOcean
                },
                body: JSON.stringify(dropletData)
            });
            let responseData = await response.json();
            if (response.ok) {
                let dropletConfig = responseData.droplet;
                let dropletId = dropletConfig.id;
                await m.reply(`Memproses pembuatan vps...`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                let dropletResponse = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + global.apiDigitalOcean
                    }
                });

                let dropletData = await dropletResponse.json();
                let ipVPS = dropletData.droplet.networks.v4 && dropletData.droplet.networks.v4.length > 0
                    ? dropletData.droplet.networks.v4[0].ip_address
                    : "Tidak ada alamat IP yang tersedia";

                let messageText = `VPS berhasil dibuat!\n\n`;
                messageText += `ID: ${dropletId}\n`;
                messageText += `IP VPS: ${ipVPS}\n`;
                messageText += `Password: ${password}`;

                await alya.sendMessage(m.chat, { text: messageText });
            } else {
                throw new Error(`Gagal membuat VPS: ${responseData.message}`);
            }
        } catch (err) {
            console.error(err);
            m.reply(`Terjadi kesalahan saat membuat VPS: ${err}`);
        }
    }

    //==================================================================
  }
