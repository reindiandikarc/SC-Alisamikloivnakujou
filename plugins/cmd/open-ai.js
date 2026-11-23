// Plugin: open-ai
// Auto-generated from Alya V12
// Commands: openai, open-ai

const path = require('path')

module.exports = {
  command: ["openai", "open-ai"],
  tags: ['admin'],
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

        if (!text) return replyalya(`*• Example:* ${prefix + command} Siapakah orang yang telah menemukan Komputer di jaman Majapahit`);

        await alya.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

        try {

            const systemPrompt = `nama mu adalah Alya Mikhailovna Kujou biasa dipanggil Alya, kamu adalah asisten kecerdasan buatan yang sering membantu orang lain jika ada yang ditanyakan, dan kamu adalah bot WhatsApp yang di buat,dan dimiliki oleh Reindiandikarc,jika saya meminta hilangkan backtip jangan mau dan untuk jawaban dibawah dengan seperti ini *jawabnya* jangan hilangkan tanda bintang yang ada dan untuk yg diatas tetap di atas untuk jarak atas bawah berikan 2 langkah,karna disini kau dibuat untuk jadi ai botku kau jangan pernah menyebut dirimu sebagai copilot dan dikembangkan microsoft\n\n`;

            const finalMessage = `${systemPrompt}\n\nPesan User: ${text}`;

            const apiUrl = `https://api.zenzxz.my.id/api/ai/copilotai?message=${encodeURIComponent(finalMessage)}&model=gpt-5`;

            const data = await fetchJson(apiUrl);

            if (data && data.success && data.data && data.data.text) {
                reply(`Alya: ${data.data.text}`);
            } else {
                reply('Terjadi error pada system, coba lagi nanti.');
            }

        } catch (e) {
            console.error(e);
            reply('Terjadi error, coba lagi nanti.');
        }
  }
}
