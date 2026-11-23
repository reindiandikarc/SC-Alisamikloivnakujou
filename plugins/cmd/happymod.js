// Plugin: happymod
// Auto-generated from Alya V12
// Commands: happymod

const path = require('path')

module.exports = {
  command: ["happymod"],
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

    async function getMod(q) {
        try {
            const anu = `https://happymod.com/search.html?q=${q}`;
            const { data } = await axios.get(anu);
            const $ = cheerio.load(data);

            let result = [];

            $(".pdt-app-box").each((_, el) => {
                const title = $(el).find("h3").text().trim();
                const link = "https://happymod.com" + $(el).find('a').attr('href');
                const rate = $(el).find("span.a-search-num").text().trim();

                result.push({ title, link, rate });
            });

            return result;
        } catch (e) {
            console.error(e);
            return [];
        }
    }
        if (!text) return m.reply('Mau Cari Aplikasi Apa? \n\n *Example :* .hmod Minecraft');
        alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
        try {
            const data = await getMod(text);
            if (data.length === 0) {
                return m.reply('Gak Ketemu');
            }
            let teks = `*[ Happymod Search]*\n\n`;
            for (let i = 0; i < Math.min(data.length, 15); i++) {
                teks += `*${i + 1}. ${data[i].title}*\n`;
                teks += `Rating : ${data[i].rate}\n`;
                teks += `Link : ${data[i].link}\n\n`;
            }
            await alya.sendMessage(m.chat, { image: { url: "https://i.postimg.cc/c6q7zRC8/1741529921037.png" }, caption: teks });
        } catch (error) {
            console.error(error);
            m.reply('Error')
        }
  }
}
