// Plugin: myself
// Auto-generated from Alya V12
// Commands: myself

const path = require('path')

module.exports = {
  command: ["myself"],
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

      let pushnameAlt = m.pushName || 'Unknown';
      const jid = m.sender;
      const number = jid.split('@')[0];
      const messageId = m.id.toUpperCase();

      let reasons = [];
      let isBotDetected = false;
      let platform = 'Unknown';

      const nonHexChars = messageId.match(/[^0-9A-F-]/gi)
      if (nonHexChars) {
        const uniqueChars = [...new Set(nonHexChars)].join('');
        reasons.push(`Format ID Invalid: Mengandung [ ${uniqueChars} ]`);
        isBotDetected = true;
      }

      if (messageId.length < 32) {
        reasons.push(`Panjang ID Tidak Wajar (${messageId.length} karakter)`);
        isBotDetected = true;
      }

      if (messageId.startsWith('3EB0')) {
        reasons.push('Terdeteksi ID WhatsApp Web (3EB0)');
        platform = 'Web / PC';
        isBotDetected = true;
      } else if (messageId.startsWith('3EB2')) {
        reasons.push('Terdeteksi ID WhatsApp iPhone (3EB2)');
        platform = 'iPhone / iOS';
        isBotDetected = true;
      } else if (messageId.startsWith('BAE5')) {
        reasons.push('Terdeteksi ID Baileys Lama (BAE5)');
        platform = 'Bot';
        isBotDetected = true;
      } else {
        if (m.isAndroid) platform = 'Android';
        else if (m.isIOS) platform = 'iPhone / iOS';
        else platform = 'Android';
      }

      let replyMsg = `📌 *Info User*\n\n`;
      replyMsg += `👤 Nama : ${pushname}\n`;
      replyMsg += `🆔 JID : ${jid}\n`;
      replyMsg += `📞 Nomor HP : ${number}\n`;
      replyMsg += `💬 Message ID : ${messageId}\n`;
      replyMsg += `📱 Platform : ${platform}\n\n`;

      if (reasons.length > 0) {
        replyMsg += `⚠️ *Deteksi ID / Bot*\n- ${reasons.join('\n- ')}`;
      } else {
        replyMsg += `✅ ID & Format normal`;
      }

      alya.sendMessage(m.chat, { text: replyMsg, quoted: m });
  }
}
