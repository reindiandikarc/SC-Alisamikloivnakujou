// Plugin: megadl
// Auto-generated from Alya V12
// Commands: megadl

const path = require('path')

module.exports = {
  command: ["megadl"],
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

        if (!args[0]) return m.reply("Masukkan link!");

        const megaUrl = args[0];
        if (!megaUrl.includes("mega.nz")) return m.reply("Link tidak valid!");

        try {
            const { File } = require('megajs');
            const path = require('path');

            let fileName = `file_${Date.now()}.bin`;
            let mimeType = "application/octet-stream";
            const chunks = [];

            reply('⏳ Sedang mengunduh file');

            const file = File.fromURL(megaUrl);

            file.loadAttributes((err, f) => {
                if (err) return m.reply("Gagal mengambil metadata");

                fileName = f.name;
                const ext = path.extname(fileName).slice(1).toLowerCase();
                const mimeMap = {
                    mp4: 'video/mp4',
                    mp3: 'audio/mpeg',
                    zip: 'application/zip',
                    pdf: 'application/pdf',
                    apk: 'application/vnd.android.package-archive',
                    txt: 'text/plain',
                    jpg: 'image/jpeg',
                    png: 'image/png'
                };
                mimeType = mimeMap[ext] || "application/octet-stream";

                const stream = f.download();

                stream.on('data', chunk => chunks.push(chunk));
                stream.on('end', async () => {
                    const buffer = Buffer.concat(chunks);

                    await alya.sendMessage(m.chat, {
                        document: buffer,
                        fileName,
                        mimetype: mimeType
                    });

                    console.log(`✅ File '${fileName}' berhasil dikirim.`);
                });

                stream.on('error', err => {
                    m.reply("❌ Gagal mengunduh file\n" + err.message);
                });
            });

        } catch (e) {
            m.reply("❌ Terjadi kesalahan internal:\n" + e.message);
        }
  }
}
