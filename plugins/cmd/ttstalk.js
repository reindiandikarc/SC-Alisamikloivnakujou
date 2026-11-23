// Plugin: ttstalk
// Auto-generated from Alya V12
// Commands: tiktokstalk, ttstalk

const path = require('path')

module.exports = {
  command: ["tiktokstalk", "ttstalk"],
  tags: ['info'],
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

        if (!text)
            return m.reply(`Contoh penggunaan:\n${prefix}ttstalk yuusuke_yamada1101`);

        await m.reply('⏳ Sabar ya bujank, lagi ngambil data...');

        try {
            const axios = require('axios');
            const url = `https://api.nexray.web.id/stalker/tiktok?username=${encodeURIComponent(text)}`;
            const { data } = await axios.get(url);

            if (!data || !data.status || !data.result)
                return m.reply('❌ User TikTok tidak ditemukan.');

            const r = data.result;
            const s = r.stats || {};

            let caption = `📌 *TIKTOK STALK*\n\n`;
            caption += `👤 *Nama* : ${r.name || '-'}\n`;
            caption += `🆔 *Username* : @${r.username}\n`;
            caption += `📝 *Bio* : ${r.bio || '-'}\n\n`;

            caption += `✅ *Verified* : ${r.verified}\n`;
            caption += `🔒 *Private* : ${r.private}\n`;
            caption += `🌍 *Region* : ${r.region}\n`;
            caption += `🏪 *Seller* : ${r.seller}\n`;
            caption += `🏢 *Organization* : ${r.organization}\n\n`;

            caption += `📊 *STATISTIK*\n`;
            caption += `👥 Followers : ${s.followers}\n`;
            caption += `➡️ Following : ${s.following}\n`;
            caption += `❤️ Likes : ${s.likes}\n`;
            caption += `🎥 Video : ${s.videos}\n`;
            caption += `🤝 Friend : ${s.friend}\n\n`;

            caption += `🔗 Link : ${r.link}`;

            await alya.sendMessage(m.chat, {
                image: { url: r.avatar },
                caption
            });

        } catch (err) {
            console.error(err);
            m.reply('❌ Terjadi kesalahan saat mengambil data TikTok.');
        }
  }
}
