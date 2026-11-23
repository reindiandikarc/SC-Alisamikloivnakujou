// Plugin: heal
// Auto-generated from Alya V12
// Commands: heal

const path = require('path')

module.exports = {
  command: ["heal"],
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

        user.health = user.health || 0;
        user.potion = user.potion || 0;

        let healPerPotion = 20;
        let maxHealth = 100;

        if (user.health >= maxHealth) {
            return replytolak(`❤️ Nyawa kamu sudah penuh: *${user.health}/${maxHealth}*`);
        }
        if (user.potion <= 0) {
            return replytolak(`🧪 Kamu tidak memiliki Potion!\nSilakan beli dengan cara *${prefix}buy potion 1*`);
        }

        let count;
        if (args[0] && !isNaN(args[0])) {
            count = parseInt(args[0]);
        } else {
            let butuhHealth = maxHealth - user.health;
            count = Math.ceil(butuhHealth / healPerPotion);
        }
        if (count <= 0) return replytolak(`⚠️ Jumlah potion harus lebih dari 0!`);

        if (count > user.potion) {
            count = user.potion;
        }
        let healAmount = count * healPerPotion;

        user.potion -= count;
        user.health += healAmount;

        if (user.health > maxHealth) {
            user.health = maxHealth;
        }
        replyalya(`✅ *HEAL BERHASIL*

    🧪 Potion Digunakan: *${count}*
    ❤️ Health Sekarang: *${user.health}/${maxHealth}*
    🎒 Sisa Potion: *${user.potion}*`);
  }
}
