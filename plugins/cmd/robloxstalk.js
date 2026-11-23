// Plugin: robloxstalk
// Auto-generated from Alya V12
// Commands: stalkroblox, robloxstalk

const path = require('path')

module.exports = {
  command: ["stalkroblox", "robloxstalk"],
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

        if (!text) {
            return replyalya(`Silakan masukkan username Roblox.
    *Contoh:*
    .robloxstalk Ninja_Noob443`);
        }

        try {
            await alya.sendMessage(m.chat, { react: { text: '🎮', key: m.key } });

            const apiUrl = `https://www.velyn.mom/api/stalker/roblox?apikey=alyaganteng&username=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (data.status !== 200) throw new Error('User tidak ditemukan atau API error.');

            const user = data.data.result;
            const lastOnline = data.data.lastOnline;
            const profilePicture = data.data.profileDetails;

            const caption = `
    ╭─ • 「 *Roblox Stalk* 」
    │
    ├ 👤 *Username:* ${user.name}
    ├ 🏷️ *Display Name:* ${user.displayName}
    ├ 📝 *Bio:* ${user.description || 'Tidak ada bio'}
    │
    ├ 📅 *Dibuat:* ${new Date(user.created).toLocaleString('id-ID')}
    ├ 🚫 *Banned:* ${user.isBanned ? '✅' : '❌'}
    ├ ✅ *Verified:* ${user.hasVerifiedBadge ? '✅' : '❌'}
    │
    ├ ⏱️ *Terakhir Online:* ${lastOnline && lastOnline !== 'N/A' ? lastOnline : 'Tidak diketahui'}
    │
    ╰─ •
            `.trim();

            if (profilePicture) {
                await alya.sendMessage(m.chat, {
                    image: { url: profilePicture },
                    caption: caption
                }, { quoted: m });
            } else {
                await replyalya(caption);
            }

        } catch (error) {
            console.error(error);
            replyalya(`Gagal melakukan stalk pada user *${text}*. Username mungkin salah atau tidak valid.`);
        }
  }
}
