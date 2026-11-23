// Plugin: listsrv
// Auto-generated from Alya V12
// Commands: listsrv

const path = require('path')

module.exports = {
  command: ["listsrv"],
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

      if (!Ryuu) return replytolak(`Maaf, Anda tidak dapat melihat daftar server.`);
      let page = args[0] ? args[0] : '1';
      let f = await fetch(domain + "/api/application/servers?page=" + page, {
        "method": "GET",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apikey
        }
      });
      let res = await f.json();
      let servers = res.data;
      let sections = [];
      let messageText = "Berikut adalah daftar server:\n\n";

      for (let server of servers) {
        let s = server.attributes;

        let f3 = await fetch(domain + "/api/client/servers/" + s.uuid.split`-`[0] + "/resources", {
          "method": "GET",
          "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + capikey
          }
        });

        let data = await f3.json();
        let status = data.attributes ? data.attributes.current_state : s.status;

        messageText += `ID Server: ${s.id}\n`;
        messageText += `Nama Server: ${s.name}\n`;
        messageText += `Status: ${status}\n\n`;
      }

      messageText += `Halaman: ${res.meta.pagination.current_page}/${res.meta.pagination.total_pages}\n`;
      messageText += `Total Server: ${res.meta.pagination.count}`;

      await alya.sendMessage(m.chat, { text: messageText }, { quoted: m });

      if (res.meta.pagination.current_page < res.meta.pagination.total_pages) {
        reply(`Gunakan perintah ${prefix}listsrv ${res.meta.pagination.current_page + 1} untuk melihat halaman selanjutnya.`);
      }
  }
}
