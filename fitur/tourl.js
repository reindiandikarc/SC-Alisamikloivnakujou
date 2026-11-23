// Plugin: tourl
// Auto-generated from Alya V12
// Commands: tourl

const path = require('path')

module.exports = {
  command: ["tourl"],
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

    if (!quoted) return replyalya('Reply media (foto/video/file) yang ingin diupload.');

    const FormData = require("form-data");
    let mimeAlt = require("mime-types");
    const fs = require("fs");
    const path = require("path");
    const { fromBuffer } = require("file-type");
    const axios = require("axios");

    // === CONFIG UNTUK TERMAI API ===
    const termaiKey = "AIzaBj7z2z3xBjsk"; // jangan diganti
    const termaiDomain = 'https://c.termai.cc';

    async function uploadTermai(fileBuffer) {
        try {
            const { ext } = await fromBuffer(fileBuffer);
            const formData = new FormData();
            formData.append('file', fileBuffer, { filename: 'file.' + ext });

            const res = await axios.post(`${termaiDomain}/api/upload?key=${termaiKey}`, formData, {
                headers: formData.getHeaders(),
                timeout: 120000
            });

            if (res.data && res.data.status && res.data.path) {
                return res.data.path;
            }
            throw new Error("Upload ke Termai gagal");
        } catch (err) {
            console.error("Termai Error:", err.message);
            return null;
        }
    }

    // Upload ke qu.ax
    async function pomf2(filePath) {
        try {
            if (!fs.existsSync(filePath)) throw new Error("File tidak ditemukan");
            const contentType = mimeAlt.lookup(filePath) || "application/octet-stream";
            const fileName = path.basename(filePath);
            const form = new FormData();
            form.append("files[]", fs.createReadStream(filePath), {
                contentType,
                filename: fileName,
            });
            const response = await axios.post("https://qu.ax/upload.php", form, {
                headers: { ...form.getHeaders() },
            });
            if (!response.data.success || !response.data.files?.length) throw new Error("Upload ke qu.ax gagal");
            return response.data.files[0].url;
        } catch (err) {
            console.error("Pomf2 Error:", err.message);
            return null;
        }
    }

    // Upload ke catbox.moe
    async function uploadCatbox(buffer) {
        try {
            const form = new FormData();
            const { ext } = await fromBuffer(buffer);
            form.append("fileToUpload", buffer, "file." + ext);
            form.append("reqtype", "fileupload");
            const res = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders(),
            });
            return res.data;
        } catch (err) {
            console.error("Catbox Error:", err.message);
            return null;
        }
    }

    // Upload ke cdn.ypnk.biz.id
    async function uploadYpnk(buffer, filename) {
        try {
            const form = new FormData();
            form.append("files", buffer, { filename });
            const response = await axios.post("https://cdn.ypnk.biz.id/upload", form, {
                headers: {
                    ...form.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
                },
                timeout: 120000
            });
            if (response.data.success && response.data.files?.[0]) {
                return `https://cdn.ypnk.biz.id${response.data.files[0].url}`;
            }
            throw new Error("Upload ke cdn.ypnk.biz.id gagal");
        } catch (err) {
            console.error("Ypnk Error:", err.message);
            return null;
        }
    }

    // Upload ke tmpfiles.org
    async function uploadTmpFiles(filePath) {
        try {
            if (!fs.existsSync(filePath)) throw new Error("File tidak ditemukan");
            const form = new FormData();
            form.append("file", fs.createReadStream(filePath));
            const res = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
                headers: form.getHeaders(),
                timeout: 120000
            });
            if (res.data && res.data.data && res.data.data.url) {
                const idMatch = res.data.data.url.match(/\/(\d+)(?:\/|$)/);
                const fileName = path.basename(filePath);
                if (idMatch) {
                    return `https://tmpfiles.org/dl/${idMatch[1]}/${fileName}`;
                }
            }
            throw new Error("Upload ke tmpfiles.org gagal");
        } catch (err) {
            console.error("TmpFiles Error:", err.message);
            return null;
        }
    }

    // Upload ke put.icu
    async function uploadPutIcu(filePath) {
        try {
            if (!fs.existsSync(filePath)) throw new Error("File tidak ditemukan");
            const contentType = mimeAlt.lookup(filePath) || "application/octet-stream";
            const res = await axios.put(`https://put.icu/upload/`, fs.createReadStream(filePath), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': contentType
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 120000
            });
            if (res.data && res.data.direct_url) {
                return res.data.direct_url;
            }
            if (res.data && res.data.url) {
                return res.data.url;
            }
            throw new Error("Upload ke put.icu gagal");
        } catch (err) {
            console.error("PutIcu Error:", err.message);
            return null;
        }
    }

    try {
        const media = await alya.downloadAndSaveMediaMessage(quoted);
        const buffer = fs.readFileSync(media);
        const { ext } = await fromBuffer(buffer) || {};
        const filename = `file_${Date.now()}.${ext || 'bin'}`;

        let [quaxLink, catboxLink, ypnkLink, tmpFilesLink, putIcuLink, termaiLink] = await Promise.all([
            pomf2(media),
            uploadCatbox(buffer),
            uploadYpnk(buffer, filename),
            uploadTmpFiles(media),
            uploadPutIcu(media),
            uploadTermai(buffer) // === TERMAI API ===
        ]);

        if (!quaxLink && !catboxLink && !ypnkLink && !tmpFilesLink && !putIcuLink && !termaiLink) throw new Error("Semua uploader gagal");

        const formatLink = (link) => link ? link : 'Down / Bermasalah';

        let caption = `╭─ 「 UPLOAD SUCCESS 」
    📂 Size: ${(buffer.length / 1024).toFixed(2)} KB
    🌍 Qu.ax: ${formatLink(quaxLink)}
    🌍 CatBox: ${formatLink(catboxLink)}
    🌍 YPNK: ${formatLink(ypnkLink)}
    🌍 TmpFiles: ${formatLink(tmpFilesLink)} ( *60* Minutes )
    🌍 Put.icu: ${formatLink(putIcuLink)} ( *1* Days )
    🌍 Termai: ${formatLink(termaiLink)}
    ╰───────────────`;

        let msg = {
            interactiveMessage: proto.Message.InteractiveMessage.create({
                header: proto.Message.InteractiveMessage.Header.create({
                    hasMediaAttachment: false
                }),
                body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: "Tekan tombol di bawah untuk menyalin tautan."
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                        ...(quaxLink ? [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy Link qu.ax", copy_code: quaxLink }) }] : []),
                        ...(catboxLink ? [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy Link catbox", copy_code: catboxLink }) }] : []),
                        ...(ypnkLink ? [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy Link YPNK", copy_code: ypnkLink }) }] : []),
                        ...(tmpFilesLink ? [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy Link TmpFiles", copy_code: tmpFilesLink }) }] : []),
                        ...(putIcuLink ? [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy Link Put.icu", copy_code: putIcuLink }) }] : []),
                        ...(termaiLink ? [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy Link Termai", copy_code: termaiLink }) }] : []),
                    ]
                })
            })
        };

        await alya.relayMessage(m.chat, msg, { messageId: m.key.id });
        fs.unlinkSync(media);
    } catch (err) {
        replyalya(`❌ Gagal: ${err.message}`);
    }
  }
}
