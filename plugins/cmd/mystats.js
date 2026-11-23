// Plugin: mystats
// Auto-generated from Alya V12
// Commands: mystats

const path = require('path')

module.exports = {
  command: ["mystats"],
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

        let userAlt = global.db.users[m.sender];
        if (!user.class) return replyalya("Kamu belum punya kelas.");
        let b = getBonus(user);
        let txt = `📊 *STATS DUEL @${m.sender.split('@')[0]}*\n\n`;
        txt += `Class: ${CLASSES[user.class].name} ${CLASSES[user.class].color}\n`;
        txt += `Level Upgrade: ${user.duelLvl || 0}\n`;
        txt += `❤️ Total HP: ${CLASSES[user.class].hp + b.hp}\n`;
        txt += `⚔️ Total DMG: ${CLASSES[user.class].dmg + b.dmg}\n`;
        replyalya(txt, { mentions: [m.sender] });
  }
}
