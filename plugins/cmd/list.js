// Plugin: list
// Auto-generated from Alya V12
// Commands: list

const path = require('path')

module.exports = {
  command: ["list"],
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
      waifuList, husbuList, pler, setting, user,
      db_respon_list, isAlreadyResponListGroup, listbut2
    } = ctx

        if (db_respon_list.length === 0) return m.reply(`*Belum ada list message di database*`)
        if (!isAlreadyResponListGroup((m.isGroup ? m.chat : botNumber), db_respon_list)) return m.reply(`*Belum ada list message yang terdaftar di group/chat ini*`)
        db_respon_list.sort((a, b) => a.key.localeCompare(b.key));
      var arr_rows = [];
    for (let x of db_respon_list) {
        if (x.id === (m.isGroup ? m.chat : botNumber)) {
            arr_rows.push({
                title: x.key.toUpperCase(),
                description: "",
                id: x.key
            });
        }
    }
    const teks = `Halo @${m.sender.split("@")[0]} 👋\n\nSilahkan pilih item yang kamu butuhkan 🌟`;
    const bet = {
        title: "LIST MENU",
        sections: [
            {
                title: "Daftar Respon",
                highlight_label: "",
                rows: arr_rows
            }
        ]
    };
    await listbut2(m.chat, teks, bet, m);
  }
}
