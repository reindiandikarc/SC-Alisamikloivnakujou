// Plugin: listadmin
// Auto-generated from Alya V12
// Commands: listadmin

const path = require('path')

module.exports = {
  command: ["listadmin"],
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

        if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa digunakan di dalam grup!');
        let metadata = await alya.groupMetadata(m.chat);
        let admins = metadata.participants.filter(p => p.admin !== null);

        let adminList = admins.map((a, i) => {
            let jid = a.id.split('@')[0];
            let role, emoji;
            if (a.admin === 'superadmin') {
                role = '*Pemilik*';
                emoji = '👑';
            } else {
                role = '*Admin Biasa*';
                emoji = '👮';
            }
            return `${i + 1}. @${jid} ( ${emoji} ${role} )`;
        }).join('\n');

        let caption = `👑 *Daftar Admin Grup ${metadata.subject}*\n\n${adminList}`;
        alya.sendMessage(m.chat, { text: caption, mentions: admins.map(a => a.id) }, { quoted: m });
  }
}
