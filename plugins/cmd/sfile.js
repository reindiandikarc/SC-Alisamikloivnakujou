// Plugin: sfile
// Auto-generated from Alya V12
// Commands: sfile

const path = require('path')

module.exports = {
  command: ["sfile"],
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

      if (!text) return m.reply(`Silakan masukkan link Sfile.\nContoh:\n${prefix + command} https://sfile.mobi/abc123`);

      const url = text.trim();
      if (!url.includes("sfile")) return m.reply('Link yang kamu berikan bukan link dari Sfile.');

      m.reply('📥 Sedang mengambil file dari Sfile, mohon tunggu...');

      try {
        const api = `https://ytdlpyton.nvlgroup.my.id/sfile?url=${encodeURIComponent(url)}&mode=url`;
        const { data } = await axios.get(api);

        if (!data.ok || !data.data || !data.data.url) throw 'Gagal mengambil link direct dari API.';

        const directUrl = data.data.url;

        // Ambil nama file dari URL jika tersedia, fallback ke 'download.file'
        let filename;
        try {
          const pathname = new URL(directUrl).pathname;
          filename = decodeURIComponent(pathname.split("/").pop());
          if (!filename.includes(".")) filename += ".bin"; // fallback ext
        } catch {
          filename = "download.file";
        }

        const fileBuffer = await axios.get(directUrl, { responseType: 'arraybuffer' });

        await alya.sendMessage(m.chat, {
          document: Buffer.from(fileBuffer.data),
          fileName: filename,
          mimetype: 'application/octet-stream'
        }, { quoted: m });

      } catch (err) {
        console.error("SFILE ERROR:", err);
        return m.reply("❌ Gagal mengunduh file dari Sfile.");
      }
  }
}
