// Plugin: igstalk
// Auto-generated from Alya V12
// Commands: coolcheck, igstalk

const path = require('path')

module.exports = {
  command: ["coolcheck", "igstalk"],
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

    const db = global.db
        if (!text) return m.reply(`Contoh:\n${prefix}igstalk reindiandikarc_id`);

        let biaya = 2
        if (db.users[m.sender].limit < biaya) {
            return replyalya(`❌ *Limit kamu tidak cukup!*\n\n💡 Limit dibutuhkan: ${biaya}\n📊 Limit kamu: ${db.users[m.sender].limit}`)
        }

        try {
            await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const url = `https://api.snowping.my.id/api/stalker/instagram?usn=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.status !== 200) return m.reply("❌ Gagal mengambil data IG.");

            let r = json.result;

            let caption = `📸 *INSTAGRAM STALKER*

    👤 *Username:* ${r.username}
    🧩 *Name:* ${r.name}

    🌐 *Profile:* ${r.profileUrl}

    📊 *Followers:* ${r.followers}
    📦 *Posts:* ${r.uploads}
    📈 *Engagement:* ${r.engagement}

    ━━━━━━━━━━━━━━
    💸 *Limit terpakai:* ${biaya}
    `;

            await alya.sendMessage(m.chat, {
                image: { url: r.avatar },
                caption: caption
            }, { quoted: m });

            db.users[m.sender].limit -= biaya

        } catch (e) {
            console.log(e);
            return m.reply("❌ Terjadi kesalahan, coba lagi.");
        }
  }
}
