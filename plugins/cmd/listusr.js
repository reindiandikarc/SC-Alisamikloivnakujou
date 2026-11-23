// Plugin: listusr
// Auto-generated from Alya V12
// Commands: listusr

const path = require('path')

module.exports = {
  command: ["listusr"],
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
      let page = args[0] ? args[0] : '1';
      let f = await fetch(domain + "/api/application/users?page=" + page, {
        "method": "GET",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apikey
        }
      });
      let res = await f.json();
      let users = res.data;
      let messageText = "Berikut list user:\n\n";

      for (let user of users) {
        let u = user.attributes;
        messageText += `ID: ${u.id} - Status: ${u.attributes?.user?.server_limit === null ? 'Inactive' : 'Active'}\n`;
        messageText += `${u.username}\n`;
        messageText += `${u.first_name} ${u.last_name}\n\n`;
      }

      messageText += `Page: ${res.meta.pagination.current_page}/${res.meta.pagination.total_pages}\n`;
      messageText += `Total Users: ${res.meta.pagination.count}`;

      await alya.sendMessage(m.chat, { text: messageText }, { quoted: m });

      if (res.meta.pagination.current_page < res.meta.pagination.total_pages) {
        reply(`Gunakan perintah ${prefix}listusr ${res.meta.pagination.current_page + 1} untuk melihat halaman selanjutnya.`);
      }
//             case 'delusr': {
      if (!Ryuu) return replytolak(`Khusus ${global.botname} Aja`)
    let usr = args[0]
    if (!usr) return reply('ID nya mana?')
    let f_local = await fetch(domain + "/api/application/users/" + usr, {
    "method": "DELETE",
    "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apikey
    }
    })
    let res_local = f_local.ok ? {
    errors: null
    } : await f_local.json()
    if (res_local.errors) return reply('*USER NOT FOUND*')
    reply('*SUCCESSFULLY DELETE THE USER*')
  }
}
