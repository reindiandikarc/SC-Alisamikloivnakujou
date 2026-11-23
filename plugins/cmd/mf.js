// Plugin: mf
// Auto-generated from Alya V12
// Commands: mediafire, mf

const path = require('path')

module.exports = {
  command: ["mediafire", "mf"],
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

        if (!text || !text.includes("mediafire.com"))
            return replyalya(`📌 Contoh penggunaan:\n${prefix + command} https://www.mediafire.com/file/abc123/example.zip/file`);

        await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const cheerio = require("cheerio");
        let mimeAlt = require("mime-types");
        const fs = require("fs");
        const path = require("path");

        async function getDirectMediaFireLink(pageUrl) {
            try {
                const res = await fetch(pageUrl);
                const html = await res.text();
                const $ = cheerio.load(html);
                const directLink = $("a#downloadButton").attr("href");
                const fileName = $("div.filename").text().trim() || "mediafire_file";

                if (!directLink) throw new Error("Link unduhan tidak ditemukan.");
                return { fileName, directLink };
            } catch (err) {
                return { error: true, message: err.message };
            }
        }

        try {
            const result = await getDirectMediaFireLink(text.trim());

            if (!result || result.error || !result.directLink) {
                await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return replyalya(`❌ Gagal mengambil link download.\n${result?.message || "Link tidak valid atau server error."}`);
            }

            const fileName = result.fileName;
            const fileUrl = result.directLink;
            const mimeType = mimeAlt.lookup(fileName) || "application/octet-stream";
            const caption = `📦 *MediaFire Downloader*\n\n📁 *Nama File:* ${fileName}\n✅ *Status:* Siap diunduh`;

            // Pastikan folder ./temp/ ada
            const tempDir = path.join(__dirname, 'temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            // Simpan file ke ./temp/
            const safeName = fileName.replace(/[^a-z0-9._-]/gi, "_");
            const tempPath = path.join(tempDir, `mf_${Date.now()}_${safeName}`);

            const res = await fetch(fileUrl);
            if (!res.ok) throw new Error("Gagal mengunduh file dari MediaFire.");

            const fileStream = fs.createWriteStream(tempPath);
            await new Promise((resolve, reject) => {
                res.body.pipe(fileStream);
                res.body.on("error", reject);
                fileStream.on("finish", resolve);
            });

            const buffer = fs.readFileSync(tempPath);

            await alya.sendMessage(m.chat, {
                document: buffer,
                fileName,
                mimetype: mimeType,
                caption
            }, { quoted: m });

            fs.unlinkSync(tempPath); // hapus setelah terkirim
            await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            replyalya(`❌ Gagal mengirim file:\n${err.message}`);
        }
    }
    //==================================================================
  }
