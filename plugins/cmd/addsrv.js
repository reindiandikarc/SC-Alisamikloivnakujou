// Plugin: addsrv
// Auto-generated from Alya V12
// Commands: addsrv

const path = require('path')

module.exports = {
  command: ["addsrv"],
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

    if (!Ryuu) return replytolak(`Ngapain ? Fitur Ini Khusus Tuan Saya😜`)
    let s = text.split(',');
    if (s.length < 7) return reply(`*Format salah!*

    Penggunaan:
    ${prefix + command} name,tanggal,userId,eggId,locationId,memory/disk,cpu`)
    let name = s[0];
    let desc = s[1] || ''
    let usr_id = s[2];
    let egg = s[3];
    let loc = s[4];
    let memo_disk = s[5].split`/`;
    let cpu = s[6];
    let f1 = await fetch(domain + "/api/application/nests/5/eggs/" + egg, {
    "method": "GET",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey
    }
    })
    let data = await f1.json();
    // = data.attributes.pStartup

    let f = await fetch(domain + "/api/application/servers", {
    "method": "POST",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey,
    },
    "body": JSON.stringify({
    "name": name,
    "description": "🏞️ BUYER alya 🏞️\n>|| PANEL NYA DI PAKEK YA BUB >•<",
    "user": usr_id,
    "egg": parseInt(egg),
    "node": global.nodes,
    "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
    "startup": "/usr/local/bin/${CMD_RUN};",
    "environment": {
    "INST": "npm",
    "USER_UPLOAD": "0",
    "AUTO_UPDATE": "0",
    "CMD_RUN": "npm start",
    },
    "limits": {
    "memory": memo_disk[0],
    "swap": 0,
    "disk": memo_disk[1],
    "io": 500,
    "cpu": cpu
    },
    "feature_limits": {
    "databases": 5,
    "backups": 5,
    "allocations": 5
    },
    deploy: {
    locations: [parseInt(loc)],
    dedicated_ip: false,
    port_range: [],
    },
    })
    })
    let res = await f.json()
    if (res.errors) return reply(JSON.stringify(res.errors[0], null, 2))
    let server = res.attributes
    reply(`*SUCCESSFULLY ADD SERVER*

    TYPE: ${res.object}

    ID: ${server.id}
    UUID: ${server.uuid}
    NAME: ${server.name}
    DESCRIPTION: ${server.description}
    MEMORY: ${server.limits.memory === 0 ? 'Unlimited' : server.limits.memory} MB
    DISK: ${server.limits.disk === 0 ? 'Unlimited' : server.limits.disk} MB
    CPU: ${server.limits.cpu}%
    CREATED AT: ${server.created_at}`)
  }
}
