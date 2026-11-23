// Plugin: ttp
// Auto-generated from Alya V12
// Commands: ttp

const path = require('path')

module.exports = {
  command: ["ttp"],
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

    async function generateTextImage(text, size) {
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = `bold ${size}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        drawWrappedText(ctx, text, canvas.width / 2, canvas.height / 2, canvas.width - 20, size);

        return canvas.toBuffer();
    }
    function drawWrappedText(ctx, text, x, y, maxWidth, fontSize) {
        let words = text.split(' ');
        let lineHeight = fontSize * 1.5;
        ctx.font = `bold ${fontSize}px Arial`;

        let lines = [];
        let currentLine = '';
        for (let word of words) {
            let testLine = currentLine + word + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        let startY = y - (lines.length - 1) * lineHeight / 2;
        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }
    async function createSticker(img, text) {
        let stickerMetadata = {
            pack: packname,
            author: author,
        };
        return (new Sticker(img, stickerMetadata)).toBuffer();
    }
    const { createCanvas } = require('canvas');
    const { Sticker } = require('wa-sticker-formatter');
        let stiker = false;
        try {
            if (!args[0])return reply('Harap masukkan teks dan ukuran untuk diubah menjadi stiker.\nContoh: /attp tes|20');
            let [text, size] = args.join(' ').split('|');
            size = parseInt(size);
            if (!size || isNaN(size) || size < 1) throw 'Ukuran teks harus berupa angka positif.';
            let imgBuffer = await generateTextImage(text, size);
            stiker = await createSticker(imgBuffer, text);
        } catch (e) {
            console.log(e);
            stiker = e.message ? e.message : e.toString();
        } finally {
            m.reply(stiker);
        }
  }
}
